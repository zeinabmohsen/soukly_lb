const { Op } = require("sequelize");
const { Product, Store, StoreCategory, GlobalCategory } = require("../models");

// Public visibility: store must be approved AND have a live subscription
const LIVE_STORE_WHERE = {
  is_approved: true,
  subscription_status: { [Op.in]: ["trialing", "active"] },
};

// ── Public: marketplace listing ───────────────────────────────────────────────
async function fetchAllProducts({ limit, offset, search, globalCategorySlug, storeId }) {
  const where = { status: "active" };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (storeId) where.store_id = storeId;

  const storeWhere = { ...LIVE_STORE_WHERE };
  const categoryWhere = globalCategorySlug ? { slug: globalCategorySlug } : undefined;

  const { rows: items, count: total } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ["is_featured", "DESC"],
      ["sales_count", "DESC"],
      ["created_at", "DESC"],
    ],
    include: [
      {
        model: Store,
        as: "store",
        where: storeWhere,
        required: true,
        attributes: ["id", "name", "slug", "logo_url", "rating"],
        include: categoryWhere
          ? [{ model: GlobalCategory, as: "category", where: categoryWhere, required: true, attributes: ["id", "name", "slug"] }]
          : [{ model: GlobalCategory, as: "category", attributes: ["id", "name", "slug"] }],
      },
      { model: StoreCategory, as: "category", attributes: ["id", "name", "slug"] },
    ],
  });

  return { items, total };
}

// ── Public: products in a specific store ─────────────────────────────────────
async function fetchProductsByStore(storeId, { limit, offset, categorySlug, search }) {
  const where = { store_id: storeId, status: "active" };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const categoryInclude = {
    model: StoreCategory,
    as: "category",
    attributes: ["id", "name", "slug"],
  };

  if (categorySlug) {
    categoryInclude.where = { slug: categorySlug };
    categoryInclude.required = true;
  }

  const { rows: items, count: total } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ["is_featured", "DESC"],
      ["created_at", "DESC"],
    ],
    include: [categoryInclude],
  });

  return { items, total };
}

// ── Public: single product detail ────────────────────────────────────────────
// Hides products whose parent store hasn't been approved yet — the include
// uses required:true so a non-approved store collapses the row, returning null.
async function fetchProductById(id) {
  return Product.findOne({
    where: { id, status: { [Op.ne]: "draft" } },
    include: [
      {
        model: Store,
        as: "store",
        where: LIVE_STORE_WHERE,
        required: true,
        attributes: ["id", "name", "slug", "logo_url", "rating", "is_approved"],
        include: [
          { model: GlobalCategory, as: "category", attributes: ["id", "name", "slug"] },
        ],
      },
      { model: StoreCategory, as: "category", attributes: ["id", "name", "slug"] },
    ],
  });
}

// ── Seller: own products (includes drafts) ────────────────────────────────────
async function fetchSellerProducts(storeId, { limit, offset, search, status, categoryId }) {
  const where = { store_id: storeId };

  if (status) where.status = status;
  if (categoryId) where.store_category_id = categoryId;

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows: items, count: total } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      { model: StoreCategory, as: "category", attributes: ["id", "name", "slug"] },
    ],
  });

  return { items, total };
}

// ── Seller: create ────────────────────────────────────────────────────────────
async function createProduct({ store_id, store_category_id, name, slug, description, price, compare_at_price, stock, sku, images, features, colors, customizations, status, is_featured }) {
  return Product.create({
    store_id,
    store_category_id: store_category_id || null,
    name,
    slug,
    description,
    price,
    compare_at_price: compare_at_price || null,
    stock: stock ?? 0,
    sku: sku || null,
    images: images || [],
    features: features || [],
    colors: colors || [],
    customizations: customizations || [],
    status: status || "active",
    is_featured: is_featured || false,
  });
}

// ── Seller: update (scoped to store) ─────────────────────────────────────────
async function updateProduct(id, storeId, data) {
  const product = await Product.findOne({ where: { id, store_id: storeId } });
  if (!product) return null;

  const allowed = ["store_category_id", "name", "description", "price", "compare_at_price", "stock", "sku", "images", "features", "colors", "customizations", "status", "is_featured"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  // Auto-sync status when stock hits zero
  if (updates.stock === 0 && product.status === "active") {
    updates.status = "out_of_stock";
  }
  if (updates.stock > 0 && product.status === "out_of_stock") {
    updates.status = "active";
  }

  return product.update(updates);
}

// ── Seller: delete (scoped to store) ─────────────────────────────────────────
async function deleteProduct(id, storeId) {
  const product = await Product.findOne({ where: { id, store_id: storeId } });
  if (!product) return null;
  await product.destroy();
  return true;
}

// ── Internal: update cached rating after review save ─────────────────────────
async function refreshProductRating(productId, { rating, review_count }) {
  await Product.update({ rating, review_count }, { where: { id: productId } });
}

// ── Internal: increment sales_count after order confirmed ─────────────────────
async function incrementSales(productId, quantity) {
  await Product.increment({ sales_count: quantity, stock: -quantity }, { where: { id: productId } });
}

module.exports = {
  fetchAllProducts,
  fetchProductsByStore,
  fetchProductById,
  fetchSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  refreshProductRating,
  incrementSales,
};
