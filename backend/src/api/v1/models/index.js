const User           = require("./User");
const Session        = require("./Session");
const PasswordReset  = require("./PasswordReset");
const GlobalCategory = require("./GlobalCategory");
const Store         = require("./Store");
const StoreCategory = require("./StoreCategory");
const Product       = require("./Product");
const Order         = require("./Order");
const OrderItem     = require("./OrderItem");
const Wishlist      = require("./Wishlist");
const StoreFollow   = require("./StoreFollow");
const Review        = require("./Review");
const Address       = require("./Address");

// ── Auth ──────────────────────────────────────────────────────────────────────
User.hasMany(Session,   { foreignKey: "user_id", onDelete: "CASCADE" });
Session.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(PasswordReset,   { foreignKey: "user_id", onDelete: "CASCADE" });
PasswordReset.belongsTo(User, { foreignKey: "user_id" });

// ── Store ─────────────────────────────────────────────────────────────────────
User.hasOne(Store,    { foreignKey: "owner_id", onDelete: "CASCADE" });
Store.belongsTo(User, { as: "owner", foreignKey: "owner_id" });

GlobalCategory.hasMany(Store,    { foreignKey: "global_category_id", onDelete: "SET NULL" });
Store.belongsTo(GlobalCategory,  { as: "category", foreignKey: "global_category_id" });

Store.hasMany(StoreCategory,    { foreignKey: "store_id", onDelete: "CASCADE" });
StoreCategory.belongsTo(Store,  { foreignKey: "store_id" });

// ── Product ───────────────────────────────────────────────────────────────────
Store.hasMany(Product,    { foreignKey: "store_id", onDelete: "CASCADE" });
Product.belongsTo(Store,  { as: "store", foreignKey: "store_id" });

StoreCategory.hasMany(Product,   { foreignKey: "store_category_id", onDelete: "SET NULL" });
Product.belongsTo(StoreCategory, { as: "category", foreignKey: "store_category_id" });

// ── Orders ────────────────────────────────────────────────────────────────────
User.hasMany(Order,   { as: "purchases", foreignKey: "buyer_id" });
Order.belongsTo(User, { as: "buyer",     foreignKey: "buyer_id" });

Store.hasMany(Order,   { foreignKey: "store_id" });
Order.belongsTo(Store, { as: "store",    foreignKey: "store_id" });

Order.hasMany(OrderItem,   { as: "items", foreignKey: "order_id", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem,    { foreignKey: "product_id" });
OrderItem.belongsTo(Product,  { as: "product", foreignKey: "product_id" });

// ── Wishlist ──────────────────────────────────────────────────────────────────
User.hasMany(Wishlist,    { foreignKey: "user_id",    onDelete: "CASCADE" });
Wishlist.belongsTo(User,  { foreignKey: "user_id" });

Product.hasMany(Wishlist,    { foreignKey: "product_id", onDelete: "CASCADE" });
Wishlist.belongsTo(Product,  { as: "product", foreignKey: "product_id" });

// ── Store Follows ─────────────────────────────────────────────────────────────
User.hasMany(StoreFollow,    { foreignKey: "user_id",  onDelete: "CASCADE" });
StoreFollow.belongsTo(User,  { foreignKey: "user_id" });

Store.hasMany(StoreFollow,    { foreignKey: "store_id", onDelete: "CASCADE" });
StoreFollow.belongsTo(Store,  { as: "store", foreignKey: "store_id" });

// ── Reviews ───────────────────────────────────────────────────────────────────
User.hasMany(Review,    { foreignKey: "user_id",    onDelete: "CASCADE" });
Review.belongsTo(User,  { as: "author", foreignKey: "user_id" });

Product.hasMany(Review,    { foreignKey: "product_id", onDelete: "CASCADE" });
Review.belongsTo(Product,  { as: "product", foreignKey: "product_id" });

Store.hasMany(Review,    { foreignKey: "store_id", onDelete: "CASCADE" });
Review.belongsTo(Store,  { as: "store", foreignKey: "store_id" });

Order.hasMany(Review,    { foreignKey: "order_id", onDelete: "SET NULL" });
Review.belongsTo(Order,  { as: "order", foreignKey: "order_id" });

// ── Addresses ─────────────────────────────────────────────────────────────────
User.hasMany(Address,    { foreignKey: "user_id", onDelete: "CASCADE" });
Address.belongsTo(User,  { foreignKey: "user_id" });

module.exports = {
  User, Session, PasswordReset, GlobalCategory,
  Store, StoreCategory,
  Product,
  Order, OrderItem,
  Wishlist, StoreFollow,
  Review,
  Address,
};
