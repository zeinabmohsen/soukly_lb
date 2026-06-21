const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const { StoreView, Store } = require("../models");

// ── Record a storefront view (fire-and-forget) ───────────────────────────────
// Resilient by design: a bad store_id or a transient write error must never
// surface to the buyer browsing the store, so we swallow errors and report a
// boolean. Verifies the store exists first to avoid noisy FK violations.
async function recordStoreView({ storeId, productId, visitorId }) {
  try {
    const store = await Store.findByPk(storeId, { attributes: ["id"] });
    if (!store) return false;
    await StoreView.create({
      store_id: storeId,
      product_id: productId || null,
      visitor_id: visitorId ? String(visitorId).slice(0, 64) : null,
    });
    return true;
  } catch (err) {
    console.error("[analytics] failed to record store view:", err.message);
    return false;
  }
}

// ── Range maths — mirrors the frontend analytics ranges ──────────────────────
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function rangeBounds(range) {
  const now = new Date();
  if (range === "year") {
    return {
      current: new Date(now.getFullYear(), 0, 1),
      previous: new Date(now.getFullYear() - 1, 0, 1),
      monthly: true,
    };
  }
  const days = range === "7days" ? 7 : range === "30days" ? 30 : 90; // 3months
  const current = startOfDay(new Date(now.getTime() - days * 86400000));
  const previous = startOfDay(new Date(now.getTime() - 2 * days * 86400000));
  return { current, previous, monthly: false };
}

const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Build a zero-filled, ordered list of bucket keys spanning the current period.
function buildBuckets(range, current, monthly) {
  const keys = [];
  const now = new Date();
  if (monthly) {
    for (let m = 0; m <= now.getMonth(); m++) {
      keys.push(monthKey(new Date(now.getFullYear(), m, 1)));
    }
  } else {
    const days = range === "7days" ? 7 : range === "30days" ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      keys.push(dayKey(startOfDay(new Date(now.getTime() - i * 86400000))));
    }
  }
  return keys;
}

// ── Traffic for the seller analytics page ─────────────────────────────────────
// Returns a zero-filled daily/monthly series plus current vs previous totals so
// the page can show a Visitors KPI with a period-over-period delta.
async function fetchStoreTraffic(storeId, range) {
  const { current, previous, monthly } = rangeBounds(range);
  const unit = monthly ? "month" : "day";

  const [rows, prevTotals] = await Promise.all([
    sequelize.query(
      `SELECT date_trunc(:unit, created_at) AS bucket,
              COUNT(*)::int AS views,
              COUNT(DISTINCT visitor_id)::int AS visitors
       FROM store_views
       WHERE store_id = :storeId AND created_at >= :start
       GROUP BY bucket
       ORDER BY bucket`,
      { type: QueryTypes.SELECT, replacements: { unit, storeId, start: current } },
    ),
    sequelize.query(
      `SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
       FROM store_views
       WHERE store_id = :storeId AND created_at >= :previous AND created_at < :current`,
      { type: QueryTypes.SELECT, replacements: { storeId, previous, current } },
    ),
  ]);

  // Index the DB buckets by the same key format used for the zero-filled series.
  const byKey = new Map();
  for (const r of rows) {
    const d = new Date(r.bucket);
    const key = monthly ? monthKey(d) : dayKey(d);
    byKey.set(key, { views: r.views, visitors: r.visitors });
  }

  const series = buildBuckets(range, current, monthly).map((key) => ({
    key,
    views: byKey.get(key)?.views ?? 0,
    visitors: byKey.get(key)?.visitors ?? 0,
  }));

  const totalViews = series.reduce((s, p) => s + p.views, 0);
  // Sum of per-bucket unique visitors over-counts a visitor active on multiple
  // days, so query the period-wide distinct count separately for the headline.
  const [currTotals] = await sequelize.query(
    `SELECT COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors
     FROM store_views
     WHERE store_id = :storeId AND created_at >= :current`,
    { type: QueryTypes.SELECT, replacements: { storeId, current } },
  );

  return {
    series,
    totals: {
      views: currTotals?.views ?? totalViews,
      visitors: currTotals?.visitors ?? 0,
      prev_views: prevTotals?.views ?? 0,
      prev_visitors: prevTotals?.visitors ?? 0,
    },
  };
}

module.exports = { recordStoreView, fetchStoreTraffic };
