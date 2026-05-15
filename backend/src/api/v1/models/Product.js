const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");
const { uniqueSlug } = require("../../../utils/slugify");

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "stores", key: "id" },
      onDelete: "CASCADE",
    },
    store_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "store_categories", key: "id" },
      onDelete: "SET NULL",
      comment: "Null means uncategorized — still visible in the store",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Unique per store — used in product URL",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Original price — shown crossed out when lower than price
    compare_at_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Seller's internal stock-keeping unit",
    },
    // Array of { url, alt, sort_order } — first item is the main image
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    // Array of strings e.g. ["100% cotton", "Machine washable"]
    features: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("active", "draft", "out_of_stock"),
      defaultValue: "active",
      comment: "draft = hidden from public; out_of_stock = visible but not purchasable",
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Seller pins featured products to the top of their store page",
    },
    // Cached aggregates — updated on review/order save to avoid live COUNT queries
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sales_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Incremented when an order item is confirmed",
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    underscored: true,
    indexes: [
      {
        // slug unique per store, not globally
        unique: true,
        fields: ["store_id", "slug"],
        name: "products_store_id_slug_unique",
      },
    ],
    hooks: {
      // beforeValidate so slug exists before NOT NULL check
      beforeValidate: async (product) => {
        if (!product.slug && product.name && product.store_id) {
          product.slug = await uniqueSlug(product.name, async (candidate) => {
            const taken = await Product.findOne({
              where: { store_id: product.store_id, slug: candidate },
            });
            return !!taken;
          });
        }
      },
    },
  }
);

module.exports = Product;
