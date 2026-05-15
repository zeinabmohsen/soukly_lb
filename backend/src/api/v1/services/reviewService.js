const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../../../config/database");
const { Review, Product, Store, User, Order, OrderItem } = require("../models");

const AUTHOR_ATTRS = ["id", "name", "avatar_url"];

// ── Rating recalculation ──────────────────────────────────────────────────────

async function recalculateProductRating(productId) {
  const result = await Review.findOne({
    where: { product_id: productId },
    attributes: [
      [fn("ROUND", fn("AVG", col("rating")), 2), "avg_rating"],
      [fn("COUNT",  col("id")),                  "total"],
    ],
    raw: true,
  });

  await Product.update(
    {
      rating:       parseFloat(result?.avg_rating) || 0,
      review_count: parseInt(result?.total, 10)   || 0,
    },
    { where: { id: productId } }
  );
}

async function recalculateStoreRating(storeId) {
  const result = await Review.findOne({
    where: { store_id: storeId },
    attributes: [
      [fn("ROUND", fn("AVG", col("rating")), 2), "avg_rating"],
      [fn("COUNT",  col("id")),                  "total"],
    ],
    raw: true,
  });

  await Store.update(
    {
      rating:       parseFloat(result?.avg_rating) || 0,
      review_count: parseInt(result?.total, 10)   || 0,
    },
    { where: { id: storeId } }
  );
}

// Recalculate both in parallel after any review change
async function refreshRatings(productId, storeId) {
  await Promise.all([
    recalculateProductRating(productId),
    recalculateStoreRating(storeId),
  ]);
}

// ── Queries ───────────────────────────────────────────────────────────────────

async function fetchProductReviews(productId, { limit, offset }) {
  const { rows: items, count: total } = await Review.findAndCountAll({
    where: { product_id: productId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [{ model: User, as: "author", attributes: AUTHOR_ATTRS }],
  });
  return { items, total };
}

async function fetchStoreReviews(storeId, { limit, offset }) {
  const { rows: items, count: total } = await Review.findAndCountAll({
    where: { store_id: storeId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      { model: User,    as: "author",  attributes: AUTHOR_ATTRS },
      { model: Product, as: "product", attributes: ["id", "name", "slug", "images"] },
    ],
  });
  return { items, total };
}

async function fetchMyReviews(userId, { limit, offset }) {
  const { rows: items, count: total } = await Review.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "slug", "images"] },
      { model: Store,   as: "store",   attributes: ["id", "name", "slug", "logo_url"] },
    ],
  });
  return { items, total };
}

// ── Writes ────────────────────────────────────────────────────────────────────

async function createReview(userId, { product_id, order_id, rating, comment }) {
  // Check product exists and is not a draft
  const product = await Product.findOne({
    where: { id: product_id, status: { [Op.ne]: "draft" } },
  });
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  // If order_id provided, verify it belongs to this buyer and contains this product
  if (order_id) {
    const orderItem = await OrderItem.findOne({
      where: { product_id },
      include: [{
        model: Order,
        where: { id: order_id, buyer_id: userId, status: "delivered" },
        required: true,
      }],
    });
    if (!orderItem) {
      const err = new Error("No delivered order found for this product");
      err.status = 403;
      throw err;
    }
  }

  const review = await Review.create({
    user_id:    userId,
    product_id,
    store_id:   product.store_id,
    order_id:   order_id || null,
    rating,
    comment:    comment || null,
  });

  await refreshRatings(product_id, product.store_id);

  return review.reload({
    include: [{ model: User, as: "author", attributes: AUTHOR_ATTRS }],
  });
}

async function updateReview(id, userId, { rating, comment }) {
  const review = await Review.findOne({ where: { id, user_id: userId } });
  if (!review) return null;

  await review.update({
    ...(rating  !== undefined && { rating }),
    ...(comment !== undefined && { comment }),
  });

  await refreshRatings(review.product_id, review.store_id);

  return review.reload({
    include: [{ model: User, as: "author", attributes: AUTHOR_ATTRS }],
  });
}

async function deleteReview(id, userId) {
  const review = await Review.findOne({ where: { id, user_id: userId } });
  if (!review) return null;

  const { product_id, store_id } = review;
  await review.destroy();
  await refreshRatings(product_id, store_id);

  return true;
}

module.exports = {
  fetchProductReviews,
  fetchStoreReviews,
  fetchMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
