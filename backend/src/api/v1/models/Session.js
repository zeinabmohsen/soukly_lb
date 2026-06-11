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
    // The hash this token was rotated away from, kept briefly so a concurrent
    // refresh (e.g. a second browser tab firing at the same time) presenting the
    // just-superseded token is tolerated instead of being flagged as reuse.
    prev_refresh_token_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // When the rotation that produced prev_refresh_token_hash happened — the
    // grace window is measured from here.
    prev_rotated_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
