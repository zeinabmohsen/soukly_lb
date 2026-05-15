const { Router } = require("express");
const {
  getWishlist,
  checkProducts,
  addProduct,
  removeProduct,
  getFollowedStores,
  follow,
  unfollow,
} = require("../controllers/wishlistController");
const { authorize, USER } = require("../middlewares/checkAuth");

const router = Router();

// All wishlist routes require authentication

// Static paths first — before /:productId
router.get("/check", authorize(USER), checkProducts);          // ?ids=id1,id2,id3
router.get("/stores", authorize(USER), getFollowedStores);
router.post("/stores/:storeId", authorize(USER), follow);
router.delete("/stores/:storeId", authorize(USER), unfollow);

// Dynamic param routes after static
router.get("/", authorize(USER), getWishlist);
router.post("/:productId", authorize(USER), addProduct);
router.delete("/:productId", authorize(USER), removeProduct);

module.exports = router;
