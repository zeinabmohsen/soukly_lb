const { Router } = require("express");
const {
  getAllProducts,
  getProductById,
  getMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  uploadProductImage,
} = require("../controllers/productController");
const { uploadMiddleware, handleUpload } = require("../middlewares/upload");
const { authorize, SELLER, USER } = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const { createProductSchema } = require("../validators/productSchemas");

const router = Router();

// ── Seller (static paths first — must be before /:id) ────────────────────────
router.get("/mine", authorize(SELLER), getMyProducts);
router.post(
  "/upload-image",
  authorize(SELLER),
  uploadMiddleware,
  handleUpload,
  uploadProductImage
);
// ── Public ────────────────────────────────────────────────────────────────────
// ?search= &category= (global category slug) &store_id=
router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", authorize(SELLER), validate(createProductSchema), createMyProduct);
router.patch("/:id", authorize(SELLER), updateMyProduct);
router.delete("/:id", authorize(SELLER), deleteMyProduct);

module.exports = router;
