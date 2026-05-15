const { Router } = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSellerStatus,
  resetUserPassword,
  getMySellerDraft,
  updateMySellerDraft,
  deleteMySellerDraft,
} = require("../controllers/userController");
const {
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
} = require("../controllers/addressController");
const { authorize, ADMIN, LOGGED_USER, USER } = require("../middlewares/checkAuth");

const router = Router();

// Admin only
router.get("/", authorize(ADMIN), getAllUsers);
router.delete("/:id", authorize(ADMIN), deleteUser);
router.patch("/:id/seller-status", authorize(ADMIN), updateSellerStatus);
router.patch("/:id/password", authorize(ADMIN), resetUserPassword);

// Seller application draft — own data, single row per user. Must come BEFORE
// the `/:id` route below or "me" would be treated as a userId param.
router.get("/me/seller-draft", authorize(USER), getMySellerDraft);
router.put("/me/seller-draft", authorize(USER), updateMySellerDraft);
router.delete("/me/seller-draft", authorize(USER), deleteMySellerDraft);

// Shipping addresses — own data, multiple per user
router.get("/me/addresses",       authorize(USER), listMyAddresses);
router.post("/me/addresses",      authorize(USER), createMyAddress);
router.patch("/me/addresses/:id", authorize(USER), updateMyAddress);
router.delete("/me/addresses/:id", authorize(USER), deleteMyAddress);

// Own profile (LOGGED_USER checks req.params.id === req.user.id unless admin)
router.get("/:id", authorize(LOGGED_USER), getUserById);
router.patch("/:id", authorize(LOGGED_USER), updateUser);

module.exports = router;
