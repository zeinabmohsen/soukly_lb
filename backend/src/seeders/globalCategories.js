const { slugify } = require("../utils/slugify");

const CATEGORIES = [
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    icon: "👗",
    description: "Clothing, shoes, bags, and accessories",
    sort_order: 1,
  },
  {
    name: "Food & Beverages",
    slug: "food",
    icon: "🍽️",
    description: "Homemade food, sweets, catering, and specialty drinks",
    sort_order: 2,
  },
  {
    name: "Handmade & Crafts",
    slug: "handmade",
    icon: "🧵",
    description: "Hand-crafted goods, artisan products, and DIY creations",
    sort_order: 3,
  },
  {
    name: "Beauty & Wellness",
    slug: "beauty",
    icon: "💄",
    description: "Skincare, makeup, natural remedies, and wellness products",
    sort_order: 4,
  },
  {
    name: "Jewelry & Accessories",
    slug: "jewelry",
    icon: "💍",
    description: "Handmade and designer jewelry, watches, and accessories",
    sort_order: 5,
  },
  {
    name: "Home & Living",
    slug: "home",
    icon: "🏡",
    description: "Furniture, decor, candles, and home essentials",
    sort_order: 6,
  },
  {
    name: "Art & Collectibles",
    slug: "art",
    icon: "🎨",
    description: "Original artwork, prints, photography, and collectibles",
    sort_order: 7,
  },
  {
    name: "Electronics & Tech",
    slug: "electronics",
    icon: "💻",
    description: "Gadgets, accessories, and tech products",
    sort_order: 8,
  },
  {
    name: "Books & Stationery",
    slug: "books",
    icon: "📚",
    description: "Books, notebooks, planners, and stationery supplies",
    sort_order: 9,
  },
  {
    name: "Sports & Fitness",
    slug: "sports",
    icon: "⚽",
    description: "Sports gear, fitness equipment, and outdoor products",
    sort_order: 10,
  },
];

/**
 * Upsert global categories — safe to re-run at any time.
 * Inserts new rows and updates existing ones matched by slug.
 */
async function seedGlobalCategories(GlobalCategory) {
  const results = await GlobalCategory.bulkCreate(CATEGORIES, {
    updateOnDuplicate: ["name", "icon", "description", "sort_order", "is_active"],
    conflictAttributes: ["slug"],
    returning: true,
  });

  console.log(`[seed] global_categories: ${results.length} rows upserted`);
  return results;
}

module.exports = { seedGlobalCategories, CATEGORIES };
