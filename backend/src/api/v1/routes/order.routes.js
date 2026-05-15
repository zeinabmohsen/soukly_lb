const { Router } = require("express");
const {
  checkout,
  getMyOrders,
  getOrderById,
  cancel,
  getStoreOrders,
  advanceStatus,
} = require("../controllers/orderController");
const { authorize, USER, SELLER } = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const { checkoutSchema } = require("../validators/orderSchemas");

const router = Router();

// Static paths FIRST — must be defined before /:id to prevent Express
// treating "mine" or "store" as id params

// ── Buyer ─────────────────────────────────────────────────────────────────────
router.post("/", authorize(USER), validate(checkoutSchema), checkout);
router.get("/mine", authorize(USER), getMyOrders);        // ?status=

// ── Seller ────────────────────────────────────────────────────────────────────
router.get("/store", authorize(SELLER), getStoreOrders);  // ?status=

// ── Dynamic params (after all static paths) ───────────────────────────────────
router.patch("/:id/cancel", authorize(USER), cancel);
router.patch("/:id/status", authorize(SELLER), advanceStatus); // { status }
router.get("/:id", authorize(USER), getOrderById);

module.exports = router;
