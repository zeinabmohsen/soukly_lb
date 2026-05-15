const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");
const { slugify } = require("../../../utils/slugify");

class GlobalCategory extends Model {}

GlobalCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Emoji or icon identifier shown in marketplace UI",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Controls display order in marketplace category tabs",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "GlobalCategory",
    tableName: "global_categories",
    underscored: true,
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = slugify(category.name);
        }
      },
    },
  }
);

module.exports = GlobalCategory;
