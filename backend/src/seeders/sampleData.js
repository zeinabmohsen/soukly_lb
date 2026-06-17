
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
  {
    email: "seller3@soukly.com",
    name: "Rami Haddad",
    password: "SouklyShoes!_R3k",
    phone: "+96170888999",
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
    description:
      "Hand-thrown ceramics and home goods from a small studio in Tripoli. Each piece is made one at a time on the wheel — we don't do batches, casts, or imports. Pottery is fired in a wood-burning kiln; woodwork is finished with food-safe oils; candles are poured in small runs from local soy and beeswax.",
    location: "Tripoli",
    whatsapp: "+96176555666",
    instagram: "karimcrafts",
    facebook: null,
    is_approved: true,
    logo_url: "https://images.unsplash.com/photo-1481401908818-600b7a676c0d?w=400&q=80&auto=format&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1481401908818-600b7a676c0d?w=1600&q=80&auto=format&fit=crop",
    // Established seller, paying monthly on the Pro plan
    subscription_status: "active",
    plan_id: "pro",
    is_founding_seller: false,
    hero: {
      bg_image_url: "https://images.unsplash.com/photo-1481401908818-600b7a676c0d?w=1920&q=80&auto=format&fit=crop",
      headline: "Made on the wheel. Made by hand.",
      tagline: "Small-batch ceramics, woodwork and candles from a studio in Tripoli.",
      cta_text: "Browse the studio",
      cta_link: "#products",
      overlay_color: "rgba(20,15,10,0.55)",
      layout: "centered",
    },
    footer: {
      about_text:
        "Karim has been throwing pots since 2014 and opened the Tripoli studio in 2019. Everything you see here is made on-site — most pieces by Karim, with help from two apprentices on woodwork and candles.",
      contact_email: "studio@karimcrafts.lb",
      extra_links: [
        { label: "Studio Visits",  url: "#visits" },
        { label: "Care & Cleaning", url: "#care" },
        { label: "Custom Orders",   url: "#custom" },
      ],
    },
    storeCategories: [
      { name: "Vases",     slug: "vases",     sort_order: 0 },
      { name: "Mugs",      slug: "mugs",      sort_order: 1 },
      { name: "Bowls",     slug: "bowls",     sort_order: 2 },
      { name: "Plates",    slug: "plates",    sort_order: 3 },
      { name: "Planters",  slug: "planters",  sort_order: 4 },
      { name: "Cutting Boards", slug: "cutting-boards", sort_order: 5 },
      { name: "Wooden Utensils", slug: "wooden-utensils", sort_order: 6 },
      { name: "Wooden Boxes", slug: "wooden-boxes", sort_order: 7 },
      { name: "Candles",   slug: "candles",   sort_order: 8 },
    ],
    products: [
      // ── Vases (4) ──────────────────────────────────────────────────────────
      {
        name: "Stoneware Vase — Tall",
        slug: "stoneware-vase-tall",
        categorySlug: "vases",
        description:
          "Hand-thrown stoneware vase, 28 cm tall, with a soft hand-glaze finish. The form is wheel-thrown on the day Karim feels like throwing tall — no two are exactly alike, and slight asymmetry is part of the look. Choose your glaze and (optionally) have it signed with a name on the base.",
        price: 65,
        compare_at_price: null,
        stock: 8,
        sku: "KC-VASE-001",
        images: [
          { url: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=800&q=80&auto=format&fit=crop", alt: "Stoneware Vase — front" },
          { url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80&auto=format&fit=crop", alt: "Stoneware Vase — side" },
        ],
        features: [
          { label: "Height",      value: "28 cm" },
          { label: "Material",    value: "High-fire stoneware" },
          { label: "Glaze",       value: "Food-safe, lead-free" },
          { label: "Watertight",  value: "Yes" },
        ],
        colors: [
          { name: "Brown stoneware", hex: "#7a4a2a", image_url: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=800&q=80&auto=format&fit=crop" },
          { name: "Bone white",      hex: "#efe7da", image_url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80&auto=format&fit=crop" },
          { name: "Indigo blue",     hex: "#1e3a8a", image_url: "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?w=800&q=80&auto=format&fit=crop" },
        ],
        customizations: [
          { type: "text", label: "Engraving on base", help: "A name or short word; we sign it before firing.", max_length: 20, placeholder: "e.g. Layla", required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Bud Vase — Wheel-Thrown",
        slug: "bud-vase-wheel-thrown",
        categorySlug: "vases",
        description:
          "A small, pinched-neck bud vase — meant for one or two stems at a time. Sits nicely on a windowsill or a stack of books.",
        price: 28,
        compare_at_price: null,
        stock: 30,
        sku: "KC-VASE-002",
        images: [
          { url: "https://images.unsplash.com/photo-1660721671073-e139688fa3cf?w=800&q=80&auto=format&fit=crop", alt: "Bud Vase" },
        ],
        features: [
          { label: "Height", value: "12 cm" },
          { label: "Opening", value: "2.5 cm" },
        ],
        colors: [
          { name: "Sand",   hex: "#d6c5a8", image_url: "https://images.unsplash.com/photo-1677761640321-b80251be00ca?w=800&q=80&auto=format&fit=crop" },
          { name: "Slate",  hex: "#475569", image_url: "https://images.unsplash.com/photo-1660721671073-e139688fa3cf?w=800&q=80&auto=format&fit=crop" },
          { name: "Olive",  hex: "#5d6b3a", image_url: "https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=800&q=80&auto=format&fit=crop" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Cylinder Vase — Hand-Built",
        slug: "cylinder-vase-handbuilt",
        categorySlug: "vases",
        description:
          "Hand-built (not thrown) cylinder vase. The seams are intentionally left visible at the base.",
        price: 52,
        compare_at_price: null,
        stock: 11,
        sku: "KC-VASE-003",
        images: [
          { url: "https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=800&q=80&auto=format&fit=crop", alt: "Cylinder Vase" },
        ],
        features: [
          { label: "Height",   value: "22 cm" },
          { label: "Diameter", value: "9 cm" },
          { label: "Build",    value: "Hand-built, slab" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Bottle Vase — Long Neck",
        slug: "bottle-vase-long-neck",
        categorySlug: "vases",
        description:
          "A long-necked bottle vase — works just as well empty as it does with a single dried branch.",
        price: 78,
        compare_at_price: 95,
        stock: 6,
        sku: "KC-VASE-004",
        images: [
          { url: "https://images.unsplash.com/photo-1481401908818-600b7a676c0d?w=800&q=80&auto=format&fit=crop", alt: "Bottle Vase" },
        ],
        features: [
          { label: "Height", value: "34 cm" },
          { label: "Style",  value: "Long-neck bottle" },
        ],
        status: "active",
        is_featured: true,
      },

      // ── Mugs (5) ───────────────────────────────────────────────────────────
      {
        name: "Daily Mug — 350 ml",
        slug: "daily-mug-350",
        categorySlug: "mugs",
        description:
          "The mug Karim uses every morning. A round, comfortable handle and a slightly heavy base so it doesn't tip. Each mug is signed on the underside. Optional engraving on the side — pick a single word, name, or short phrase.",
        price: 22,
        compare_at_price: null,
        stock: 60,
        sku: "KC-MUG-001",
        images: [
          { url: "https://images.unsplash.com/photo-1495100497150-fe209c585f50?w=800&q=80&auto=format&fit=crop", alt: "Daily Mug — front" },
          { url: "https://images.unsplash.com/photo-1536936812504-0e77dc3f0b40?w=800&q=80&auto=format&fit=crop", alt: "Daily Mug — handle" },
        ],
        features: [
          { label: "Capacity",      value: "350 ml" },
          { label: "Dishwasher-safe", value: "Yes" },
          { label: "Microwave-safe",  value: "Yes" },
        ],
        colors: [
          { name: "White matte", hex: "#f0ece4", image_url: "https://images.unsplash.com/photo-1495100497150-fe209c585f50?w=800&q=80&auto=format&fit=crop" },
          { name: "Charcoal",    hex: "#2a2a2a", image_url: "https://images.unsplash.com/photo-1536936812504-0e77dc3f0b40?w=800&q=80&auto=format&fit=crop" },
          { name: "Terracotta",  hex: "#b85c3a", image_url: "https://images.unsplash.com/photo-1590422886897-7dd50e58577e?w=800&q=80&auto=format&fit=crop" },
        ],
        customizations: [
          { type: "text",   label: "Engraving",   help: "Single word or name. Sign in script.", max_length: 16, placeholder: "e.g. Sami", required: false },
          { type: "select", label: "Handle side", options: ["Right-handed", "Left-handed"], required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Espresso Cup — 80 ml",
        slug: "espresso-cup-80",
        categorySlug: "mugs",
        description:
          "Small thick-walled espresso cup that retains heat. Sold individually, but works as a set.",
        price: 14,
        compare_at_price: null,
        stock: 80,
        sku: "KC-MUG-002",
        images: [
          { url: "https://images.unsplash.com/photo-1633738674687-9505aa528801?w=800&q=80&auto=format&fit=crop", alt: "Espresso Cup" },
        ],
        features: [
          { label: "Capacity", value: "80 ml" },
          { label: "Wall",     value: "Thick-walled, heat-retaining" },
        ],
        colors: [
          { name: "Black",    hex: "#0a0a0a" },
          { name: "Cream",    hex: "#f5edd8" },
          { name: "Sage",     hex: "#90a387" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Tea Cup with Saucer",
        slug: "tea-cup-with-saucer",
        categorySlug: "mugs",
        description:
          "A pair: a wide-mouth tea cup and a matching saucer. The saucer doubles as a small dish for sugar cubes or a tea bag.",
        price: 32,
        compare_at_price: null,
        stock: 24,
        sku: "KC-MUG-003",
        images: [
          { url: "https://images.unsplash.com/photo-1647967359199-154cc8bd7942?w=800&q=80&auto=format&fit=crop", alt: "Tea Cup with Saucer" },
        ],
        features: [
          { label: "Cup capacity", value: "180 ml" },
          { label: "Set",          value: "Cup + saucer" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Large Latte Mug — 450 ml",
        slug: "large-latte-mug-450",
        categorySlug: "mugs",
        description:
          "Oversized mug for full-fat lattes and very long mornings. Wide handle, sturdy base.",
        price: 26,
        compare_at_price: null,
        stock: 36,
        sku: "KC-MUG-004",
        images: [
          { url: "https://images.unsplash.com/photo-1661004286870-53a33a2ad3df?w=800&q=80&auto=format&fit=crop", alt: "Large Latte Mug" },
        ],
        features: [
          { label: "Capacity", value: "450 ml" },
          { label: "Handle",   value: "Oversized, fits 3 fingers" },
        ],
        colors: [
          { name: "Off-white", hex: "#f0ece4" },
          { name: "Forest",    hex: "#1f3a2e" },
        ],
        customizations: [
          { type: "text", label: "Engraving", max_length: 20, placeholder: "Optional", required: false },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Travel Mug — Stoneware",
        slug: "travel-mug-stoneware",
        categorySlug: "mugs",
        description:
          "Lidded stoneware travel mug — the lid is silicone and dishwasher-safe. Yes, it actually keeps coffee hot for a couple of hours.",
        price: 38,
        compare_at_price: null,
        stock: 18,
        sku: "KC-MUG-005",
        images: [
          { url: "https://images.unsplash.com/photo-1666447606111-33167792af81?w=800&q=80&auto=format&fit=crop", alt: "Travel Mug" },
        ],
        features: [
          { label: "Capacity",    value: "400 ml" },
          { label: "Lid material", value: "Silicone, dishwasher-safe" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Bowls (3) ──────────────────────────────────────────────────────────
      {
        name: "Wide Serving Bowl",
        slug: "wide-serving-bowl",
        categorySlug: "bowls",
        description:
          "A wide, shallow serving bowl meant for one large salad or a family pasta. Works as a centerpiece on its own.",
        price: 56,
        compare_at_price: null,
        stock: 14,
        sku: "KC-BOWL-001",
        images: [
          { url: "https://images.unsplash.com/photo-1595351298020-038700609878?w=800&q=80&auto=format&fit=crop", alt: "Wide Serving Bowl" },
        ],
        features: [
          { label: "Diameter", value: "30 cm" },
          { label: "Depth",    value: "7 cm" },
        ],
        colors: [
          { name: "Bone white", hex: "#efe7da" },
          { name: "Speckled",   hex: "#c9b9a2" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Cereal / Soup Bowl",
        slug: "cereal-soup-bowl",
        categorySlug: "bowls",
        description:
          "Everyday cereal or soup bowl. Sold individually so you can build a mismatched set on purpose.",
        price: 18,
        compare_at_price: null,
        stock: 70,
        sku: "KC-BOWL-002",
        images: [
          { url: "https://images.unsplash.com/photo-1607556671927-78a6605e290b?w=800&q=80&auto=format&fit=crop", alt: "Cereal Bowl" },
        ],
        features: [
          { label: "Capacity", value: "500 ml" },
        ],
        colors: [
          { name: "White",      hex: "#f5f1e8" },
          { name: "Mustard",    hex: "#d4a017" },
          { name: "Deep blue",  hex: "#1e3a5f" },
          { name: "Terracotta", hex: "#b85c3a" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Ramen Bowl with Chopstick Rest",
        slug: "ramen-bowl",
        categorySlug: "bowls",
        description:
          "Deep bowl with a small notch on the rim that holds chopsticks. Made specifically for noodles.",
        price: 34,
        compare_at_price: null,
        stock: 22,
        sku: "KC-BOWL-003",
        images: [
          { url: "https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=800&q=80&auto=format&fit=crop", alt: "Ramen Bowl" },
        ],
        features: [
          { label: "Capacity", value: "900 ml" },
          { label: "Feature",  value: "Notched rim for chopsticks" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Plates (2) ─────────────────────────────────────────────────────────
      {
        name: "Dinner Plate — Hand-Glazed",
        slug: "dinner-plate-hand-glazed",
        categorySlug: "plates",
        description:
          "Wide-rim dinner plate finished with a hand-poured glaze. Sold as one plate — order four if you want a set, six if you want spares.",
        price: 24,
        compare_at_price: null,
        stock: 45,
        sku: "KC-PLATE-001",
        images: [
          { url: "https://images.unsplash.com/photo-1589051088132-06f36a22012a?w=800&q=80&auto=format&fit=crop", alt: "Dinner Plate" },
        ],
        features: [
          { label: "Diameter", value: "27 cm" },
        ],
        colors: [
          { name: "Cream",     hex: "#f5edd8" },
          { name: "Sage",      hex: "#90a387" },
          { name: "Indigo",    hex: "#1e3a8a" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Side / Salad Plate",
        slug: "side-salad-plate",
        categorySlug: "plates",
        description:
          "Smaller plate for a side dish, salad, or a piece of cake.",
        price: 18,
        compare_at_price: null,
        stock: 50,
        sku: "KC-PLATE-002",
        images: [
          { url: "https://images.unsplash.com/photo-1590605095243-072811dbe64c?w=800&q=80&auto=format&fit=crop", alt: "Side Plate" },
        ],
        features: [
          { label: "Diameter", value: "20 cm" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Planters (3) ───────────────────────────────────────────────────────
      {
        name: "Hand-Thrown Planter — Medium",
        slug: "hand-thrown-planter-medium",
        categorySlug: "planters",
        description:
          "Stoneware planter with a single drainage hole and a matching saucer. Fits a 15 cm nursery pot inside.",
        price: 48,
        compare_at_price: null,
        stock: 20,
        sku: "KC-PLANT-001",
        images: [
          { url: "https://images.unsplash.com/photo-1609881583302-61548332039c?w=800&q=80&auto=format&fit=crop", alt: "Planter Medium" },
        ],
        features: [
          { label: "Outer diameter", value: "17 cm" },
          { label: "Drainage",       value: "Single hole + saucer" },
        ],
        colors: [
          { name: "Sand",        hex: "#c2a679" },
          { name: "Charcoal",    hex: "#2a2a2a" },
          { name: "Ocean blue",  hex: "#0e6b7a" },
          { name: "Terracotta",  hex: "#b85c3a" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Hanging Planter",
        slug: "hanging-planter",
        categorySlug: "planters",
        description:
          "Half-sphere planter with three holes around the rim and a natural cotton rope for hanging.",
        price: 62,
        compare_at_price: 75,
        stock: 12,
        sku: "KC-PLANT-002",
        images: [
          { url: "https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d?w=800&q=80&auto=format&fit=crop", alt: "Hanging Planter" },
        ],
        features: [
          { label: "Drop length", value: "Adjustable, up to 90 cm" },
          { label: "Rope",        value: "Natural cotton, removable" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Mini Succulent Pot",
        slug: "mini-succulent-pot",
        categorySlug: "planters",
        description:
          "Tiny pot sized for a single succulent. Designed to sit on a desk without taking up real estate.",
        price: 14,
        compare_at_price: null,
        stock: 60,
        sku: "KC-PLANT-003",
        images: [
          { url: "https://images.unsplash.com/photo-1481401908818-600b7a676c0d?w=800&q=80&auto=format&fit=crop", alt: "Mini Succulent Pot" },
        ],
        features: [
          { label: "Diameter", value: "7 cm" },
        ],
        colors: [
          { name: "Bone",      hex: "#efe7da" },
          { name: "Soft pink", hex: "#e8c8c1" },
          { name: "Sage",      hex: "#90a387" },
          { name: "Slate",     hex: "#475569" },
          { name: "Mustard",   hex: "#d4a017" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Cutting Boards (3) ─────────────────────────────────────────────────
      {
        name: "Olive Wood Cutting Board — Large",
        slug: "olive-wood-cutting-board-large",
        categorySlug: "cutting-boards",
        description:
          "Hand-finished olive wood board, food-safe finish. Engrave a name or a date for a wedding or housewarming gift — we burn it in by hand.",
        price: 58,
        compare_at_price: null,
        stock: 22,
        sku: "KC-BOARD-001",
        images: [
          { url: "https://images.unsplash.com/photo-1666013942797-9daa4b8b3b4f?w=800&q=80&auto=format&fit=crop", alt: "Olive Wood Board — large" },
          { url: "https://images.unsplash.com/photo-1617695615794-a5abcece0f48?w=800&q=80&auto=format&fit=crop", alt: "Olive Wood Board — top" },
        ],
        features: [
          { label: "Material", value: "Lebanese olive wood" },
          { label: "Finish",   value: "Food-safe mineral oil" },
          { label: "Size",     value: "40 × 25 × 2 cm" },
        ],
        customizations: [
          { type: "text",   label: "Engraving",       help: "Name, date, or short message — wood-burned by hand.", max_length: 40, placeholder: "e.g. The Haddad Family · 2024", required: false },
          { type: "select", label: "Engraving style", options: ["Plain block", "Script", "Initials only"], required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Walnut Cheese Board",
        slug: "walnut-cheese-board",
        categorySlug: "cutting-boards",
        description:
          "Smaller walnut board with a juice groove around the edge. Perfect for cheese, charcuterie, and a knife.",
        price: 42,
        compare_at_price: null,
        stock: 18,
        sku: "KC-BOARD-002",
        images: [
          { url: "https://images.unsplash.com/photo-1690983322070-22861e13ce47?w=800&q=80&auto=format&fit=crop", alt: "Walnut Cheese Board" },
        ],
        features: [
          { label: "Material", value: "Walnut" },
          { label: "Size",     value: "30 × 18 × 1.8 cm" },
          { label: "Feature",  value: "Juice groove" },
        ],
        customizations: [
          { type: "text", label: "Engraving", max_length: 30, required: false },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Bread Board with Handle",
        slug: "bread-board-with-handle",
        categorySlug: "cutting-boards",
        description:
          "Long, narrow bread board with a built-in handle for hanging. Made for slicing — fits a full baguette.",
        price: 36,
        compare_at_price: null,
        stock: 25,
        sku: "KC-BOARD-003",
        images: [
          { url: "https://images.unsplash.com/photo-1624811533744-f85d5325d49c?w=800&q=80&auto=format&fit=crop", alt: "Bread Board" },
        ],
        features: [
          { label: "Material", value: "Beech" },
          { label: "Length",   value: "55 cm including handle" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Wooden Utensils (3) ────────────────────────────────────────────────
      {
        name: "Wooden Cooking Spoon — Set of 3",
        slug: "wooden-cooking-spoon-set",
        categorySlug: "wooden-utensils",
        description:
          "Three spoons in one set: a deep stew spoon, a flat-edge stirring spoon, and a slotted spoon. Pick your wood — each has a slightly different weight and grain.",
        price: 32,
        compare_at_price: 42,
        stock: 28,
        sku: "KC-UTEN-001",
        images: [
          { url: "https://images.unsplash.com/photo-1583596838470-10ae8e96a95a?w=800&q=80&auto=format&fit=crop", alt: "Wooden Spoon Set" },
        ],
        features: [
          { label: "Set",       value: "3 spoons" },
          { label: "Length",    value: "30 cm each" },
          { label: "Finish",    value: "Raw, sanded to 400 grit" },
        ],
        customizations: [
          { type: "select", label: "Wood type",    options: ["Olive", "Walnut", "Beech"], required: true },
          { type: "select", label: "Handle shape", options: ["Rounded", "Square"], required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Salad Servers — Pair",
        slug: "salad-servers-pair",
        categorySlug: "wooden-utensils",
        description:
          "A matched pair of salad servers: one with tines, one with a flat scoop. Sized for a medium serving bowl.",
        price: 26,
        compare_at_price: null,
        stock: 34,
        sku: "KC-UTEN-002",
        images: [
          { url: "https://images.unsplash.com/photo-1602881917760-7379db593981?w=800&q=80&auto=format&fit=crop", alt: "Salad Servers" },
        ],
        features: [
          { label: "Length", value: "28 cm" },
        ],
        customizations: [
          { type: "select", label: "Wood type", options: ["Olive", "Walnut"], required: true },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Butter Knife",
        slug: "butter-knife",
        categorySlug: "wooden-utensils",
        description:
          "Small wooden butter knife — soft enough to spread cold butter without tearing the bread.",
        price: 9,
        compare_at_price: null,
        stock: 90,
        sku: "KC-UTEN-003",
        images: [
          { url: "https://images.unsplash.com/photo-1567763745030-bfe9c51bec27?w=800&q=80&auto=format&fit=crop", alt: "Butter Knife" },
        ],
        features: [
          { label: "Length", value: "15 cm" },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Wooden Boxes (2) ───────────────────────────────────────────────────
      {
        name: "Keepsake Box — Small",
        slug: "keepsake-box-small",
        categorySlug: "wooden-boxes",
        description:
          "Small lidded box. The classic use: jewellery, watches, or a stack of letters. Engrave a name or initials on the lid.",
        price: 54,
        compare_at_price: null,
        stock: 16,
        sku: "KC-BOX-001",
        images: [
          { url: "https://images.unsplash.com/photo-1604259596863-57153177d40b?w=800&q=80&auto=format&fit=crop", alt: "Keepsake Box" },
        ],
        features: [
          { label: "Outer size", value: "16 × 12 × 6 cm" },
          { label: "Lining",     value: "Soft felt" },
        ],
        customizations: [
          { type: "text",   label: "Lid engraving", max_length: 30, placeholder: "Name or initials", required: false },
          { type: "select", label: "Wood type",    options: ["Olive", "Walnut", "Cedar"], required: true },
          { type: "select", label: "Felt colour",  options: ["Cream", "Navy", "Black", "Sage"], required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Recipe Card Box",
        slug: "recipe-card-box",
        categorySlug: "wooden-boxes",
        description:
          "Designed to hold 4×6 recipe cards with two cardboard dividers. Holds about 80 cards.",
        price: 44,
        compare_at_price: null,
        stock: 12,
        sku: "KC-BOX-002",
        images: [
          { url: "https://images.unsplash.com/photo-1602881917445-0b1ba001addf?w=800&q=80&auto=format&fit=crop", alt: "Recipe Card Box" },
        ],
        features: [
          { label: "Card size",  value: "Fits 4×6 cards" },
          { label: "Capacity",   value: "~80 cards" },
          { label: "Dividers",   value: "2 cardboard, replaceable" },
        ],
        customizations: [
          { type: "text", label: "Lid engraving", help: "Family name or recipe collection title.", max_length: 30, required: false },
        ],
        status: "active",
        is_featured: false,
      },

      // ── Candles (5) ────────────────────────────────────────────────────────
      {
        name: "Cedar Soy Candle",
        slug: "cedar-soy-candle",
        categorySlug: "candles",
        description:
          "Hand-poured soy candle with Lebanese cedar essential oil. Comes in a reusable ceramic vessel made in our own studio.",
        price: 24,
        compare_at_price: 30,
        stock: 40,
        sku: "KC-CANDLE-001",
        images: [
          { url: "https://images.unsplash.com/photo-1603905179139-db12ab535ca9?w=800&q=80&auto=format&fit=crop", alt: "Cedar Candle" },
        ],
        features: [
          { label: "Burn time", value: "~40 hours" },
          { label: "Vessel",    value: "Stoneware, reusable" },
          { label: "Wax",       value: "100% soy" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Signature Scented Candle — Pick Your Scent",
        slug: "signature-scented-candle",
        categorySlug: "candles",
        description:
          "Our base soy candle in your choice of seven scents. Each batch is poured to order — if you pick a scent we don't have on hand, we make it that week.",
        price: 28,
        compare_at_price: null,
        stock: 50,
        sku: "KC-CANDLE-002",
        images: [
          { url: "https://images.unsplash.com/photo-1602607203588-d6d0eda790e3?w=800&q=80&auto=format&fit=crop", alt: "Signature Candle" },
        ],
        features: [
          { label: "Burn time", value: "~45 hours" },
          { label: "Wax",       value: "100% soy" },
        ],
        colors: [
          { name: "Cream wax",  hex: "#f5edd8" },
          { name: "Sand wax",   hex: "#c2a679" },
          { name: "Forest wax", hex: "#1f3a2e" },
        ],
        customizations: [
          { type: "select", label: "Scent",     options: ["Cedar", "Lavender", "Vanilla", "Fig & Olive", "Orange Blossom", "Sandalwood", "Unscented"], required: true },
          { type: "select", label: "Vessel",    options: ["Stoneware (reusable)", "Amber glass", "Clear glass"], required: true },
          { type: "text",   label: "Gift note", help: "Printed on a small card, slipped into the box.", max_length: 100, required: false },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Beeswax Pillar Candle",
        slug: "beeswax-pillar-candle",
        categorySlug: "candles",
        description:
          "100% Lebanese beeswax pillar candle — no fragrance added, no dyes. The honey scent is from the wax itself.",
        price: 32,
        compare_at_price: null,
        stock: 22,
        sku: "KC-CANDLE-003",
        images: [
          { url: "https://images.unsplash.com/photo-1602607203475-c5e99918dfc5?w=800&q=80&auto=format&fit=crop", alt: "Beeswax Pillar" },
        ],
        features: [
          { label: "Burn time", value: "~70 hours" },
          { label: "Wax",       value: "100% Lebanese beeswax" },
          { label: "Scent",     value: "Natural honey, no added fragrance" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Travel Tin Candle",
        slug: "travel-tin-candle",
        categorySlug: "candles",
        description:
          "Smaller soy candle in a tin with a screw-on lid — easy to bring along when you're staying somewhere that needs a bit of warmth.",
        price: 14,
        compare_at_price: null,
        stock: 70,
        sku: "KC-CANDLE-004",
        images: [
          { url: "https://images.unsplash.com/photo-1620915789294-c972b1b1af7c?w=800&q=80&auto=format&fit=crop", alt: "Travel Tin Candle" },
        ],
        features: [
          { label: "Burn time", value: "~18 hours" },
          { label: "Vessel",    value: "Steel tin with lid" },
        ],
        customizations: [
          { type: "select", label: "Scent", options: ["Cedar", "Lavender", "Vanilla", "Fig & Olive"], required: true },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Taper Candles — Set of 2",
        slug: "taper-candles-set-of-2",
        categorySlug: "candles",
        description:
          "Two dipped beeswax taper candles, 25 cm long. Fits any standard taper holder.",
        price: 18,
        compare_at_price: null,
        stock: 45,
        sku: "KC-CANDLE-005",
        images: [
          { url: "https://images.unsplash.com/photo-1603897076223-17f346f02a03?w=800&q=80&auto=format&fit=crop", alt: "Taper Candles" },
        ],
        features: [
          { label: "Length",   value: "25 cm" },
          { label: "Set",      value: "2 tapers" },
          { label: "Burn time", value: "~6 hours each" },
        ],
        colors: [
          { name: "Natural beeswax", hex: "#e8c87a" },
          { name: "Ivory",           hex: "#f5edd8" },
          { name: "Charcoal",        hex: "#2a2a2a" },
        ],
        status: "active",
        is_featured: false,
      },
    ],
  },
  {
    ownerEmail: "seller3@soukly.com",
    categorySlug: "fashion",
    name: "Beirut Soles",
    slug: "beirut-soles",
    description:
      "Premium footwear curated in Beirut. From hand-stitched leather boots to performance running shoes — Beirut Soles brings together craftsmanship, comfort, and Mediterranean style for every step you take.",
    location: "Beirut",
    whatsapp: "+96170888999",
    instagram: "beirutsoles",
    facebook: "beirutsoles",
    tiktok: "beirutsoles",
    is_approved: true,
    logo_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1600&q=80&auto=format&fit=crop",
    // Established seller, paying on the Premium plan
    subscription_status: "active",
    plan_id: "premium",
    is_founding_seller: false,
    hero: {
      bg_image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&q=80&auto=format&fit=crop",
      headline: "Step Into Beirut.",
      tagline: "Premium footwear, hand-picked for every occasion.",
      cta_text: "Shop Collection",
      cta_link: "#products",
      overlay_color: "rgba(0,0,0,0.55)",
      layout: "left",
    },
    footer: {
      about_text:
        "Beirut Soles opened its doors in Hamra in 2021. We work directly with Lebanese cobblers and select international brands to bring you footwear that lasts.",
      contact_email: "hello@beirutsoles.com",
      extra_links: [
        { label: "Size Guide", url: "#size-guide" },
        { label: "Care Instructions", url: "#care" },
        { label: "Returns Policy", url: "#returns" },
      ],
    },
    storeCategories: [
      { name: "Sneakers",   slug: "sneakers",   sort_order: 0 },
      { name: "Running",    slug: "running",    sort_order: 1 },
      { name: "Boots",      slug: "boots",      sort_order: 2 },
      { name: "Sandals",    slug: "sandals",    sort_order: 3 },
      { name: "Heels",      slug: "heels",      sort_order: 4 },
      { name: "Loafers",    slug: "loafers",    sort_order: 5 },
    ],
    products: [
      {
        name: "Cloud Runner Low-Top Sneakers",
        slug: "cloud-runner-low-top",
        categorySlug: "sneakers",
        description:
          "Lightweight everyday sneaker with a cushioned EVA midsole and breathable knit upper. Designed for long city walks — from Gemmayzeh to Mar Mikhael without a sore foot.",
        price: 79,
        compare_at_price: 99,
        stock: 28,
        sku: "BS-SNK-001",
        images: [
          { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop", alt: "Cloud Runner Low-Top — side view" },
          { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format&fit=crop", alt: "Cloud Runner Low-Top — top view" },
        ],
        features: [
          { label: "Upper",   value: "Breathable knit" },
          { label: "Midsole", value: "EVA foam" },
          { label: "Outsole", value: "Rubber, slip-resistant" },
          { label: "Weight",  value: "240 g (size 42)" },
        ],
        colors: [
          { name: "Crimson",  hex: "#dc2626" },
          { name: "Pine",     hex: "#1f3a2e" },
          { name: "Off-white", hex: "#f5f1e8" },
          { name: "Slate",    hex: "#475569" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Urban Canvas High-Top",
        slug: "urban-canvas-high-top",
        categorySlug: "sneakers",
        description:
          "Classic high-top canvas sneaker with a vulcanized rubber sole. Five-eyelet lacing and a padded ankle collar — built for the long haul.",
        price: 55,
        compare_at_price: null,
        stock: 42,
        sku: "BS-SNK-002",
        images: [{ url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format&fit=crop", alt: "Urban Canvas High-Top" }],
        features: [
          { label: "Upper",   value: "12 oz cotton canvas" },
          { label: "Lining",  value: "Cotton twill" },
          { label: "Outsole", value: "Vulcanized rubber" },
        ],
        colors: [
          { name: "Black",     hex: "#0a0a0a" },
          { name: "Optic white", hex: "#fafafa" },
          { name: "Navy",      hex: "#1e293b" },
          { name: "Mustard",   hex: "#d4a017" },
          { name: "Burgundy",  hex: "#7c2d3a" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Marathon Pro 5 Running Shoes",
        slug: "marathon-pro-5",
        categorySlug: "running",
        description:
          "Carbon-plated road runner engineered for tempo workouts and race day. The Pro 5 returns more energy per stride and locks the heel in place over long distances.",
        price: 189,
        compare_at_price: 220,
        stock: 14,
        sku: "BS-RUN-001",
        images: [
          { url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80&auto=format&fit=crop", alt: "Marathon Pro 5 — lateral" },
          { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80&auto=format&fit=crop", alt: "Marathon Pro 5 — sole" },
        ],
        features: [
          { label: "Drop",     value: "8 mm" },
          { label: "Plate",    value: "Full-length carbon" },
          { label: "Midsole",  value: "PEBA foam" },
          { label: "Best for", value: "Race / tempo" },
        ],
        colors: [
          { name: "Electric blue", hex: "#1d4ed8" },
          { name: "Volt",          hex: "#bef264" },
          { name: "Carbon black",  hex: "#1f1f1f" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Trailblazer Off-Road Runner",
        slug: "trailblazer-off-road",
        categorySlug: "running",
        description:
          "Aggressive 5 mm lugs grip dirt, gravel, and rocky paths. A rock plate underfoot shields against sharp edges on Mount Lebanon trails.",
        price: 145,
        compare_at_price: null,
        stock: 18,
        sku: "BS-RUN-002",
        images: [{ url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80&auto=format&fit=crop", alt: "Trailblazer Off-Road Runner" }],
        features: [
          { label: "Lug depth", value: "5 mm" },
          { label: "Protection", value: "Rock plate" },
          { label: "Upper",    value: "Ripstop mesh" },
          { label: "Best for", value: "Mountain trail" },
        ],
        colors: [
          { name: "Moss",    hex: "#4d5d3a" },
          { name: "Clay",    hex: "#b97650" },
          { name: "Granite", hex: "#525252" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Chelsea Boots — Polished Leather",
        slug: "chelsea-boots-polished-leather",
        categorySlug: "boots",
        description:
          "Hand-finished Chelsea boot in full-grain calfskin. Elastic side panels and a pull tab at the heel — pairs equally well with denim and a tailored suit.",
        price: 215,
        compare_at_price: 260,
        stock: 9,
        sku: "BS-BOOT-001",
        images: [
          { url: "https://images.unsplash.com/photo-1608629601270-a0007becead3?w=800&q=80&auto=format&fit=crop", alt: "Chelsea Boots — pair" },
          { url: "https://images.unsplash.com/photo-1534233812932-59b8fa1b780c?w=800&q=80&auto=format&fit=crop", alt: "Chelsea Boots — heel detail" },
        ],
        features: [
          { label: "Upper",       value: "Full-grain calfskin" },
          { label: "Construction", value: "Blake stitch" },
          { label: "Sole",        value: "Leather with rubber heel" },
          { label: "Origin",      value: "Hand-finished in Beirut" },
        ],
        colors: [
          { name: "Jet black", hex: "#0a0a0a" },
          { name: "Oxblood",   hex: "#4a1419" },
          { name: "Walnut",    hex: "#5d3a1a" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Suede Desert Boots",
        slug: "suede-desert-boots",
        categorySlug: "boots",
        description:
          "Two-eyelet desert boot in soft sand-coloured suede on a natural crepe sole. A timeless silhouette that's just as at home with chinos as it is with shorts.",
        price: 135,
        compare_at_price: null,
        stock: 16,
        sku: "BS-BOOT-002",
        images: [{ url: "https://images.unsplash.com/photo-1610548194675-3f7a220b26f5?w=800&q=80&auto=format&fit=crop", alt: "Suede Desert Boots" }],
        features: [
          { label: "Upper", value: "Italian suede" },
          { label: "Sole",  value: "Natural crepe" },
          { label: "Lining", value: "Unlined" },
        ],
        colors: [
          { name: "Sand",       hex: "#c2a679" },
          { name: "Chocolate",  hex: "#3d2817" },
          { name: "Stone grey", hex: "#8a8580" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Cedar Leather Slide Sandals",
        slug: "cedar-leather-slides",
        categorySlug: "sandals",
        description:
          "Vegetable-tanned leather slides with a contoured cork footbed. The leather softens and moulds to your foot over time.",
        price: 62,
        compare_at_price: 78,
        stock: 24,
        sku: "BS-SAND-001",
        images: [{ url: "https://images.unsplash.com/photo-1585120824848-8a5cd41493d2?w=800&q=80&auto=format&fit=crop", alt: "Cedar Leather Slide Sandals" }],
        features: [
          { label: "Upper",    value: "Veg-tanned leather" },
          { label: "Footbed",  value: "Contoured cork" },
          { label: "Outsole",  value: "EVA, lightweight" },
        ],
        colors: [
          { name: "Natural tan", hex: "#c89968" },
          { name: "Dark brown",  hex: "#3d251a" },
          { name: "Black",       hex: "#0a0a0a" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Coastal Sport Sandals",
        slug: "coastal-sport-sandals",
        categorySlug: "sandals",
        description:
          "Quick-drying sport sandal with adjustable straps and a grippy outsole. Take them from the beach in Batroun straight to dinner.",
        price: 48,
        compare_at_price: null,
        stock: 36,
        sku: "BS-SAND-002",
        images: [{ url: "https://images.unsplash.com/photo-1628375385879-1af64230c2e1?w=800&q=80&auto=format&fit=crop", alt: "Coastal Sport Sandals" }],
        features: [
          { label: "Straps",   value: "Adjustable, hook-and-loop" },
          { label: "Drying",   value: "Quick-dry webbing" },
          { label: "Outsole",  value: "Grippy rubber" },
        ],
        colors: [
          { name: "Coral",      hex: "#ff7f5c" },
          { name: "Teal",       hex: "#0d9488" },
          { name: "Black",      hex: "#0a0a0a" },
          { name: "Sun yellow", hex: "#facc15" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Stiletto Heel Pumps — 95 mm",
        slug: "stiletto-pumps-95",
        categorySlug: "heels",
        description:
          "A classic pointed-toe stiletto in supple Italian leather. Padded insole and a 95 mm heel that's surprisingly walkable.",
        price: 165,
        compare_at_price: 195,
        stock: 11,
        sku: "BS-HEEL-001",
        images: [{ url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&q=80&auto=format&fit=crop", alt: "Stiletto Heel Pumps" }],
        features: [
          { label: "Heel height", value: "95 mm" },
          { label: "Toe shape",   value: "Pointed" },
          { label: "Upper",       value: "Italian leather" },
          { label: "Insole",      value: "Padded" },
        ],
        colors: [
          { name: "Classic black", hex: "#0a0a0a" },
          { name: "Nude",          hex: "#d4a78e" },
          { name: "Scarlet",       hex: "#b91c1c" },
          { name: "Champagne",     hex: "#d4af7a" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Block Heel Mary Janes",
        slug: "block-heel-mary-janes",
        categorySlug: "heels",
        description:
          "A modern take on a heritage silhouette: rounded toe, sturdy 55 mm block heel, and a delicate ankle strap.",
        price: 119,
        compare_at_price: null,
        stock: 20,
        sku: "BS-HEEL-002",
        images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&auto=format&fit=crop", alt: "Block Heel Mary Janes" }],
        features: [
          { label: "Heel height", value: "55 mm" },
          { label: "Closure",     value: "Ankle strap" },
          { label: "Upper",       value: "Patent leather" },
        ],
        colors: [
          { name: "Patent black",  hex: "#0a0a0a" },
          { name: "Patent burgundy", hex: "#5e1b25" },
          { name: "Patent ivory",  hex: "#f1ead6" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Penny Loafers — Cordovan",
        slug: "penny-loafers-cordovan",
        categorySlug: "loafers",
        description:
          "A Goodyear-welted penny loafer in deep cordovan leather. Built on a wooden last so it holds its shape for years.",
        price: 240,
        compare_at_price: 290,
        stock: 7,
        sku: "BS-LOAF-001",
        images: [
          { url: "https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=800&q=80&auto=format&fit=crop", alt: "Penny Loafers — pair" },
          { url: "https://images.unsplash.com/photo-1662541089338-c7d53b88be70?w=800&q=80&auto=format&fit=crop", alt: "Penny Loafers — top stitching" },
        ],
        features: [
          { label: "Upper",        value: "Cordovan leather" },
          { label: "Construction", value: "Goodyear welt" },
          { label: "Sole",         value: "Leather, rubber heel" },
          { label: "Resoleable",   value: "Yes" },
        ],
        colors: [
          { name: "Cordovan",   hex: "#6b1f1f" },
          { name: "Espresso",   hex: "#3b2418" },
          { name: "Whiskey",    hex: "#a0623a" },
        ],
        status: "active",
        is_featured: true,
      },
      {
        name: "Tassel Loafers — Suede",
        slug: "tassel-loafers-suede",
        categorySlug: "loafers",
        description:
          "Soft Italian suede tassel loafer on a leather-stacked heel. A relaxed alternative to the penny — wear it sockless in summer.",
        price: 175,
        compare_at_price: null,
        stock: 13,
        sku: "BS-LOAF-002",
        images: [{ url: "https://images.unsplash.com/photo-1676121270762-47c8d3a7b9d5?w=800&q=80&auto=format&fit=crop", alt: "Tassel Loafers — Suede" }],
        features: [
          { label: "Upper",  value: "Italian suede" },
          { label: "Lining", value: "Soft calf leather" },
          { label: "Heel",   value: "Leather-stacked, 20 mm" },
        ],
        colors: [
          { name: "Navy suede",   hex: "#1e2a4a" },
          { name: "Forest suede", hex: "#1f3a2e" },
          { name: "Camel suede",  hex: "#a87852" },
          { name: "Charcoal",     hex: "#2a2a2a" },
        ],
        status: "active",
        is_featured: false,
      },
      {
        name: "Limited Edition — Hand-Painted Sneaker",
        slug: "hand-painted-sneaker-le",
        categorySlug: "sneakers",
        description:
          "A numbered run of 25, each hand-painted by a local Beirut artist. Every pair is unique — colour placement varies slightly.",
        price: 295,
        compare_at_price: null,
        stock: 4,
        sku: "BS-SNK-LE-001",
        images: [{ url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80&auto=format&fit=crop", alt: "Hand-Painted Sneaker" }],
        features: [
          { label: "Edition", value: "Numbered, /25" },
          { label: "Finish",  value: "Hand-painted acrylic" },
          { label: "Note",    value: "No two pairs identical" },
        ],
        colors: [
          { name: "Sunset",  hex: "#f97316" },
          { name: "Cobalt",  hex: "#1e40af" },
          { name: "Rose",    hex: "#e11d48" },
        ],
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
    // Also re-apply branding (logo/cover/hero/footer) only for stores whose spec
    // defines those keys — so we refresh Beirut Soles without overwriting
    // builder customizations on stores that omit them.
    if (!storeCreated) {
      const brandingFields = {};
      if (spec.logo_url  !== undefined) brandingFields.logo_url  = spec.logo_url;
      if (spec.cover_url !== undefined) brandingFields.cover_url = spec.cover_url;
      if (spec.hero      !== undefined) brandingFields.hero      = spec.hero;
      if (spec.footer    !== undefined) brandingFields.footer    = spec.footer;
      await store.update({ ...subscriptionFields, ...brandingFields });
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
          colors:            p.colors ?? [],
          customizations:    p.customizations ?? [],
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

      // Re-apply images on every run so swapping a placeholder for a real
      // photo in this file actually takes effect for already-seeded products.
      if (!created && JSON.stringify(product.images) !== JSON.stringify(p.images)) {
        await product.update({ images: p.images });
      }

      // Re-apply colors on every run for the same reason — lets you tweak
      // swatches in this file and have them appear without re-seeding.
      const specColors = p.colors ?? [];
      if (!created && JSON.stringify(product.colors) !== JSON.stringify(specColors)) {
        await product.update({ colors: specColors });
      }

      // Re-apply customizations on every run.
      const specCustomizations = p.customizations ?? [];
      if (!created && JSON.stringify(product.customizations) !== JSON.stringify(specCustomizations)) {
        await product.update({ customizations: specCustomizations });
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
