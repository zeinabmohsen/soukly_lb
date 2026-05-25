const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const { fetchStoreByOwner, fetchStoreBySlug } = require("../services/storeService");
const {
  fetchAllProducts,
  fetchProductsByStore,
  fetchProductById,
  fetchSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

// ── Public ────────────────────────────────────────────────────────────────────

// GET /products  — marketplace: all active products, cross-store
const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const globalCategorySlug = req.query.category || null;
  const storeId = req.query.store_id || null;

  const { items, total } = await fetchAllProducts({ limit, offset, search, globalCategorySlug, storeId });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /stores/:slug/products  — all active products inside one store
const getProductsByStore = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const categorySlug = req.query.category || null;

  const store = await fetchStoreBySlug(req.params.slug);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const { items, total } = await fetchProductsByStore(store.id, { limit, offset, categorySlug, search });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /products/:id  — product detail page
const getProductById = asyncHandler(async (req, res) => {
  const product = await fetchProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

// ── Seller ────────────────────────────────────────────────────────────────────

// GET /products/mine  — seller's full product list (includes drafts)
const getMyProducts = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }

  const { limit, offset } = buildPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = req.query.status || null;
  const categoryId = req.query.category_id || null;

  const { items, total } = await fetchSellerProducts(store.id, { limit, offset, search, status, categoryId });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// POST /products  — create a product
const createMyProduct = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }

  const {
    store_category_id, name, description, price,
    compare_at_price, stock, sku, images, features, colors, customizations, status, is_featured,
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: "name and price are required" });
  }

  const product = await createProduct({
    store_id: store.id,
    store_category_id,
    name,
    description,
    price,
    compare_at_price,
    stock,
    sku,
    images,
    features,
    colors,
    customizations,
    status,
    is_featured,
  });

  res.status(201).json(product);
});

// PATCH /products/:id  — update a product
const updateMyProduct = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }

  const product = await updateProduct(req.params.id, store.id, req.body);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

// POST /products/upload-image — upload a single product image, returns { url }
// Body must be multipart/form-data with field name "file"
const uploadProductImage = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }

  const file = req.files?.[0];
  if (!file) {
    return res.status(400).json({ message: "No image file provided" });
  }
  const url = file.location ?? file.path;
  if (!url) {
    return res.status(500).json({ message: "Upload failed: no URL returned from storage" });
  }
  res.status(200).json({ url });
});

// DELETE /products/:id
const deleteMyProduct = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }

  const result = await deleteProduct(req.params.id, store.id);
  if (!result) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(204).send();
});

module.exports = {
  getAllProducts,
  getProductsByStore,
  getProductById,
  getMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  uploadProductImage,
};
