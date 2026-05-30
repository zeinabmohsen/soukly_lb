const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

// One row per subscription charge (or attempted charge) against a store.
// Powers the seller's "Billing history" on the subscription page. Whish Money
// integration will write these going forward; for now they're seeded.
class SubscriptionPayment extends Model {}

SubscriptionPayment.init(
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
    // Human-facing receipt number, e.g. "INV-2026-0007"
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USD",
    },
    status: {
      type: DataTypes.ENUM("paid", "pending", "failed", "refunded"),
      allowNull: false,
      defaultValue: "paid",
    },
    // The billing period this charge covers
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "whish",
      comment: "whish | card | manual",
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null until the charge succeeds",
    },
  },
  {
    sequelize,
    modelName: "SubscriptionPayment",
    tableName: "subscription_payments",
    underscored: true,
    indexes: [
      { fields: ["store_id"] },
      {
        unique: true,
        fields: ["store_id", "invoice_number"],
        name: "subscription_payments_store_invoice_unique",
      },
    ],
  }
);

module.exports = SubscriptionPayment;
