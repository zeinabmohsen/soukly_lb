// Engagement seeder for the "Karim Crafts" store: lots of buyers, orders,
// and reviews (with comments). Additive and safe to re-run — buyers are
// looked up by email, reviews are unique per (user, product), and orders are
// only topped up to a target count. Recomputes the cached rating /
// review_count / sales_count aggregates the same way the services do.
//
//   node src/seeders/karimEngagement.js
//
require("dotenv").config();
const { fn, col } = require("sequelize");
const sequelize = require("../config/database");
const { User, Store, Product, Order, OrderItem, Review } = require("../api/v1/models");

const STORE_SLUG = "karim-crafts";
const SHIPPING_FEE = 5.0;
const NUM_BUYERS = 60;
const TARGET_ORDERS = 110; // total orders the store should end up with

// ── Buyer identities ──────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Maya", "Karim", "Rana", "Tarek", "Nour", "Hadi", "Layla", "Omar", "Yara", "Ziad",
  "Dana", "Fadi", "Lara", "Samir", "Reem", "Bilal", "Nadine", "Jad", "Hala", "Marwan",
  "Joelle", "Rami", "Sara", "Elie", "Mira", "Wassim", "Carla", "Georges", "Nada", "Khaled",
  "Tala", "Hussein", "Lea", "Ibrahim", "Maria", "Charbel", "Aya", "Walid", "Rita", "Bassam",
  "Salma", "Antoine", "Diala", "Nabil", "Maha", "Toni", "Farah", "Said", "Lina", "Imad",
  "Christelle", "Adib", "Yasmine", "Nizar", "Roula", "Pierre", "Hiba", "Karam", "Nayla", "Fares",
];
const LAST_NAMES = [
  "Haddad", "Khalil", "Saliba", "Aoun", "Fares", "Nassar", "Khoury", "Sleiman", "Geagea",
  "Mansour", "Daher", "Karam", "Rizk", "Chami", "Bitar", "Younes", "Sayegh", "Abou Khalil",
  "Tannous", "Gemayel", "Hage", "Maalouf", "Zein", "Saade", "Chahine",
];

// ── Review comments by product type ─────────────────────────────────────────────
const COMMENTS = {
  positive: [
    "Absolutely beautiful piece — even nicer in person than the photos. You can really feel it's hand-made.",
    "Arrived carefully wrapped and in perfect condition. The glaze is gorgeous.",
    "Exactly what I was hoping for. The craftsmanship is top notch.",
    "Bought this as a gift and the recipient loved it. Will be ordering again.",
    "Such a lovely weight and finish. It's become my favourite thing in the kitchen.",
    "Karim's work is incredible. Every detail is thoughtful and well made.",
    "Shipped fast and the quality is excellent. Highly recommend this studio.",
    "The colours are so warm and earthy. Photos don't do it justice.",
    "You can tell a lot of care went into making this. Worth every lira.",
    "Second purchase from Karim Crafts and the quality is consistently great.",
    "Perfect addition to our home. The hand-thrown look is exactly my style.",
    "Sturdy, well finished, and genuinely unique. Couldn't be happier.",
    "Great communication from the seller and a beautiful end product.",
    "I use this every single day. Holds up wonderfully and still looks new.",
    "Stunning craftsmanship. Feels special knowing it was made by hand in Tripoli.",
  ],
  neutral: [
    "Nice piece overall. Slightly smaller than I expected but still good quality.",
    "Good craftsmanship. Took a little longer to arrive than I'd hoped.",
    "Pretty and well made. The colour is a touch different from the photo but I still like it.",
    "Solid quality for the price. Packaging could have been a bit better.",
    "Happy with it. Minor glaze variation but that's part of the hand-made charm.",
  ],
  critical: [
    "The piece is lovely but arrived with a tiny chip. Seller was responsive about it though.",
    "Nice work, though delivery took longer than expected. Quality made up for it.",
  ],
};

const SHORT_COMMENTS = [
  "Beautiful!", "Love it.", "Exactly as described.", "Great quality.", "Highly recommend.",
  "Will buy again.", "Lovely craftsmanship.", "Perfect gift.", "So happy with this.", "Gorgeous piece.",
];

