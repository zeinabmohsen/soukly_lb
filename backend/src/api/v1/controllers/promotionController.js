const asyncHandler = require("../../../utils/asyncHandler");
const { fetchStoreByOwner } = require("../services/storeService");
const {
  findUsablePromotion,
  computeDiscount,
  fetchStorePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require("../services/promotionService");

// ── Public: validate a code and preview the discount ──────────────────────────
// POST /promotions/validate  { code, subtotal? }
// Returns the promotion (with store) and, if subtotal is given, the discount it
// would yield. Used by the checkout coupon box. Authoritative re-check still
// happens at order creation.
const validatePromotion = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const promotion = await findUsablePromotion(code);

  const sub = Number(subtotal);
  const meetsMin =
    promotion.min_order_amount == null || (!Number.isNaN(sub) && sub >= Number(promotion.min_order_amount));
  const discount = !Number.isNaN(sub) ? computeDiscount(promotion, sub) : null;

  res.status(200).json({
    promotion: {
      id: promotion.id,
      code: promotion.code,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: Number(promotion.discount_value),
      min_order_amount: promotion.min_order_amount != null ? Number(promotion.min_order_amount) : null,
      max_discount: promotion.max_discount != null ? Number(promotion.max_discount) : null,
      store: promotion.store,
    },
    meets_minimum: meetsMin,
    discount,
  });
});

// ── Seller: list own store's promotions ───────────────────────────────────────
const getMyPromotions = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) return res.status(404).json({ message: "You don't have a store yet" });

  const promotions = await fetchStorePromotions(store.id);
  res.status(200).json({ data: promotions });
});

// ── Seller: create ────────────────────────────────────────────────────────────
const createMyPromotion = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) return res.status(404).json({ message: "You don't have a store yet" });

  const promotion = await createPromotion(store.id, req.body);
  res.status(201).json(promotion);
});

// ── Seller: update ────────────────────────────────────────────────────────────
const updateMyPromotion = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) return res.status(404).json({ message: "You don't have a store yet" });

  const promotion = await updatePromotion(req.params.id, store.id, req.body);
  if (!promotion) return res.status(404).json({ message: "Promotion not found" });
  res.status(200).json(promotion);
});

// ── Seller: delete ────────────────────────────────────────────────────────────
const deleteMyPromotion = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) return res.status(404).json({ message: "You don't have a store yet" });

  const result = await deletePromotion(req.params.id, store.id);
  if (!result) return res.status(404).json({ message: "Promotion not found" });
  res.status(204).send();
});

module.exports = {
  validatePromotion,
  getMyPromotions,
  createMyPromotion,
  updateMyPromotion,
  deleteMyPromotion,
};
