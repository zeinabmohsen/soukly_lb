// Idempotent seeder for demo accounts + a sample store with products.
// Safe to re-run: looks up by email/slug and skips re-creation.

const USERS = [
  {
    email: "admin@soukly.com",
    name: "Soukly Admin",
    password: "SouklyAdm!n_K9p4",
    phone: "+96100000001",
    is_admin: true,
    is_seller: false,
    seller_status: "none",
    is_verified: true,
  },
  {
    email: "buyer@soukly.com",
    name: "Sami Buyer",
    password: "SouklyBuy3r!_M7q",
    phone: "+96170111222",
    is_admin: false,
    is_seller: false,
    seller_status: "none",
    is_verified: true,
  },
  {
    email: "seller@soukly.com",
    name: "Lina Seller",
    password: "SouklySell3r!_T2v",
    phone: "+96171333444",
    is_admin: false,
    is_seller: true,
    seller_status: "approved",
    is_verified: true,
  },
  {
    email: "seller2@soukly.com",
    name: "Karim Crafts",
    password: "SouklyCrafts!_X8z",
    phone: "+96176555666",
    is_admin: false,
    is_seller: true,
    seller_status: "approved",
    is_verified: true,
  },
];

const STORES = [
  {
    ownerEmail: "seller@soukly.com",
    categorySlug: "fashion",
    name: "Lina's Boutique",
    slug: "linas-boutique",
    description: "Curated Lebanese fashion — handpicked pieces from Beirut to Byblos.",
    location: "Beirut",
    whatsapp: "+96171333444",
    instagram: "linasboutique",
    facebook: "linasboutique",
    is_approved: true,
    // Established paying seller on the Pro plan
    subscription_status: "active",
    plan_id: "pro",
    is_founding_seller: true,
    storeCategories: [
      { name: "Dresses",     slug: "dresses",     sort_order: 0 },
      { name: "Scarves",     slug: "scarves",     sort_order: 1 },
      { name: "Bags",        slug: "bags",        sort_order: 2 },
      { name: "Accessories", slug: "accessories", sort_order: 3 },
    ],
    products: [
      {
        name: "Embroidered Linen Dress",
        slug: "embroidered-linen-dress",
        categorySlug: "dresses",
        description: "Hand-embroidered linen dress, made in a Beirut atelier.",
        price: 89,
        compare_at_price: 120,
        stock: 12,
        sku: "LB-DRESS-001",
        images: [{ url: "/flowing-silk-scarf.png", alt: "Front view" }],
        features: [{ label: "Material", value: "100% linen" }, { label: "Fit", value: "Relaxed" }],
        status: "active",
        is_featured: true,
      },
      {
        name: "Silk Scarf — Cedar Print",
        slug: "silk-scarf-cedar",
        categorySlug: "scarves",
        description: "Lightweight silk scarf featuring an original cedar pattern.",
        price: 45,
        compare_at_price: null,
        stock: 30,
        sku: "LB-SCARF-001",
        images: [{ url: "/flowing-silk-scarf.png" }],
        features: [{ label: "Material", value: "100% silk" }],
        status: "active",
        is_featured: true,
      },
      {
        name: "Leather Crossbody Bag",
        slug: "leather-crossbody-bag",
        categorySlug: "bags",
        description: "Handmade leather bag with adjustable strap.",
        price: 135,
        compare_at_price: 165,
        stock: 6,
        sku: "LB-BAG-001",
        images: [{ url: "/placeholder.svg" }],
        features: [{ label: "Material", value: "Full-grain leather" }],
        status: "active",
        is_featured: false,
      },
    ],
  },
  {
    ownerEmail: "seller2@soukly.com",
    categorySlug: "handmade",
    name: "Karim Crafts",
    slug: "karim-crafts",
    description: "Hand-thrown ceramics and home goods from a small studio in Tripoli.",
    location: "Tripoli",
    whatsapp: "+96176555666",
    instagram: "karimcrafts",
    facebook: null,
    is_approved: true,
    // Newer seller, still in free trial on the Starter plan
    subscription_status: "trialing",
    plan_id: "starter",
    is_founding_seller: false,
    trial_days_remaining: 15,
    storeCategories: [
      { name: "Pottery",      slug: "pottery",      sort_order: 0 },
      { name: "Woodwork",     slug: "woodwork",     sort_order: 1 },
      { name: "Candles",      slug: "candles",      sort_order: 2 },
    ],
    products: [
      {
        name: "Stoneware Pottery Vase",
        slug: "stoneware-pottery-vase",
        categorySlug: "pottery",
        description: "Hand-thrown stoneware vase with a matte glaze.",
        price: 65,
        compare_at_price: null,
        stock: 8,
        sku: "KC-VASE-001",
        images: [{ url: "/pottery-vase.jpg" }],
        features: [{ label: "Height", value: "28 cm" }],
        status: "active",
        is_featured: true,
      },
      {
        name: "Olive Wood Cutting Board",
        slug: "olive-wood-cutting-board",
        categorySlug: "woodwork",
        description: "Hand-finished olive wood board, food-safe finish.",
        price: 38,
        compare_at_price: null,
        stock: 22,
        sku: "KC-BOARD-001",
        images: [{ url: "/placeholder.svg" }],
        features: [{ label: "Material", value: "Olive wood" }],
        status: "active",
        is_featured: false,
      },
      {
        name: "Cedar Soy Candle",
        slug: "cedar-soy-candle",
        categorySlug: "candles",
        description: "Hand-poured soy candle with Lebanese cedar essential oil.",
        price: 24,
        compare_at_price: 30,
        stock: 40,
        sku: "KC-CANDLE-001",
        images: [{ url: "/placeholder.svg" }],
        features: [{ label: "Burn time", value: "~40 hours" }],
        status: "active",
        is_featured: true,
      },
    ],
  },
];

