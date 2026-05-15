const asyncHandler = require("../../../utils/asyncHandler");
const { buildPaginationParams, buildPaginationMeta } = require("../../../utils/pagination");
const { fetchAllCategories, fetchCategoryBySlug } = require("../services/categoryService");

// GET /categories  — public marketplace category tiles
const getAllCategories = asyncHandler(async (req, res) => {
  const { limit, offset } = buildPaginationParams(req.query);
  const includeInactive = req.query.include_inactive === "true";

  const { items, total } = await fetchAllCategories({ activeOnly: !includeInactive });

  res.status(200).json({
    data: items,
    ...buildPaginationMeta({ total, limit, offset }),
  });
});

// GET /categories/:slug  — single category detail (used for landing pages)
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await fetchCategoryBySlug(req.params.slug);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

module.exports = {
  getAllCategories,
  getCategoryBySlug,
};
