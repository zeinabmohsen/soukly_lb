// Single source of truth for subscription plans. Keep in sync with the
// backend PLANS list in storeService.js if you add new tiers there.

export type PlanId = "starter" | "pro" | "premium"

export interface Plan {
  id: PlanId
  name: string
  price: number               // USD per month
  tagline: string
  highlight?: boolean         // visually emphasized on the pricing page
  features: string[]
  /** Marketing-only — features that this plan does NOT include (used in compare table) */
  excludes?: string[]
}

export const TRIAL_DAYS = 30

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 10,
    tagline: "Everything you need to launch your store.",
    features: [
      "Live storefront on the marketplace",
      "Unlimited products",
      "Order management dashboard",
      "Customer reviews & ratings",
      "Social links (WhatsApp, Instagram, Facebook, TikTok)",
      "Store builder — hero, categories, layout",
      "Basic analytics (last 7 days)",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    tagline: "Promote your store and grow faster.",
    highlight: true,
    features: [
      "Everything in Starter",
      "Advanced analytics (90 days, customer insights, top products)",
      "Promotional tools — discount codes, sales, time-limited offers",
      "1 featured slot per week in your category page",
      "Custom hero banner upload",
      "Priority email support (24h response)",
      "\"Pro Seller\" badge on your store",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 50,
    tagline: "Maximum reach for established stores.",
    features: [
      "Everything in Pro",
      "Homepage hero rotation eligibility",
      "Custom domain (yourstore.com)",
      "Up to 5 team members on your store",
      "Phone & WhatsApp support",
      "\"Premium Verified\" gold badge",
      "Early access to new features",
    ],
  },
]

export function getPlan(id: string | null | undefined): Plan {
  if (!id) return PLANS[0]
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

export function isValidPlanId(id: string): id is PlanId {
  return PLANS.some((p) => p.id === id)
}
