const { Router } = require("express");
const {
  getAllStores,
  getStoreBySlug,
  getStoreById,
  getMyStore,
  createMyStore,
  updateMyStore,
  uploadStoreImage,
  setStoreApproval,
  setSubscription,
  startTrial,
  changeMyPlan,
  getMyPayments,
  deleteAnyStore,
} = require("../controllers/storeController");
const { uploadMiddleware, handleUpload } = require("../middlewares/upload");
const {
  getCategories,
  addCategory,
  editCategory,
  removeCategory,
  reorder,
} = require("../controllers/storeCategoryController");
const { getProductsByStore } = require("../controllers/productController");
const { authorize, ADMIN, SELLER, USER } = require("../middlewares/checkAuth");

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllStores);
// `/by-id/:id` MUST come before `/:slug` — both are GET on /stores/* and the
// router matches in order. Without this, "by-id" gets treated as a slug.
router.get("/by-id/:id", getStoreById);
router.get("/:slug", getStoreBySlug);
router.get("/:storeId/categories", getCategories);
// ?category= (store category slug) &search= &limit= &offset=
router.get("/:slug/products", getProductsByStore);

// ── Seller (own store) ────────────────────────────────────────────────────────
router.get("/me/store", authorize(USER), getMyStore);
// POST /stores is the "apply to become a seller" entry point — the applicant
// is still a USER at this point, not yet an approved SELLER. Creating the
// store flips them to seller_status='pending' (see controller).
router.post("/", authorize(USER), createMyStore);
router.patch("/me/store", authorize(SELLER), updateMyStore);
router.post("/me/store/upload-image", authorize(SELLER), uploadMiddleware, handleUpload, uploadStoreImage);

// Store categories — seller manages their own tabs
router.post("/me/store/categories", authorize(SELLER), addCategory);
router.patch("/me/store/categories/reorder", authorize(SELLER), reorder);
router.patch("/me/store/categories/:id", authorize(SELLER), editCategory);
router.delete("/me/store/categories/:id", authorize(SELLER), removeCategory);

// Seller subscription — start the free trial (Whish payment integration TBD)
router.post("/me/subscription/start-trial", authorize(SELLER), startTrial);
// Seller — upgrade/downgrade between starter | pro | premium
router.patch("/me/subscription/plan", authorize(SELLER), changeMyPlan);
// Seller — billing history (subscription charges)
router.get("/me/subscription/payments", authorize(SELLER), getMyPayments);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.patch("/:id/approval", authorize(ADMIN), setStoreApproval);
router.patch("/:id/subscription", authorize(ADMIN), setSubscription);
router.delete("/:id", authorize(ADMIN), deleteAnyStore);

module.exports = router;
