const { Op } = require("sequelize");
const { User, Store, Session } = require("../models");

// Admin-settable seller states. "approved" is the only one that grants seller
// access; everything else takes the storefront offline.
const SELLER_STATUSES = new Set(["approved", "rejected", "pending", "suspended"]);

async function fetchAllUsers({ limit, offset, search }) {
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  const { rows: items, count: total } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { items, total };
}

async function fetchUserById(id) {
  return User.findByPk(id);
}

async function createUser({ name, email, password, phone }) {
  return User.create({ name, email, password, phone });
}

async function updateUser(id, data) {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update(data);
}

async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return true;
}

// Admin: set a user's seller status and keep their store + sessions consistent.
// This is the single source of truth for the user-driven seller lifecycle so the
// User flags and the Store's visibility can never drift apart:
//   approved  → seller access on, storefront listed (is_approved = true)
//   pending   → back in the review queue, storefront hidden
//   rejected  → application denied, storefront hidden
//   suspended → stopped after being active, storefront hidden, forced logout
// Subscription state is left untouched so reactivating restores the store as-is.
// Returns { user, store } or null when the user doesn't exist.
async function setSellerStatus(userId, status) {
  if (!SELLER_STATUSES.has(status)) {
    const err = new Error(`status must be one of: ${[...SELLER_STATUSES].join(", ")}`);
    err.status = 400;
    throw err;
  }

  const user = await User.findByPk(userId);
  if (!user) return null;

  const approved = status === "approved";
  await user.update({ seller_status: status, is_seller: approved });

  const store = await Store.findOne({ where: { owner_id: userId } });
  if (store) {
    await store.update({ is_approved: approved });
  }

  // Suspending an active seller must take effect immediately. Destroying their
  // sessions revokes the refresh tokens so the seller-role access token can't be
  // renewed and they lose seller access on the next request, not at token expiry.
  // (Rejecting a pending applicant leaves their buyer session alone.)
  if (status === "suspended") {
    await Session.destroy({ where: { user_id: userId } });
  }

  return { user, store };
}

// Seller-application draft helpers — DB-backed, single row per user
async function getSellerDraft(userId) {
  const user = await User.findByPk(userId, { attributes: ["seller_draft"] });
  return user?.seller_draft ?? null;
}

async function setSellerDraft(userId, draft) {
  const user = await User.findByPk(userId);
  if (!user) return null;
  await user.update({ seller_draft: draft });
  return user.seller_draft;
}

async function clearSellerDraft(userId) {
  const user = await User.findByPk(userId);
  if (!user) return false;
  await user.update({ seller_draft: null });
  return true;
}

module.exports = {
  fetchAllUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  setSellerStatus,
  getSellerDraft,
  setSellerDraft,
  clearSellerDraft,
};
