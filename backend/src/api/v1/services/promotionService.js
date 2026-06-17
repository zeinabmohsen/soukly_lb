const { Op } = require("sequelize");
const { Promotion, Store } = require("../models");

// ── Discount math (shared by checkout + preview) ──────────────────────────────
// Returns the discount amount (never more than the subtotal) for a promotion
// applied to a given subtotal. Pure — no validation, no side effects.
function computeDiscount(promotion, subtotal) {
  const sub = Number(subtotal);
  let discount = 0;
  if (promotion.discount_type === "percentage") {
    discount = sub * (Number(promotion.discount_value) / 100);
    if (promotion.max_discount != null) {
      discount = Math.min(discount, Number(promotion.max_discount));
    }
  } else {
    discount = Number(promotion.discount_value);
  }
  discount = Math.min(discount, sub); // a coupon can never make the order negative
  return Number(discount.toFixed(2));
}

// Throws (422) if the promotion isn't currently usable — inactive, not yet
// started, expired, or fully redeemed. Subtotal/minimum is checked separately
// because a code can be valid in principle but not meet this cart's minimum.
function assertPromotionUsable(promotion) {
  if (!promotion.is_active) {
    const err = new Error("This code is no longer active.");
    err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }
  const now = Date.now();
  if (promotion.starts_at && new Date(promotion.starts_at).getTime() > now) {
    const err = new Error("This code isn't active yet.");
    err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }
  if (promotion.ends_at && new Date(promotion.ends_at).getTime() < now) {
    const err = new Error("This code has expired.");
    err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }
  if (promotion.usage_limit != null && promotion.used_count >= promotion.usage_limit) {
    const err = new Error("This code has been fully redeemed.");
    err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }
}

function assertMeetsMinimum(promotion, subtotal) {
  if (promotion.min_order_amount != null && Number(subtotal) < Number(promotion.min_order_amount)) {
    const err = new Error(`This code requires a minimum order of $${Number(promotion.min_order_amount).toFixed(2)}.`);
    err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }
}

// Normalize a buyer-entered code: trim + uppercase so lookups are case-insensitive.
function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

// ── Public: look up a code and confirm it's usable (no subtotal check) ─────────
// Used by the checkout coupon box to preview the discount. Returns the promotion
// (with store name) or throws 404/422.
async function findUsablePromotion(code) {
  const normalized = normalizeCode(code);
  if (!normalized) {
    const err = new Error("Enter a code."); err.status = 400; throw err;
  }
  const promotion = await Promotion.findOne({
    where: { code: normalized },
    include: [{ model: Store, as: "store", attributes: ["id", "name", "slug"] }],
  });
  if (!promotion) {
    const err = new Error("That code doesn't exist."); err.status = 404; err.code = "INVALID_COUPON"; throw err;
  }
  assertPromotionUsable(promotion);
  return promotion;
}

// ── Checkout: validate + atomically reserve one redemption ────────────────────
// Re-checks everything (state + minimum), atomically bumps used_count under the
// usage_limit guard, and returns the discount amount. Runs inside the order
// transaction so a failed order rolls the redemption back. storeId scopes the
// lookup so a code only applies to its own store's sub-order.
async function redeemPromotion({ storeId, code, subtotal, transaction }) {
  const normalized = normalizeCode(code);
  const promotion = await Promotion.findOne({
    where: { store_id: storeId, code: normalized },
    transaction,
  });
  if (!promotion) {
    const err = new Error("That code isn't valid for this store."); err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }

  assertPromotionUsable(promotion);
  assertMeetsMinimum(promotion, subtotal);

  // Atomic redemption: only increment when still under the limit. If a
  // concurrent checkout took the last redemption, affected === 0 → reject.
  const sequelize = Promotion.sequelize;
  const guard = { id: promotion.id };
  if (promotion.usage_limit != null) guard.used_count = { [Op.lt]: promotion.usage_limit };
  const [affected] = await Promotion.update(
    { used_count: sequelize.literal("used_count + 1") },
    { where: guard, transaction },
  );
  if (affected === 0) {
    const err = new Error("This code has just been fully redeemed."); err.status = 422; err.code = "INVALID_COUPON"; throw err;
  }

  const discount = computeDiscount(promotion, subtotal);
  return { code: promotion.code, discount };
}

// ── Seller CRUD ───────────────────────────────────────────────────────────────
async function fetchStorePromotions(storeId) {
  return Promotion.findAll({
    where: { store_id: storeId },
    order: [["created_at", "DESC"]],
  });
}

const ALLOWED_TYPES = new Set(["percentage", "fixed"]);

function validateInput({ discount_type, discount_value }) {
  if (discount_type !== undefined && !ALLOWED_TYPES.has(discount_type)) {
    const err = new Error("discount_type must be 'percentage' or 'fixed'."); err.status = 400; throw err;
  }
  if (discount_value !== undefined) {
    const v = Number(discount_value);
    if (Number.isNaN(v) || v <= 0) {
      const err = new Error("discount_value must be a positive number."); err.status = 400; throw err;
    }
    if (discount_type === "percentage" && v > 100) {
      const err = new Error("A percentage discount can't exceed 100."); err.status = 400; throw err;
    }
  }
}

async function createPromotion(storeId, data) {
  const code = normalizeCode(data.code);
  if (!code) { const err = new Error("Code is required."); err.status = 400; throw err; }
  if (data.discount_value === undefined) { const err = new Error("discount_value is required."); err.status = 400; throw err; }
  validateInput(data);

  const existing = await Promotion.findOne({ where: { store_id: storeId, code } });
  if (existing) {
    const err = new Error("You already have a code with that name."); err.status = 409; throw err;
  }

  return Promotion.create({
    store_id: storeId,
    code,
    description: data.description ?? null,
    discount_type: data.discount_type ?? "percentage",
    discount_value: data.discount_value,
    min_order_amount: data.min_order_amount ?? null,
    max_discount: data.max_discount ?? null,
    usage_limit: data.usage_limit ?? null,
    starts_at: data.starts_at ?? null,
    ends_at: data.ends_at ?? null,
    is_active: data.is_active ?? true,
  });
}

async function updatePromotion(id, storeId, data) {
  const promotion = await Promotion.findOne({ where: { id, store_id: storeId } });
  if (!promotion) return null;
  validateInput({
    discount_type: data.discount_type ?? promotion.discount_type,
    discount_value: data.discount_value,
  });

  const updates = {};
  const fields = [
    "description", "discount_type", "discount_value", "min_order_amount",
    "max_discount", "usage_limit", "starts_at", "ends_at", "is_active",
  ];
  for (const f of fields) if (data[f] !== undefined) updates[f] = data[f];

  // Allow renaming the code, but keep it unique within the store.
  if (data.code !== undefined) {
    const code = normalizeCode(data.code);
    if (!code) { const err = new Error("Code can't be empty."); err.status = 400; throw err; }
    if (code !== promotion.code) {
      const clash = await Promotion.findOne({ where: { store_id: storeId, code } });
      if (clash) { const err = new Error("You already have a code with that name."); err.status = 409; throw err; }
      updates.code = code;
    }
  }

  return promotion.update(updates);
}

async function deletePromotion(id, storeId) {
  const promotion = await Promotion.findOne({ where: { id, store_id: storeId } });
  if (!promotion) return null;
  await promotion.destroy();
  return true;
}

module.exports = {
  computeDiscount,
  findUsablePromotion,
  redeemPromotion,
  fetchStorePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
