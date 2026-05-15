const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class StoreFollow extends Model {}

StoreFollow.init(
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
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "stores", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "StoreFollow",
    tableName: "store_follows",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "store_id"],
        name: "store_follows_user_store_unique",
      },
    ],
  }
);

module.exports = StoreFollow;
