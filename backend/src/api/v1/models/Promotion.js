const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

// A seller-created discount code (coupon). Buyers enter the code at checkout and
// the discount applies to that store's order. One row per code, unique per store.
class Promotion extends Model {}

Promotion.init(
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
    // Always stored uppercase, unique within the store. Buyer entry is upcased
    // before lookup so codes are case-insensitive.
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Optional internal label, e.g. \"Summer sale\"",
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
      defaultValue: "percentage",
    },
    // For percentage: 0–100. For fixed: an absolute amount in the store currency.
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Minimum order subtotal required to use the code (null = no minimum).
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    // Caps the discount for percentage codes (null = uncapped). Ignored for fixed.
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    // Total redemptions allowed across all buyers (null = unlimited).
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Null = active immediately",
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Null = no expiry",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Promotion",
    tableName: "promotions",
    underscored: true,
    indexes: [
      { fields: ["store_id"] },
      {
        unique: true,
        fields: ["store_id", "code"],
        name: "promotions_store_id_code_unique",
      },
    ],
  }
);

module.exports = Promotion;
