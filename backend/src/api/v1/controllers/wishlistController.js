const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const { fetchProductById } = require("../services/productService");
const { fetchStoreById } = require("../services/storeService");
const {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlisted,
  fetchFollowedStores,
  followStore,
  unfollowStore,
} = require("../services/wishlistService");

// ── Product Wishlist ──────────────────────────────────────────────────────────

// GET /wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const { items, total } = await fetchWishlist(req.user.id, { limit, offset });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /wishlist/check?ids=id1,id2,id3
// Returns which of the given product ids are in the user's wishlist
// Used by product grids to show filled/unfilled heart icons in one request
const checkProducts = asyncHandler(async (req, res) => {
  const ids = typeof req.query.ids === "string"
    ? req.query.ids.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  if (ids.length === 0) {
    return res.status(200).json({ wishlisted: [] });
  }

  const wishlisted = await checkWishlisted(req.user.id, ids);
  res.status(200).json({ wishlisted: [...wishlisted] });
});

// POST /wishlist/:productId
const addProduct = asyncHandler(async (req, res) => {
  const product = await fetchProductById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { created } = await addToWishlist(req.user.id, req.params.productId);

  res.status(created ? 201 : 200).json({
    message: created ? "Added to wishlist" : "Already in wishlist",
  });
});

// DELETE /wishlist/:productId
const removeProduct = asyncHandler(async (req, res) => {
  const removed = await removeFromWishlist(req.user.id, req.params.productId);
  if (!removed) {
    return res.status(404).json({ message: "Product not in wishlist" });
  }
  res.status(204).send();
});

// ── Store Follows ─────────────────────────────────────────────────────────────

// GET /wishlist/stores
const getFollowedStores = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const { items, total } = await fetchFollowedStores(req.user.id, { limit, offset });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// POST /wishlist/stores/:storeId
const follow = asyncHandler(async (req, res) => {
  const store = await fetchStoreById(req.params.storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const { created } = await followStore(req.user.id, req.params.storeId);

  res.status(created ? 201 : 200).json({
    message: created ? "Store followed" : "Already following",
  });
});

// DELETE /wishlist/stores/:storeId
const unfollow = asyncHandler(async (req, res) => {
  const removed = await unfollowStore(req.user.id, req.params.storeId);
  if (!removed) {
    return res.status(404).json({ message: "Store not followed" });
  }
  res.status(204).send();
});

module.exports = {
  getWishlist,
  checkProducts,
  addProduct,
  removeProduct,
  getFollowedStores,
  follow,
  unfollow,
};
