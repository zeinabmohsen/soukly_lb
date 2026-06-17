const { Router } = require("express");
const { getAdminStores, getAdminStoreById, getAdminOrders, getAdminBilling, updateAdminOrderStatus, updateAdminPayment } = require("../controllers/adminController");
const { authorize, ADMIN } = require("../middlewares/checkAuth");

const router = Router();

// Every route below requires admin auth — applied at the router level
router.use(authorize(ADMIN));

router.get("/stores",      getAdminStores);
router.get("/stores/:id",  getAdminStoreById);
router.get("/orders",      getAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);
router.get("/billing",     getAdminBilling);
router.patch("/billing/:id", updateAdminPayment);

module.exports = router;
