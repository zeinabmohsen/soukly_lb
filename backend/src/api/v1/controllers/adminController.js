const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const { fetchAllStoresAdmin, fetchStoreByIdAdmin, fetchPlatformBilling } = require("../services/storeService");
const { fetchAllOrdersAdmin } = require("../services/orderService");

const VALID_STATUSES = new Set(["pending", "approved", "all"]);
const VALID_ORDER_STATUSES = new Set([
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
]);

// GET /admin/stores  — admin sees pending + approved stores in one list.
// Query: ?status=pending|approved|all (default "all"), ?search=, paginated.
const getAdminStores = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const status = VALID_STATUSES.has(req.query.status) ? req.query.status : "all";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const { items, total } = await fetchAllStoresAdmin({ limit, offset, status, search });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /admin/stores/:id  — full operational detail for one store (owner,
// stats, billing history, recent orders), regardless of approval status.
const getAdminStoreById = asyncHandler(async (req, res) => {
  const detail = await fetchStoreByIdAdmin(req.params.id);
  if (!detail) {
    return res.status(404).json({ message: "Store not found" });
  }
  res.status(200).json(detail);
});

// GET /admin/billing — platform-wide subscription billing feed + summary.
// Query: ?status=paid|pending|failed|refunded, paginated.
const VALID_PAYMENT_STATUSES = new Set(["paid", "pending", "failed", "refunded"]);
const getAdminBilling = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const status = VALID_PAYMENT_STATUSES.has(req.query.status) ? req.query.status : null;

  const result = await fetchPlatformBilling({ limit, offset, status });

  res.status(200).json({
    data: result.payments,
    summary: result.summary,
    ...buildPaginationMeta({ total: result.total, limit, offset }),
  });
});

// GET /admin/orders — admin view of every order across all stores.
// Query: ?status=<orderStatus>, ?search=, ?store_id=, paginated.
const getAdminOrders = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const status = VALID_ORDER_STATUSES.has(req.query.status) ? req.query.status : null;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const storeId = req.query.store_id || null;

  const { items, total } = await fetchAllOrdersAdmin({ limit, offset, status, search, storeId });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

module.exports = {
  getAdminStores,
  getAdminStoreById,
  getAdminOrders,
  getAdminBilling,
};
