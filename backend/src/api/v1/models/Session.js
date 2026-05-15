const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

class Session extends Model {}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    refresh_token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Session",
    tableName: "sessions",
    underscored: true,
  }
);

module.exports = Session;
