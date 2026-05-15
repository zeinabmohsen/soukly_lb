const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");
const { slugify } = require("../../../utils/slugify");

class StoreCategory extends Model {}

StoreCategory.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Unique within the store — used in URL tabs",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Seller drags to reorder category tabs",
    },
  },
  {
    sequelize,
    modelName: "StoreCategory",
    tableName: "store_categories",
    underscored: true,
    indexes: [
      {
        // slug must be unique per store, not globally
        unique: true,
        fields: ["store_id", "slug"],
        name: "store_categories_store_id_slug_unique",
      },
    ],
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = slugify(category.name);
        }
      },
    },
  }
);

module.exports = StoreCategory;
