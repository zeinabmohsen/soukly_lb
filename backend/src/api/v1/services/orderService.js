const { Op } = require("sequelize");
const sequelize = require("../../../config/database");
const { Order, OrderItem, Product, Store, User } = require("../models");

const SHIPPING_FEE = 5.00;

const ORDER_INCLUDE = [
  {
    model: Store,
    as: "store",
    attributes: ["id", "name", "slug", "logo_url", "whatsapp"],
  },
  {
    model: OrderItem,
    as: "items",
  },
  {
    model: User,
    as: "buyer",
    attributes: ["id", "name", "email", "phone"],
  },
];

// Valid seller-driven status transitions
const SELLER_TRANSITIONS = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped"],
  shipped:    ["delivered"],
};

// ── Create: one order per store in a single transaction ───────────────────────
async function createOrders(buyerId, { items, shipping_address, payment_method, notes }) {
  if (!items || items.length === 0) {
    const err = new Error("Cart is empty");
    err.status = 400;
    throw err;
  }

  const productIds = items.map((i) => i.product_id);
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds }, status: "active" },
    include: [{ model: Store, as: "store", attributes: ["id", "name", "slug", "is_approved"] }],
  });

  // Validate every requested product. Collect ALL stock conflicts before
  // throwing so the client can show them together (and auto-cap each line)
  // instead of bouncing the user back N times for N conflicting items.
  const productMap = new Map(products.map((p) => [p.id, p]));
  const stockConflicts = [];
  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      const err = new Error(`Product ${item.product_id} not found or unavailable`);
      err.status = 422;
      throw err;
    }
    if (!product.store.is_approved) {
      const err = new Error(`Store for product "${product.name}" is not active`);
      err.status = 422;
      throw err;
    }
    if (product.stock < item.quantity) {
      stockConflicts.push({
        product_id: product.id,
        name: product.name,
        requested: item.quantity,
        available: product.stock,
      });
    }
  }
  if (stockConflicts.length > 0) {
    const names = stockConflicts.map((c) => `"${c.name}" (only ${c.available} left)`).join(", ");
    const err = new Error(`Some items have insufficient stock: ${names}. Please update your cart.`);
    err.status = 422;
    err.code = "INSUFFICIENT_STOCK";
    err.items = stockConflicts;
    throw err;
  }

  // Group items by store
  const byStore = new Map();
  for (const item of items) {
    const product = productMap.get(item.product_id);
    const storeId = product.store_id;
    if (!byStore.has(storeId)) byStore.set(storeId, []);
    byStore.get(storeId).push({ item, product });
  }

  const createdOrders = await sequelize.transaction(async (t) => {
    const orders = [];

    for (const [storeId, lineItems] of byStore) {
      const subtotal = lineItems.reduce(
        (sum, { item, product }) => sum + parseFloat(product.price) * item.quantity,
        0
      );
      const total = subtotal + SHIPPING_FEE;

      const order = await Order.create(
        {
          buyer_id: buyerId,
          store_id: storeId,
          status: "pending",
          subtotal: subtotal.toFixed(2),
          shipping_fee: SHIPPING_FEE,
          total: total.toFixed(2),
          shipping_address,
          payment_method: payment_method || "cash_on_delivery",
          notes: notes || null,
        },
        { transaction: t }
      );

      const orderItems = await OrderItem.bulkCreate(
        lineItems.map(({ item, product }) => ({
          order_id: order.id,
          product_id: product.id,
          product_snapshot: {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image_url: product.images?.[0]?.url || null,
            sku: product.sku || null,
            slug: product.slug,
          },
          quantity: item.quantity,
          unit_price: parseFloat(product.price),
          total_price: parseFloat(product.price) * item.quantity,
        })),
        { transaction: t }
      );

      // Atomic conditional decrement — the WHERE clause includes `stock >= qty`
      // so if a concurrent order already drained the inventory, this UPDATE
      // affects 0 rows and we abort the transaction. Prevents oversell when
      // two buyers race for the last unit.
      for (const { item, product } of lineItems) {
        const qty = Number(item.quantity);
        const [affected] = await Product.update(
          {
            stock:       sequelize.literal(`stock - ${qty}`),
            sales_count: sequelize.literal(`sales_count + ${qty}`),
          },
          {
            where: { id: product.id, stock: { [Op.gte]: qty } },
            transaction: t,
          }
        );
        if (affected === 0) {
          const fresh = await Product.findByPk(product.id, { transaction: t });
          const available = fresh?.stock ?? 0;
          const err = new Error(
            `"${product.name}" sold out while you were checking out (only ${available} left). Please update your cart.`
          );
          err.status = 422;
          err.code = "INSUFFICIENT_STOCK";
          err.items = [{
            product_id: product.id,
            name: product.name,
            requested: qty,
            available,
          }];
          throw err;
        }
      }

      orders.push({ ...order.toJSON(), items: orderItems });
    }

    return orders;
  });

  return createdOrders;
}

