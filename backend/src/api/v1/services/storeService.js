const { Op } = require("sequelize");
const { Store, GlobalCategory, StoreCategory, User } = require("../models");

const PUBLIC_STORE_INCLUDES = [
  { model: GlobalCategory, as: "category", attributes: ["id", "name", "slug", "icon"] },
  { model: StoreCategory, attributes: ["id", "name", "slug", "sort_order"], separate: true, order: [["sort_order", "ASC"]] },
];

// A store is publicly visible only when admin-approved AND its subscription is
// currently in trial or paid. Lapsed/cancelled stores stay hidden until the
// seller reactivates.
const LIVE_SUBSCRIPTION_STATUSES = ["trialing", "active"];
const PUBLIC_STORE_WHERE = {
  is_approved: true,
  subscription_status: { [Op.in]: LIVE_SUBSCRIPTION_STATUSES },
};

async function fetchAllStores({ limit, offset, search, categorySlug, location }) {
  const where = { ...PUBLIC_STORE_WHERE };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (location) {
    where.location = { [Op.iLike]: `%${location}%` };
  }

  const categoryWhere = categorySlug ? { slug: categorySlug } : undefined;

  const { rows: items, count: total } = await Store.findAndCountAll({
    where,
    limit,
    offset,
    order: [["rating", "DESC"], ["created_at", "DESC"]],
    include: [
      {
        model: GlobalCategory,
        as: "category",
        attributes: ["id", "name", "slug", "icon"],
        ...(categoryWhere ? { where: categoryWhere, required: true } : {}),
      },
    ],
  });

  return { items, total };
}

async function fetchStoreBySlug(slug) {
  return Store.findOne({
    where: { ...PUBLIC_STORE_WHERE, slug },
    include: PUBLIC_STORE_INCLUDES,
  });
}

async function fetchStoreById(id) {
  return Store.findOne({
    where: { ...PUBLIC_STORE_WHERE, id },
    include: PUBLIC_STORE_INCLUDES,
  });
}

async function fetchStoreByOwner(ownerId) {
  return Store.findOne({
    where: { owner_id: ownerId },
    include: PUBLIC_STORE_INCLUDES,
  });
}

// ── Admin: list every store regardless of approval ──────────────────────────
// Status: "pending" | "approved" | "all" (default). Search hits name/slug/email.
async function fetchAllStoresAdmin({ limit, offset, status = "all", search }) {
  const where = {};
  if (status === "approved") where.is_approved = true;
  else if (status === "pending") where.is_approved = false;

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows: items, count: total } = await Store.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      { model: GlobalCategory, as: "category", attributes: ["id", "name", "slug", "icon"] },
      { model: User, as: "owner", attributes: ["id", "name", "email", "phone"] },
    ],
  });

  return { items, total };
}

// ── Admin: single store by id, regardless of approval ───────────────────────
async function fetchStoreByIdAdmin(id) {
  return Store.findByPk(id, {
    include: [
      ...PUBLIC_STORE_INCLUDES,
      { model: User, as: "owner", attributes: ["id", "name", "email", "phone"] },
    ],
  });
}

// Keep in sync with frontend lib/plans.ts — both must list the same plan ids.
const ALLOWED_PLAN_IDS = new Set(["starter", "pro", "premium"]);

async function createStore({ owner_id, global_category_id, name, slug, description, location, whatsapp, instagram, facebook, tiktok, hero, footer, plan_id }) {
  const existing = await Store.findOne({ where: { owner_id } });
  if (existing) {
    const err = new Error("Seller already has a store");
    err.status = 409;
    throw err;
  }

  const safePlan = plan_id && ALLOWED_PLAN_IDS.has(plan_id) ? plan_id : "starter";

  return Store.create({
    owner_id,
    global_category_id,
    name,
    slug,
    description,
    location,
    whatsapp,
    instagram,
    facebook,
    tiktok,
    hero,
    footer,
    plan_id: safePlan,
  });
}

async function updateStore(id, data) {
  const store = await Store.findByPk(id);
  if (!store) return null;
  return store.update(data);
}

async function approveStore(id, approved) {
  const store = await Store.findByPk(id);
  if (!store) return null;
  return store.update({ is_approved: approved });
}

// ── Subscription ────────────────────────────────────────────────────────────

// Admin: set any subscription field manually. Used by admin dashboard while
// Whish payment integration is still pending.
const ALLOWED_SUBSCRIPTION_STATUSES = new Set(["inactive", "trialing", "active", "lapsed", "cancelled"]);

async function setStoreSubscription(id, { subscription_status, plan_id, trial_ends_at, next_billing_at, is_founding_seller }) {
  const store = await Store.findByPk(id);
  if (!store) return null;

  const updates = {};
  if (subscription_status !== undefined) {
    if (!ALLOWED_SUBSCRIPTION_STATUSES.has(subscription_status)) {
      const err = new Error(`Invalid subscription_status. Must be one of: ${[...ALLOWED_SUBSCRIPTION_STATUSES].join(", ")}`);
      err.status = 400;
      throw err;
    }
    updates.subscription_status = subscription_status;
  }
  if (plan_id !== undefined) updates.plan_id = plan_id;
  if (trial_ends_at !== undefined) updates.trial_ends_at = trial_ends_at;
  if (next_billing_at !== undefined) updates.next_billing_at = next_billing_at;
  if (is_founding_seller !== undefined) updates.is_founding_seller = is_founding_seller;

  return store.update(updates);
}

// Seller: change their store's plan_id. Allowed at any time — billing logic
// can later prorate / schedule the change for the next cycle.
async function changeStorePlan(ownerId, planId) {
  if (!ALLOWED_PLAN_IDS.has(planId)) {
    const err = new Error(`Invalid plan_id. Must be one of: ${[...ALLOWED_PLAN_IDS].join(", ")}`);
    err.status = 400;
    throw err;
  }
  const store = await Store.findOne({ where: { owner_id: ownerId } });
  if (!store) {
    const err = new Error("You don't have a store yet");
    err.status = 404;
    throw err;
  }
  return store.update({ plan_id: planId });
}

// Seller-initiated trial start. Requires the store to be admin-approved and
// not already in trial/active. Trial length is 30 days from now.
const TRIAL_DAYS = 30;

async function startStoreTrial(ownerId) {
  const store = await Store.findOne({ where: { owner_id: ownerId } });
  if (!store) {
    const err = new Error("You don't have a store yet");
    err.status = 404;
    throw err;
  }
  if (!store.is_approved) {
    const err = new Error("Your store must be approved by an admin before you can start the trial");
    err.status = 403;
    throw err;
  }
  if (store.subscription_status === "trialing" || store.subscription_status === "active") {
    const err = new Error("Your subscription is already active");
    err.status = 409;
    throw err;
  }

  const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return store.update({
    subscription_status: "trialing",
    trial_ends_at: trialEnd,
    next_billing_at: trialEnd,
  });
}

async function deleteStore(id) {
  const store = await Store.findByPk(id);
  if (!store) return null;
  await store.destroy();
  return true;
}

module.exports = {
  fetchAllStores,
  fetchStoreBySlug,
  fetchStoreById,
  fetchStoreByOwner,
  fetchAllStoresAdmin,
  fetchStoreByIdAdmin,
  createStore,
  updateStore,
  approveStore,
  deleteStore,
  setStoreSubscription,
  startStoreTrial,
  changeStorePlan,
  ALLOWED_PLAN_IDS,
  TRIAL_DAYS,
};
