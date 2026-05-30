// Seeds billing history (subscription_payments) for stores that are actively
// paying. Idempotent: invoices are keyed by (store_id, invoice_number) so
// re-running tops up any missing months without duplicating.
//
// Plan prices mirror frontend lib/plans.ts. A store gets one paid invoice per
// month it has been "active", ending with the current period. next_billing_at
// on the store points at the upcoming (not-yet-charged) cycle.

const { SubscriptionPayment, Store } = require("../api/v1/models");

const PLAN_PRICES = { starter: 10, pro: 25, premium: 50 };

// How many past monthly invoices to generate per active store (by slug).
// Falls back to DEFAULT_MONTHS for any active store not listed here.
const MONTHS_BY_SLUG = {
  "karim-crafts": 9,
  "linas-boutique": 14,
  "beirut-soles": 11,
};
const DEFAULT_MONTHS = 6;

function pad(n) {
  return String(n).padStart(2, "0");
}

// First day of the month that is `monthsAgo` months before `from`.
function monthStart(from, monthsAgo) {
  const d = new Date(from.getFullYear(), from.getMonth() - monthsAgo, 1, 12, 0, 0);
  return d;
}

async function seedSubscriptionPayments() {
  const stores = await Store.findAll({ where: { subscription_status: "active" } });

  let created = 0;
  let storesTouched = 0;

  for (const store of stores) {
    const price = PLAN_PRICES[store.plan_id] || PLAN_PRICES.starter;
    const months = MONTHS_BY_SLUG[store.slug] ?? DEFAULT_MONTHS;
    const now = new Date();
    storesTouched++;

    // Oldest invoice first so invoice numbers increase with time.
    for (let i = months; i >= 1; i--) {
      const periodStart = monthStart(now, i);
      const periodEnd = monthStart(now, i - 1);
      const ym = `${periodStart.getFullYear()}-${pad(periodStart.getMonth() + 1)}`;
      const seq = months - i + 1;
      const invoiceNumber = `INV-${ym}-${pad(seq)}`;

      const [, wasCreated] = await SubscriptionPayment.findOrCreate({
        where: { store_id: store.id, invoice_number: invoiceNumber },
        defaults: {
          store_id: store.id,
          invoice_number: invoiceNumber,
          plan_id: store.plan_id || "starter",
          amount: price,
          currency: "USD",
          status: "paid",
          period_start: periodStart,
          period_end: periodEnd,
          payment_method: "whish",
          // Charged on the first of the period
          paid_at: periodStart,
        },
      });
      if (wasCreated) created++;
    }
  }

  console.log(`[seed] subscription_payments: +${created} invoices across ${storesTouched} active stores`);
}

module.exports = { seedSubscriptionPayments };
