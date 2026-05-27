const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../../../config/database");

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  isSeller() {
    return this.is_seller && this.seller_status === "approved";
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Buyer is the default — everyone can buy
    // Seller flag is set to true when approved by admin
    is_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    seller_status: {
      type: DataTypes.ENUM("none", "pending", "approved", "rejected"),
      defaultValue: "none",
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Seller application draft (server-side, replaces old localStorage approach).
    // Cleared when the user submits a store via POST /stores.
    seller_draft: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    // Bumped every time the password changes. Encoded into the JWT's `pwd_v`
    // claim and re-checked by auth middleware on every request — so changing
    // the password instantly invalidates every existing access token, not just
    // refresh sessions.
    password_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
          // Bump the version so access tokens issued against the old password
          // immediately fail the middleware check on the next request.
          user.password_version = (user.password_version || 1) + 1;
        }
      },
    },
  }
);

// Never expose password in JSON responses
const originalToJSON = User.prototype.toJSON;
User.prototype.toJSON = function () {
  const values = originalToJSON.call(this);
  delete values.password;
  return values;
};

module.exports = User;
