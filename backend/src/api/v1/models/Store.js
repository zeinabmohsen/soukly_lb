const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../config/database");
const { uniqueSlug } = require("../../../utils/slugify");

const HERO_DEFAULTS = {
  bg_image_url: null,
  headline: "",
  tagline: "",
  cta_text: "Shop Now",
  cta_link: "#products",
  overlay_color: "rgba(0,0,0,0.45)",
  layout: "centered", // "centered" | "left" | "right"
};

const FOOTER_DEFAULTS = {
  about_text: "",
  contact_email: null,
  extra_links: [], // [{ label, url }]
};

class Store extends Model {}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    global_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "global_categories", key: "id" },
      onDelete: "SET NULL",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cover_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "City or area in Lebanon (Beirut, Tripoli, Sidon...)",
    },
    // Social contacts — direct columns for easy querying & display
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Admin flips this to make the store visible in the marketplace",
    },
    // ── Subscription ────────────────────────────────────────────────────────
    // Two gates control marketplace visibility: is_approved AND subscription
    // active/trialing. Admin approves first (free), seller then activates
    // their subscription which starts the trial.
    subscription_status: {
      type: DataTypes.ENUM("inactive", "trialing", "active", "lapsed", "cancelled"),
      defaultValue: "inactive",
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "starter",
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_billing_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_founding_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "First N sellers get a permanent founding-seller rate",
    },
    // Cached aggregates — both updated together whenever a review is saved/deleted
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Store builder — fully customizable by the seller
    hero: {
      type: DataTypes.JSONB,
      defaultValue: HERO_DEFAULTS,
    },
    footer: {
      type: DataTypes.JSONB,
      defaultValue: FOOTER_DEFAULTS,
    },
  },
  {
    sequelize,
    modelName: "Store",
    tableName: "stores",
    underscored: true,
    hooks: {
      // beforeValidate so slug exists before the NOT NULL check runs
      beforeValidate: async (store) => {
        if (!store.slug && store.name) {
          store.slug = await uniqueSlug(store.name, async (candidate) => {
            const taken = await Store.findOne({ where: { slug: candidate } });
            return !!taken;
          });
        }
        store.hero   = { ...HERO_DEFAULTS,   ...(store.hero   || {}) };
        store.footer = { ...FOOTER_DEFAULTS, ...(store.footer || {}) };
      },
      beforeUpdate: (store) => {
        if (store.changed("hero"))   store.hero   = { ...HERO_DEFAULTS,   ...store.hero };
        if (store.changed("footer")) store.footer = { ...FOOTER_DEFAULTS, ...store.footer };
      },
    },
  }
);

Store.HERO_DEFAULTS = HERO_DEFAULTS;
Store.FOOTER_DEFAULTS = FOOTER_DEFAULTS;

// Subscription helpers — a store is "live" only when both gates are open.
Store.prototype.hasActiveSubscription = function () {
  return this.subscription_status === "active" || this.subscription_status === "trialing";
};
Store.prototype.isLive = function () {
  return this.is_approved && this.hasActiveSubscription();
};

module.exports = Store;
