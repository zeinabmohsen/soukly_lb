const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "products", key: "id" },
      onDelete: "CASCADE",
    },
    // Denormalized — lets us compute store rating without joining products
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "stores", key: "id" },
      onDelete: "CASCADE",
    },
    // Optional — links review to a verified purchase
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "orders", key: "id" },
      onDelete: "SET NULL",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    underscored: true,
    indexes: [
      {
        // One review per user per product
        unique: true,
        fields: ["user_id", "product_id"],
        name: "reviews_user_product_unique",
      },
      { fields: ["product_id"] },
      { fields: ["store_id"] },
    ],
  }
);

module.exports = Review;
