const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const {
  fetchAllStores,
  fetchStoreBySlug,
  fetchStoreById: fetchStoreByIdService,
  fetchStoreByOwner,
  createStore,
  updateStore,
  approveStore,
  deleteStore,
  setStoreSubscription,
  startStoreTrial,
  changeStorePlan,
  fetchMyPayments,
} = require("../services/storeService");
const { clearSellerDraft } = require("../services/userService");

// Public — marketplace listing
const getAllStores = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const categorySlug = req.query.category || null;
  const location = req.query.location || null;
  const sort = typeof req.query.sort === "string" ? req.query.sort : null;

  const { items, total } = await fetchAllStores({ limit, offset, search, categorySlug, location, sort });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// Public — store page
const getStoreBySlug = asyncHandler(async (req, res) => {
  const store = await fetchStoreBySlug(req.params.slug);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }
  res.status(200).json(store);
});

// Public — fetch by UUID (used when only the id is known, e.g. admin links)
const getStoreById = asyncHandler(async (req, res) => {
  const store = await fetchStoreByIdService(req.params.id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }
  res.status(200).json(store);
});

// Seller — get own store
const getMyStore = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "You don't have a store yet" });
  }
  res.status(200).json(store);
});

// User — apply to become a seller by creating their store (one per user).
// Flips the user to seller_status='pending' so the admin queue picks them up.
const createMyStore = asyncHandler(async (req, res) => {
  const { global_category_id, name, slug, description, location, whatsapp, instagram, facebook, tiktok, hero, footer, plan_id } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Store name is required" });
  }

  const store = await createStore({
    owner_id: req.user.id,
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
    plan_id,
  });

  // Mark the applicant as a pending seller so admin sees them in the queue
  // and so the user UI reflects "application under review" state.
  if (!req.user.is_seller || req.user.seller_status === "none" || req.user.seller_status === "rejected") {
    await req.user.update({ is_seller: true, seller_status: "pending" });
  }

  // Submission succeeded — clear the saved draft so the user doesn't see a
  // stale "restored" banner if they revisit /become-seller.
  await clearSellerDraft(req.user.id);

  res.status(201).json(store);
});

// Seller — update own store (also handles store builder saves)
const updateMyStore = asyncHandler(async (req, res) => {
  const store = await fetchStoreByOwner(req.user.id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const { global_category_id, name, description, location, whatsapp, instagram, facebook, tiktok, youtube, twitter, logo_url, cover_url, hero, footer } = req.body;

  const updated = await updateStore(store.id, {
    global_category_id,
    name,
    description,
    location,
    whatsapp,
    instagram,
    facebook,
    tiktok,
    youtube,
    twitter,
    logo_url,
    cover_url,
    hero,
    footer,
  });

  res.status(200).json(updated);
});

// Seller — upload store image (logo or cover), returns { url }
const uploadStoreImage = asyncHandler(async (req, res) => {
  const file = req.files?.[0];
  if (!file) {
    return res.status(400).json({ message: "No image file provided" });
  }
  const url = file.location ?? file.path;
  if (!url) {
    return res.status(500).json({ message: "Upload failed: no URL returned from storage" });
  }
  res.status(200).json({ url });
});

// Admin — approve or unapprove a store
const setStoreApproval = asyncHandler(async (req, res) => {
  const { approved } = req.body;
  if (typeof approved !== "boolean") {
    return res.status(400).json({ message: "approved must be a boolean" });
  }

  const store = await approveStore(req.params.id, approved);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  res.status(200).json(store);
});

// Admin — manually set subscription state (used while Whish integration is pending)
const setSubscription = asyncHandler(async (req, res) => {
  const store = await setStoreSubscription(req.params.id, req.body);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }
  res.status(200).json(store);
});

// Seller — start the 30-day free trial on their own store
const startTrial = asyncHandler(async (req, res) => {
  const store = await startStoreTrial(req.user.id);
  res.status(200).json(store);
});

// Seller — change own plan (starter | pro | premium)
const changeMyPlan = asyncHandler(async (req, res) => {
  const { plan_id } = req.body;
  if (typeof plan_id !== "string" || !plan_id) {
    return res.status(400).json({ message: "plan_id is required" });
  }
  const store = await changeStorePlan(req.user.id, plan_id);
  res.status(200).json(store);
});

// Seller — billing history for own store
const getMyPayments = asyncHandler(async (req, res) => {
  const result = await fetchMyPayments(req.user.id);
  res.status(200).json(result);
});

// Admin — delete any store
const deleteAnyStore = asyncHandler(async (req, res) => {
  const result = await deleteStore(req.params.id);
  if (!result) {
    return res.status(404).json({ message: "Store not found" });
  }
  res.status(204).send();
});

module.exports = {
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
};
