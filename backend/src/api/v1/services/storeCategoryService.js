const { StoreCategory } = require("../models");
const { slugify } = require("../../../utils/slugify");

async function fetchCategoriesByStore(storeId) {
  return StoreCategory.findAll({
    where: { store_id: storeId },
    order: [["sort_order", "ASC"]],
  });
}

async function createCategory({ store_id, name, sort_order }) {
  const slug = slugify(name);

  const existing = await StoreCategory.findOne({ where: { store_id, slug } });
  if (existing) {
    const err = new Error(`Category "${name}" already exists in this store`);
    err.status = 409;
    throw err;
  }

  return StoreCategory.create({ store_id, name, slug, sort_order });
}

async function updateCategory(id, storeId, data) {
  const category = await StoreCategory.findOne({ where: { id, store_id: storeId } });
  if (!category) return null;

  if (data.name) data.slug = slugify(data.name);
  return category.update(data);
}

async function deleteCategory(id, storeId) {
  const category = await StoreCategory.findOne({ where: { id, store_id: storeId } });
  if (!category) return null;
  await category.destroy();
  return true;
}

async function reorderCategories(storeId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    StoreCategory.update({ sort_order: index }, { where: { id, store_id: storeId } })
  );
  await Promise.all(updates);
  return fetchCategoriesByStore(storeId);
}

module.exports = {
  fetchCategoriesByStore,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
