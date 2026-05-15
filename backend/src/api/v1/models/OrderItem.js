const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "orders", key: "id" },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true, // nullable — product may be deleted after order
      references: { model: "products", key: "id" },
      onDelete: "SET NULL",
    },
    // Frozen product data at order time — survives product edits/deletes
    product_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "{ id, name, price, image_url, sku, slug }",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price at order time — never changes",
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "unit_price * quantity",
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    underscored: true,
    indexes: [
      { fields: ["order_id"] },
      { fields: ["product_id"] },
    ],
  }
);

module.exports = OrderItem;
