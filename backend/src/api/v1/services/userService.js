const { Op } = require("sequelize");
const { User } = require("../models");

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
  getSellerDraft,
  setSellerDraft,
  clearSellerDraft,
};
