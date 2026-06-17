const { Router } = require("express");
const {
  validatePromotion,
  getMyPromotions,
  createMyPromotion,
  updateMyPromotion,
  deleteMyPromotion,
} = require("../controllers/promotionController");
const { authorize, SELLER, USER } = require("../middlewares/checkAuth");

const router = Router();

// ── Buyer: validate / preview a code at checkout ──────────────────────────────
// Any signed-in user (the buyer) can check a code before placing the order.
router.post("/validate", authorize(USER), validatePromotion);

// ── Seller (own store) ────────────────────────────────────────────────────────
router.get("/mine", authorize(SELLER), getMyPromotions);
router.post("/", authorize(SELLER), createMyPromotion);
router.patch("/:id", authorize(SELLER), updateMyPromotion);
router.delete("/:id", authorize(SELLER), deleteMyPromotion);

module.exports = router;
