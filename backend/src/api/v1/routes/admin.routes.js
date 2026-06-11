const { Router } = require("express");
const { getAdminStores, getAdminStoreById, getAdminOrders, getAdminBilling } = require("../controllers/adminController");
const { authorize, ADMIN } = require("../middlewares/checkAuth");

const router = Router();

// Every route below requires admin auth — applied at the router level
router.use(authorize(ADMIN));

router.get("/stores",      getAdminStores);
router.get("/stores/:id",  getAdminStoreById);
router.get("/orders",      getAdminOrders);
router.get("/billing",     getAdminBilling);

module.exports = router;