// ── Small helpers (plain Node script — Math.random / Date are fine here) ────────
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// Weight ratings toward 4–5 stars for a healthy-looking store
function weightedRating() {
  const r = Math.random();
  if (r < 0.58) return 5;
  if (r < 0.85) return 4;
  if (r < 0.95) return 3;
  if (r < 0.99) return 2;
  return 1;
}

function commentForRating(rating) {
  if (Math.random() < 0.12) return pick(SHORT_COMMENTS);
  if (rating >= 4) return pick(COMMENTS.positive);
  if (rating === 3) return pick(COMMENTS.neutral);
  return pick(COMMENTS.critical);
}

const ORDER_STATUSES = [
  // mostly delivered so they can carry verified reviews
  "delivered", "delivered", "delivered", "delivered", "delivered", "delivered",
  "shipped", "processing", "confirmed", "pending", "cancelled",
];

async function run() {
  await sequelize.authenticate();
  console.log("[karim] DB connected");

  const store = await Store.findOne({ where: { slug: STORE_SLUG } });
  if (!store) throw new Error(`Store "${STORE_SLUG}" not found — run "npm run seed" first.`);

  const products = await Product.findAll({
    where: { store_id: store.id, status: "active" },
  });
  if (products.length === 0) throw new Error("Karim Crafts has no active products to review.");
  console.log(`[karim] store ${store.name} — ${products.length} active products`);

  // ── 1. Buyers ────────────────────────────────────────────────────────────────
  const buyers = [];
  for (let i = 1; i <= NUM_BUYERS; i++) {
    const email = `karim.buyer${String(i).padStart(3, "0")}@soukly.com`;
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        name,
        password: "SouklyDemo!_B7x",
        phone: `+9617${String(1000000 + rand(8999999)).slice(0, 7)}`,
        is_seller: false,
        seller_status: "none",
        is_verified: true,
      },
    });
    buyers.push(user);
  }
  console.log(`[karim] buyers: ${buyers.length} present`);

  // ── 2. Orders (+ items) up to TARGET_ORDERS ──────────────────────────────────
  const existingOrders = await Order.count({ where: { store_id: store.id } });
  const toCreate = Math.max(0, TARGET_ORDERS - existingOrders);
  console.log(`[karim] orders: ${existingOrders} existing, creating ${toCreate} more`);

  // Track delivered (product -> [buyer, orderId]) pairs so reviews can cite a real order
  const deliveredByBuyer = new Map(); // buyerId -> { orderId, productIds:Set }

  for (let i = 0; i < toCreate; i++) {
    const buyer = pick(buyers);
    const status = pick(ORDER_STATUSES);
    const lineCount = 1 + rand(3); // 1–3 products per order
    const chosen = shuffle(products).slice(0, lineCount);
    const createdAt = daysAgo(1 + rand(120));

    let subtotal = 0;
    const itemRows = chosen.map((p) => {
      const qty = 1 + rand(2);
      const price = parseFloat(p.price);
      subtotal += price * qty;
      return {
        product_id: p.id,
        product_snapshot: {
          id: p.id,
          name: p.name,
          price,
          image_url: p.images?.[0]?.url || null,
          sku: p.sku || null,
          slug: p.slug,
        },
        quantity: qty,
        unit_price: price,
        total_price: price * qty,
      };
    });
    const total = subtotal + SHIPPING_FEE;

    const order = await Order.create({
      buyer_id: buyer.id,
      store_id: store.id,
      status,
      subtotal: subtotal.toFixed(2),
      shipping_fee: SHIPPING_FEE,
      total: total.toFixed(2),
      shipping_address: {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        address: `${pick(["Hamra", "Achrafieh", "Tripoli", "Jounieh", "Byblos", "Saida", "Zahle"])}, Lebanon`,
      },
      payment_method: pick(["cash_on_delivery", "cash_on_delivery", "credit_card"]),
      notes: Math.random() < 0.25 ? pick(["Please gift wrap.", "Leave with the concierge.", "Call before delivery."]) : null,
      createdAt,
      updatedAt: createdAt,
    });

    await OrderItem.bulkCreate(itemRows.map((r) => ({ ...r, order_id: order.id })));

    if (status === "delivered") {
      const entry = deliveredByBuyer.get(buyer.id) || { orderId: order.id, productIds: new Set() };
      itemRows.forEach((r) => entry.productIds.add(r.product_id));
      deliveredByBuyer.set(buyer.id, entry);
    }
  }

  // ── 3. Reviews (with comments) — one per (buyer, product), unique constraint ──
  let reviewsCreated = 0;
  for (const [buyerId, { orderId, productIds }] of deliveredByBuyer) {
    for (const productId of productIds) {
      // Most delivered products get reviewed, not all
      if (Math.random() < 0.25) continue;
      const rating = weightedRating();
      const [, created] = await Review.findOrCreate({
        where: { user_id: buyerId, product_id: productId },
        defaults: {
          user_id: buyerId,
          product_id: productId,
          store_id: store.id,
          order_id: orderId,
          rating,
          comment: commentForRating(rating),
          createdAt: daysAgo(1 + rand(90)),
        },
      });
      if (created) reviewsCreated++;
    }
  }

  // Top up with extra unverified reviews (no order_id) so the count is high
  const allReviewKeys = new Set(
    (await Review.findAll({
      where: { store_id: store.id },
      attributes: ["user_id", "product_id"],
      raw: true,
    })).map((r) => `${r.user_id}:${r.product_id}`)
  );
  for (const buyer of buyers) {
    const extras = shuffle(products).slice(0, 1 + rand(3));
    for (const p of extras) {
      const key = `${buyer.id}:${p.id}`;
      if (allReviewKeys.has(key)) continue;
      if (Math.random() < 0.4) continue;
      const rating = weightedRating();
      const [, created] = await Review.findOrCreate({
        where: { user_id: buyer.id, product_id: p.id },
        defaults: {
          user_id: buyer.id,
          product_id: p.id,
          store_id: store.id,
          order_id: null,
          rating,
          comment: commentForRating(rating),
          createdAt: daysAgo(1 + rand(90)),
        },
      });
      allReviewKeys.add(key);
      if (created) reviewsCreated++;
    }
  }
  console.log(`[karim] reviews: +${reviewsCreated} created`);

  // ── 4. Recompute cached aggregates ───────────────────────────────────────────
  // Product rating + review_count (same SQL the review service uses)
  for (const p of products) {
    const agg = await Review.findOne({
      where: { product_id: p.id },
      attributes: [
        [fn("ROUND", fn("AVG", col("rating")), 2), "avg_rating"],
        [fn("COUNT", col("id")), "total"],
      ],
      raw: true,
    });
    await Product.update(
      {
        rating: parseFloat(agg?.avg_rating) || 0,
        review_count: parseInt(agg?.total, 10) || 0,
      },
      { where: { id: p.id } }
    );
  }

  // sales_count = units sold across non-cancelled orders for this store
  const soldRows = await sequelize.query(
    `SELECT oi.product_id, COALESCE(SUM(oi.quantity), 0)::int AS qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE o.store_id = :storeId AND o.status <> 'cancelled'
      GROUP BY oi.product_id`,
    { replacements: { storeId: store.id }, type: sequelize.QueryTypes.SELECT }
  );
  const soldByProduct = new Map(soldRows.map((r) => [r.product_id, r.qty]));
  for (const p of products) {
    await Product.update(
      { sales_count: soldByProduct.get(p.id) || 0 },
      { where: { id: p.id } }
    );
  }

  // Store rating + review_count
  const storeAgg = await Review.findOne({
    where: { store_id: store.id },
    attributes: [
      [fn("ROUND", fn("AVG", col("rating")), 2), "avg_rating"],
      [fn("COUNT", col("id")), "total"],
    ],
    raw: true,
  });
  await Store.update(
    {
      rating: parseFloat(storeAgg?.avg_rating) || 0,
      review_count: parseInt(storeAgg?.total, 10) || 0,
    },
    { where: { id: store.id } }
  );
  console.log(`[karim] store rating ${parseFloat(storeAgg?.avg_rating) || 0} over ${parseInt(storeAgg?.total, 10) || 0} reviews`);

  console.log("[karim] done");
  await sequelize.close();
}

run().catch((err) => {
  console.error("[karim] failed:", err.message);
  process.exit(1);
});