// ── Buyer: own orders ─────────────────────────────────────────────────────────
async function fetchBuyerOrders(buyerId, { limit, offset, status }) {
  const where = { buyer_id: buyerId };
  if (status) where.status = status;

  const { rows: items, count: total } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: ORDER_INCLUDE,
  });

  return { items, total };
}

// ── Buyer: single order (own only) ───────────────────────────────────────────
async function fetchOrderById(id, buyerId) {
  return Order.findOne({
    where: { id, buyer_id: buyerId },
    include: ORDER_INCLUDE,
  });
}

// ── Admin: every order across all stores ─────────────────────────────────────
async function fetchAllOrdersAdmin({ limit, offset, status, search, storeId }) {
  const where = {};
  if (status) where.status = status;
  if (storeId) where.store_id = storeId;
  if (search) {
    where[Op.or] = [
      { id: { [Op.iLike]: `${search}%` } },
      { shipping_address: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows: items, count: total } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: ORDER_INCLUDE,
  });

  return { items, total };
}

// ── Seller: orders in their store ────────────────────────────────────────────
async function fetchSellerOrders(storeId, { limit, offset, status }) {
  const where = { store_id: storeId };
  if (status) where.status = status;

  const { rows: items, count: total } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: ORDER_INCLUDE,
  });

  return { items, total };
}

// ── Seller: advance order status ──────────────────────────────────────────────
async function updateOrderStatus(id, storeId, newStatus) {
  const order = await Order.findOne({ where: { id, store_id: storeId } });
  if (!order) return null;

  const allowed = SELLER_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition from "${order.status}" to "${newStatus}"`);
    err.status = 422;
    throw err;
  }

  return order.update({ status: newStatus });
}

// ── Buyer: cancel own pending order ─────────────────────────────────────────
async function cancelOrder(id, buyerId) {
  const order = await Order.findOne({
    where: { id, buyer_id: buyerId },
    include: [{ model: OrderItem, as: "items" }],
  });

  if (!order) return null;

  if (order.status !== "pending") {
    const err = new Error(`Cannot cancel an order with status "${order.status}"`);
    err.status = 422;
    throw err;
  }

  await sequelize.transaction(async (t) => {
    // Restore stock
    for (const item of order.items) {
      if (item.product_id) {
        await Product.increment(
          { stock: item.quantity },
          { where: { id: item.product_id }, transaction: t }
        );
        await Product.decrement(
          { sales_count: item.quantity },
          { where: { id: item.product_id }, transaction: t }
        );
      }
    }
    await order.update({ status: "cancelled" }, { transaction: t });
  });

  return order.reload({ include: ORDER_INCLUDE });
}

module.exports = {
  createOrders,
  fetchBuyerOrders,
  fetchOrderById,
  fetchSellerOrders,
  fetchAllOrdersAdmin,
  updateOrderStatus,
  cancelOrder,
};
