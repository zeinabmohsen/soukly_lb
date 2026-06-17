const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");

// Single-use email-verification token. Mirrors PasswordReset: we store only the
// bcrypt hash of the raw token, never the token itself, so a DB leak can't be
// replayed. The link sent to the user carries `<row_id>:<rawToken>`.
class EmailVerification extends Model {}

EmailVerification.init(
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
    token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmailVerification",
    tableName: "email_verifications",
    underscored: true,
  }
);

module.exports = EmailVerification;