async function seedSampleData({ User, Store, StoreCategory, Product, GlobalCategory }) {
  // ── Users ────────────────────────────────────────────────────────────────────
  // Force-reset password on every run so demo accounts always work even if the
  // hash got corrupted (e.g. by a manual DB edit). The User model's beforeUpdate
  // hook re-hashes when password changes.
  const usersByEmail = new Map();
  for (const spec of USERS) {
    const [user, created] = await User.findOrCreate({
      where: { email: spec.email },
      defaults: spec,
    });
    if (!created) {
      await user.update({ password: spec.password });
    }
    usersByEmail.set(spec.email, user);
  }
  console.log(`[seed] users: ${usersByEmail.size} present (demo passwords reset)`);

  // ── Categories lookup (must run after seedGlobalCategories) ──────────────────
  const categories = await GlobalCategory.findAll();
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  // ── Stores + StoreCategories + Products ──────────────────────────────────────
  let storeCount = 0;
  let storeCategoryCount = 0;
  let productCount = 0;
  let productCategoryAssigns = 0;
  for (const spec of STORES) {
    const owner = usersByEmail.get(spec.ownerEmail);
    if (!owner) {
      console.warn(`[seed] store ${spec.slug}: owner ${spec.ownerEmail} not found, skipping`);
      continue;
    }
    const category = catBySlug.get(spec.categorySlug);

    // Compute per-spec subscription fields. trial_days_remaining is shorthand
    // for setting trial_ends_at + next_billing_at from now.
    const trialDays = spec.trial_days_remaining;
    const trialEnd = typeof trialDays === "number"
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
      : null;
    const nextBilling = spec.subscription_status === "trialing"
      ? trialEnd
      : spec.subscription_status === "active"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

    const subscriptionFields = {
      subscription_status: spec.subscription_status ?? "active",
      plan_id: spec.plan_id ?? "starter",
      is_founding_seller: spec.is_founding_seller ?? false,
      trial_ends_at: spec.subscription_status === "trialing" ? trialEnd : null,
      next_billing_at: nextBilling,
    };

    const [store, storeCreated] = await Store.findOrCreate({
      where: { slug: spec.slug },
      defaults: {
        owner_id: owner.id,
        global_category_id: category?.id ?? null,
        name: spec.name,
        slug: spec.slug,
        description: spec.description,
        location: spec.location,
        whatsapp: spec.whatsapp,
        instagram: spec.instagram,
        facebook: spec.facebook,
        is_approved: spec.is_approved,
        ...subscriptionFields,
      },
    });
    // Force-apply subscription fields on every seed run so the demo always
    // shows the intended state (e.g. when you re-seed after manual admin tweaks).
    if (!storeCreated) {
      await store.update(subscriptionFields);
    }
    storeCount++;

    // Per-store category tabs (e.g. "Dresses", "Scarves", "Bags")
    const storeCatBySlug = new Map();
    for (const cat of spec.storeCategories ?? []) {
      const [row] = await StoreCategory.findOrCreate({
        where: { store_id: store.id, slug: cat.slug },
        defaults: {
          store_id:   store.id,
          name:       cat.name,
          slug:       cat.slug,
          sort_order: cat.sort_order ?? 0,
        },
      });
      storeCatBySlug.set(cat.slug, row);
      storeCategoryCount++;
    }

    for (const p of spec.products) {
      const storeCategoryId = p.categorySlug ? storeCatBySlug.get(p.categorySlug)?.id ?? null : null;

      const [product, created] = await Product.findOrCreate({
        where: { store_id: store.id, slug: p.slug },
        defaults: {
          store_id:          store.id,
          store_category_id: storeCategoryId,
          name:              p.name,
          slug:              p.slug,
          description:       p.description,
          price:             p.price,
          compare_at_price:  p.compare_at_price,
          stock:             p.stock,
          sku:               p.sku,
          images:            p.images,
          features:          p.features,
          status:            p.status,
          is_featured:       p.is_featured,
        },
      });
      if (created) productCount++;

      // Backfill category assignment for products created in earlier seeds
      // (when this column was always null). Idempotent — no-op when already set.
      if (!created && storeCategoryId && product.store_category_id !== storeCategoryId) {
        await product.update({ store_category_id: storeCategoryId });
        productCategoryAssigns++;
      }
    }
  }
  console.log(
    `[seed] stores: ${storeCount} present, ` +
    `store_categories: ${storeCategoryCount} present, ` +
    `products: +${productCount} created, ` +
    `product↔category backfilled: ${productCategoryAssigns}`
  );
}

module.exports = { seedSampleData, USERS };
