const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

// One row per storefront page view (a visit to a store page or one of its
// product pages). Append-only event log — powers the seller's traffic analytics
// (total views + unique visitors). visitor_id is an anonymous client-generated
// id (localStorage) used only to count uniques; it is not tied to an account.
class StoreView extends Model {}

StoreView.init(
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
    // Set when the view was a product page; null for the store landing page.
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "products", key: "id" },
      onDelete: "SET NULL",
    },
    // Anonymous per-browser id used to count unique visitors. Capped length so a
    // malicious client can't write huge values.
    visitor_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "StoreView",
    tableName: "store_views",
    underscored: true,
    updatedAt: false, // append-only — no updates, so no updated_at
    indexes: [
      { fields: ["store_id", "created_at"] },
    ],
  }
);

module.exports = StoreView;
