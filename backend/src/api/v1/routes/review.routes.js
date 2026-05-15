const { Router } = require("express");
const {
  getProductReviews,
  getStoreReviews,
  getMyReviews,
  create,
  update,
  remove,
} = require("../controllers/reviewController");
const { authorize, USER } = require("../middlewares/checkAuth");

const router = Router();

// Static paths first — before /:id
router.get("/products/:productId", getProductReviews);
router.get("/stores/:storeId",     getStoreReviews);
router.get("/mine", authorize(USER), getMyReviews);

// POST /reviews — { product_id, rating, comment, order_id? }
router.post("/", authorize(USER), create);

// Dynamic param after static paths
router.patch("/:id",  authorize(USER), update);
router.delete("/:id", authorize(USER), remove);

module.exports = router;
