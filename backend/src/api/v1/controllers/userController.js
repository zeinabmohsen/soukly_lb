const {
  fetchAllUsers,
  fetchUserById,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
  getSellerDraft,
  setSellerDraft,
  clearSellerDraft,
} = require("../services/userService");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const asyncHandler = require("../../../utils/asyncHandler");
const { sendSellerDecisionEmail } = require("../../../utils/email");
const { Store, Session } = require("../models");

const getAllUsers = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const { items, total } = await fetchAllUsers({ limit, offset, search });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await fetchUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, avatar_url } = req.body;
  const user = await updateUserService(req.params.id, { name, email, phone, avatar_url });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await deleteUserService(req.params.id);
  if (!result) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(204).send();
});

// Admin only: approve or reject a seller application
const updateSellerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["approved", "rejected", "pending"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "status must be approved, rejected, or pending" });
  }

  const user = await fetchUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.update({
    seller_status: status,
    is_seller: status === "approved",
  });

  // Email the applicant on a definitive decision (not on a reset to "pending").
  // Best-effort — a mail failure must not fail the status change.
  if (status === "approved" || status === "rejected") {
    try {
      const store = await Store.findOne({ where: { owner_id: user.id }, attributes: ["name"] });
      await sendSellerDecisionEmail({
        to: user.email,
        name: user.name,
        storeName: store?.name,
        approved: status === "approved",
      });
    } catch (err) {
      console.error("[userController] failed to send seller decision email:", err.message);
    }
  }

  res.status(200).json(user);
});

// Admin only: reset a user's password. The User model's beforeUpdate hook
// re-hashes when the password attribute changes.
const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "password must be at least 6 characters" });
  }

  const user = await fetchUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.update({ password });

  // Force-logout everywhere: the password_version bump (User.beforeUpdate)
  // invalidates existing access tokens, but the refresh sessions would still
  // mint fresh ones — so destroy them too. The user must sign in again.
  await Session.destroy({ where: { user_id: user.id } });

  res.status(200).json({ message: "Password reset" });
});

// ── Seller application draft (DB-backed, replaces localStorage) ──────────────

const getMySellerDraft = asyncHandler(async (req, res) => {
  const draft = await getSellerDraft(req.user.id);
  res.status(200).json({ draft });
});

const updateMySellerDraft = asyncHandler(async (req, res) => {
  const { draft } = req.body;
  if (draft === undefined || draft === null || typeof draft !== "object") {
    return res.status(400).json({ message: "draft must be an object" });
  }
  const saved = await setSellerDraft(req.user.id, draft);
  res.status(200).json({ draft: saved });
});

const deleteMySellerDraft = asyncHandler(async (req, res) => {
  await clearSellerDraft(req.user.id);
  res.status(204).send();
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSellerStatus,
  resetUserPassword,
  getMySellerDraft,
  updateMySellerDraft,
  deleteMySellerDraft,
};
