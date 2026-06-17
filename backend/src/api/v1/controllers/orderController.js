const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const { fetchStoreByOwner } = require("../services/storeService");
const {
  createOrders,
  fetchBuyerOrders,
  fetchOrderById,
  fetchSellerOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../services/orderService");

// ── Buyer ─────────────────────────────────────────────────────────────────────

// POST /orders — checkout: creates one order per store from cart items
const checkout = asyncHandler(async (req, res) => {
  const { items, shipping_address, payment_method, notes, coupon_code } = req.body;

  if (!shipping_address?.name || !shipping_address?.phone || !shipping_address?.address) {
    return res.status(400).json({ message: "shipping_address requires name, phone, and address" });
  }

  const orders = await createOrders(req.user.id, {
    items,
    shipping_address,
    payment_method,
    notes,
    coupon_code,
  });

  res.status(201).json({
    message: `${orders.length} order(s) placed successfully`,
    orders,
  });
});

// GET /orders/mine — buyer's order history
const getMyOrders = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const status = req.query.status || null;

  const { items, total } = await fetchBuyerOrders(req.user.id, { limit, offset, status });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /orders/:id — buyer views a specific order
const getOrderById = asyncHandler(async (req, res) => {
  const order = await fetchOrderById(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
});

// PATCH /orders/:id/cancel — buyer cancels (pending only)
const cancel = asyncHandler(async (req, res) => {
  const order = await cancelOrder(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
});

// ── Seller ────────────────────────────────────────────────────────────────────

// GET /orders/store — all orders placed in seller's store
const getStoreOrders = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const { limit, offset } = buildPaginationParams(req.query);
  const status = req.query.status || null;

  const { items, total } = await fetchSellerOrders(store.id, { limit, offset, status });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// PATCH /orders/:id/status — seller advances order status
const advanceStatus = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  const order = await updateOrderStatus(req.params.id, store.id, status);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json(order);
});

module.exports = { checkout, getMyOrders, getOrderById, cancel, getStoreOrders, advanceStatus };
