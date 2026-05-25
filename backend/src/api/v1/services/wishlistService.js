const { Op } = require("sequelize");
const { Wishlist, StoreFollow, Product, Store, StoreCategory, GlobalCategory } = require("../models");

const PRODUCT_ATTRS = [
  "id", "name", "slug", "price", "compare_at_price",
  "images", "status", "rating", "stock", "store_id",
];

const STORE_ATTRS = [
  "id", "name", "slug", "logo_url", "cover_url", "rating", "location",
];

// ── Product Wishlist ──────────────────────────────────────────────────────────

async function fetchWishlist(userId, { limit, offset }) {
  const { rows: items, count: total } = await Wishlist.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Product,
        as: "product",
        attributes: PRODUCT_ATTRS,
        include: [
          {
            model: Store,
            as: "store",
            attributes: ["id", "name", "slug", "logo_url"],
          },
          {
            model: StoreCategory,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
      },
    ],
  });

  return { items, total };
}

// findOrCreate is idempotent — safe to call even if already wishlisted
async function addToWishlist(userId, productId) {
  const [entry, created] = await Wishlist.findOrCreate({
    where: { user_id: userId, product_id: productId },
    defaults: { user_id: userId, product_id: productId },
  });
  return { entry, created };
}

async function removeFromWishlist(userId, productId) {
  const deleted = await Wishlist.destroy({
    where: { user_id: userId, product_id: productId },
  });
  return deleted > 0;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Batch check — returns Set of product ids the user has wishlisted
// Used on product listing pages to show filled/unfilled heart icons
async function checkWishlisted(userId, productIds) {
  const validIds = productIds.filter((id) => UUID_RE.test(id));
  if (validIds.length === 0) return new Set();

  const rows = await Wishlist.findAll({
    where: { user_id: userId, product_id: { [Op.in]: validIds } },
    attributes: ["product_id"],
  });
  return new Set(rows.map((r) => r.product_id));
}

// ── Store Follows ─────────────────────────────────────────────────────────────

async function fetchFollowedStores(userId, { limit, offset }) {
  const { rows: items, count: total } = await StoreFollow.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Store,
        as: "store",
        attributes: STORE_ATTRS,
        include: [
          { model: GlobalCategory, as: "category", attributes: ["id", "name", "slug", "icon"] },
        ],
      },
    ],
  });

  return { items, total };
}

async function followStore(userId, storeId) {
  const [entry, created] = await StoreFollow.findOrCreate({
    where: { user_id: userId, store_id: storeId },
    defaults: { user_id: userId, store_id: storeId },
  });
  return { entry, created };
}

async function unfollowStore(userId, storeId) {
  const deleted = await StoreFollow.destroy({
    where: { user_id: userId, store_id: storeId },
  });
  return deleted > 0;
}

async function getFollowerCount(storeId) {
  return StoreFollow.count({ where: { store_id: storeId } });
}

module.exports = {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlisted,
  fetchFollowedStores,
  followStore,
  unfollowStore,
  getFollowerCount,
};
