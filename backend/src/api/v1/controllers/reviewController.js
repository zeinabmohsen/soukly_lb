const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const {
  fetchProductReviews,
  fetchStoreReviews,
  fetchMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../services/reviewService");

// ── Public ────────────────────────────────────────────────────────────────────

// GET /reviews/products/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const { items, total } = await fetchProductReviews(req.params.productId, { limit, offset });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /reviews/stores/:storeId
const getStoreReviews = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const { items, total } = await fetchStoreReviews(req.params.storeId, { limit, offset });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// ── Authenticated ─────────────────────────────────────────────────────────────

// GET /reviews/mine
const getMyReviews = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const { items, total } = await fetchMyReviews(req.user.id, { limit, offset });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// POST /reviews
const create = asyncHandler(async (req, res) => {
  const { product_id, order_id, rating, comment } = req.body;

  if (!product_id || !rating) {
    return res.status(400).json({ message: "product_id and rating are required" });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
  }

  const review = await createReview(req.user.id, { product_id, order_id, rating, comment });
  res.status(201).json(review);
});

// PATCH /reviews/:id
const update = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
  }

  const review = await updateReview(req.params.id, req.user.id, { rating, comment });
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  res.status(200).json(review);
});

// DELETE /reviews/:id
const remove = asyncHandler(async (req, res) => {
  const result = await deleteReview(req.params.id, req.user.id);
  if (!result) {
    return res.status(404).json({ message: "Review not found" });
  }
  res.status(204).send();
});

module.exports = {
  getProductReviews,
  getStoreReviews,
  getMyReviews,
  create,
  update,
  remove,
};
