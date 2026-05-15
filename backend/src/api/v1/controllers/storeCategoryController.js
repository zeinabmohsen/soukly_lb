const asyncHandler = require("../../../utils/asyncHandler");
const { fetchStoreByOwner } = require("../services/storeService");
const {
  fetchCategoriesByStore,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require("../services/storeCategoryService");

// Helper — ensure the requesting seller owns the store
async function resolveSellerStore(userId) {
  const store = await fetchStoreByOwner(userId);
  if (!store) {
    const err = new Error("Store not found");
    err.status = 404;
    throw err;
  }
  return store;
}

const getCategories = asyncHandler(async (req, res) => {
  // Public — called from the store page to build category tabs
  const { storeId } = req.params;
  const categories = await fetchCategoriesByStore(storeId);
  res.status(200).json(categories);
});

const addCategory = asyncHandler(async (req, res) => {
  const store = await resolveSellerStore(req.user.id);
  const { name, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await createCategory({ store_id: store.id, name, sort_order });
  res.status(201).json(category);
});

const editCategory = asyncHandler(async (req, res) => {
  const store = await resolveSellerStore(req.user.id);
  const { name, sort_order } = req.body;

  const category = await updateCategory(req.params.id, store.id, { name, sort_order });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json(category);
});

const removeCategory = asyncHandler(async (req, res) => {
  const store = await resolveSellerStore(req.user.id);

  const result = await deleteCategory(req.params.id, store.id);
  if (!result) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(204).send();
});

// Drag-to-reorder — receives ordered array of category IDs
const reorder = asyncHandler(async (req, res) => {
  const store = await resolveSellerStore(req.user.id);
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "ids must be a non-empty array" });
  }

  const categories = await reorderCategories(store.id, ids);
  res.status(200).json(categories);
});

module.exports = { getCategories, addCategory, editCategory, removeCategory, reorder };
