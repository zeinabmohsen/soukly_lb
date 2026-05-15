const { GlobalCategory } = require("../models");

async function fetchAllCategories({ activeOnly = true } = {}) {
  const where = activeOnly ? { is_active: true } : {};

  const { rows: items, count: total } = await GlobalCategory.findAndCountAll({
    where,
    order: [
      ["sort_order", "ASC"],
      ["name", "ASC"],
    ],
  });

  return { items, total };
}

async function fetchCategoryBySlug(slug) {
  return GlobalCategory.findOne({ where: { slug } });
}

module.exports = {
  fetchAllCategories,
  fetchCategoryBySlug,
};
