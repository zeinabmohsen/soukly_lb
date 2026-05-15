const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "stores", key: "id" },
      onDelete: "SET NULL",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",    // placed — awaiting seller confirmation
        "confirmed",  // seller accepted
        "processing", // seller preparing
        "shipped",    // on the way
        "delivered",  // completed
        "cancelled"   // cancelled by buyer or seller
      ),
      defaultValue: "pending",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Sum of all order items at order time",
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5.00,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "subtotal + shipping_fee — calculated at checkout, never recomputed",
    },
    // Frozen snapshot of buyer's shipping info at order time
    shipping_address: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "{ name, email, phone, address }",
    },
    payment_method: {
      type: DataTypes.ENUM("credit_card", "cash_on_delivery"),
      allowNull: false,
      defaultValue: "cash_on_delivery",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Buyer notes to the seller",
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    underscored: true,
    indexes: [
      { fields: ["buyer_id"] },
      { fields: ["store_id"] },
      { fields: ["status"] },
    ],
  }
);

module.exports = Order;
