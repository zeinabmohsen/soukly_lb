const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class Address extends Model {}

Address.init(
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
    label: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "User-defined label like 'Home' or 'Office'",
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Lebanon",
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Address",
    tableName: "addresses",
    underscored: true,
  }
);

module.exports = Address;
