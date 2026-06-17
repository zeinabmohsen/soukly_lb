const { Router } = require("express");

const authRoutes      = require("./routes/auth.routes");
const userRoutes      = require("./routes/user.routes");
const categoryRoutes  = require("./routes/category.routes");
const storeRoutes     = require("./routes/store.routes");
const productRoutes   = require("./routes/product.routes");
const orderRoutes     = require("./routes/order.routes");
const wishlistRoutes  = require("./routes/wishlist.routes");
const reviewRoutes    = require("./routes/review.routes");
const promotionRoutes = require("./routes/promotion.routes");
const adminRoutes     = require("./routes/admin.routes");

const router = Router();

router.use("/auth",       authRoutes);
router.use("/users",      userRoutes);
router.use("/categories", categoryRoutes);
router.use("/stores",     storeRoutes);
router.use("/products",   productRoutes);
router.use("/orders",     orderRoutes);
router.use("/wishlist",   wishlistRoutes);
router.use("/reviews",    reviewRoutes);
router.use("/promotions", promotionRoutes);
router.use("/admin",      adminRoutes);

module.exports = router;
