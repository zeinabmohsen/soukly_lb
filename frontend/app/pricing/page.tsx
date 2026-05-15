"use client"

import Link from "next/link"
import {
  Sparkles, Check, ArrowRight, Store, CreditCard,
  Clock, Globe, X, Star, Crown,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGetStoresQuery } from "@/store/api/storeApi"
import { PLANS, TRIAL_DAYS, type Plan } from "@/lib/plans"

const FAQ = [
  {
    q: "How does the 30-day free trial work?",
    a: "Once admin approves your store, you start a 30-day free trial on any plan. Your store goes live in the marketplace immediately. No payment method needed to start. After 30 days, you'll be asked to subscribe to keep your store live.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade or downgrade anytime from your seller dashboard. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your seller dashboard at any time. Your store stays live until the end of your current billing period, then goes hidden — your data and products remain saved.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We're integrating Whish Money — Lebanon's most-used mobile payment app — as the primary method. In the meantime, admin can manually activate subscriptions via bank transfer or OMT. Contact us to arrange.",
  },
  {
    q: "Do you take commission on my sales?",
    a: "No. The subscription is the only fee. Whatever you sell is yours to keep — Soukly does not take a percentage.",
  },
  {
    q: "What happens to my store if my payment fails?",
    a: "Your store is hidden from the marketplace until the payment is resolved. Your products, orders, and customer data remain intact — once you reactivate, everything comes back exactly as it was.",
  },
]

// Feature comparison table — true / false / string value
const COMPARE_ROWS: { label: string; values: Record<Plan["id"], boolean | string> }[] = [
  { label: "Live in marketplace",          values: { starter: true, pro: true, premium: true } },
  { label: "Unlimited products",           values: { starter: true, pro: true, premium: true } },
  { label: "Reviews & ratings",            values: { starter: true, pro: true, premium: true } },
  { label: "Store builder",                values: { starter: true, pro: true, premium: true } },
  { label: "Analytics",                    values: { starter: "Last 7 days", pro: "Last 90 days", premium: "Last 90 days + insights" } },
  { label: "Promotional tools",            values: { starter: false, pro: true, premium: true } },
  { label: "Custom hero banner",           values: { starter: false, pro: true, premium: true } },
  { label: "Featured category slot",       values: { starter: false, pro: "1/week", premium: "Unlimited" } },
  { label: "Homepage hero rotation",       values: { starter: false, pro: false, premium: true } },
  { label: "Custom domain",                values: { starter: false, pro: false, premium: true } },
  { label: "Team members",                 values: { starter: "1", pro: "1", premium: "Up to 5" } },
  { label: "Support",                      values: { starter: "Email", pro: "Priority email", premium: "Phone + WhatsApp" } },
]

const TIER_ICON: Record<Plan["id"], React.ComponentType<{ className?: string }>> = {
  starter: Store,
  pro: Star,
  premium: Crown,
}

export default function PricingPage() {
  const { data: storesPage } = useGetStoresQuery({ limit: 1 })
  const totalStores = storesPage?.total ?? null

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-10 md:pt-32 md:pb-20">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[11px] md:text-sm font-semibold text-primary mb-4 md:mb-5">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {TRIAL_DAYS}-day free trial on every plan
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-5 leading-[1.1]">
              Pick the plan that{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                fits your store.
              </span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              No commission. No listing fees. Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-12 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
            {PLANS.map((plan) => {
              const Icon = TIER_ICON[plan.id]
              const highlighted = plan.highlight
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden p-5 md:p-7 flex flex-col ${
                    highlighted
                      ? "border-2 border-primary shadow-xl shadow-primary/10 md:scale-[1.02]"
                      : "border-2 border-border"
                  }`}
                >
                  {highlighted && (
                    <Badge className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary text-primary-foreground gap-1 text-[10px] md:text-xs">
                      Most popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-5 h-5 ${highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    <h2 className="text-lg md:text-xl font-bold">{plan.name}</h2>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-5">{plan.tagline}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl md:text-6xl font-bold">${plan.price}</span>
                    <span className="text-sm md:text-base text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 md:mb-6">{TRIAL_DAYS}-day free trial · Cancel anytime</p>

                  <div className="space-y-2 md:space-y-2.5 mb-6 md:mb-8 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs md:text-sm">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/become-seller?plan=${plan.id}`} className="block">
                    <Button
                      size="lg"
                      variant={highlighted ? "default" : "outline"}
                      className={`w-full gap-2 text-sm md:text-base ${highlighted ? "" : "bg-transparent"}`}
                    >
                      Start with {plan.name}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              )
            })}
          </div>

          {/* Mini social proof */}
          <div className="max-w-5xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Store, label: "Stores", value: totalStores ? `${totalStores}+` : "—" },
              { icon: Clock, label: "Free trial", value: `${TRIAL_DAYS} days` },
              { icon: CreditCard, label: "Commission", value: "0%" },
              { icon: Globe, label: "Reach", value: "All Lebanon" },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-2xl bg-muted/30 border border-border/60 p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Compare table */}
      <section className="py-16 md:py-20 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs md:text-sm font-medium text-primary uppercase tracking-wider mb-2">Compare plans</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-3">Features side-by-side</h2>
          </div>

          {/* Desktop: 4-col grid */}
          <div className="hidden md:block max-w-5xl mx-auto rounded-2xl border border-border/60 overflow-hidden bg-background">
            <div className="grid grid-cols-4 bg-muted/50 border-b border-border/60">
              <div className="p-4 text-xs font-medium text-muted-foreground">Feature</div>
              {PLANS.map((plan) => (
                <div key={plan.id} className="p-4 text-center">
                  <p className={`text-sm font-bold ${plan.highlight ? "text-primary" : "text-foreground"}`}>{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">${plan.price}/mo</p>
                </div>
              ))}
            </div>

            {COMPARE_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 items-center ${i % 2 ? "bg-muted/20" : "bg-background"} border-b border-border/40 last:border-b-0`}
              >
                <div className="p-4 text-sm font-medium">{row.label}</div>
                {PLANS.map((plan) => {
                  const val = row.values[plan.id]
                  return (
                    <div key={plan.id} className="p-4 text-center text-sm">
                      {typeof val === "boolean" ? (
                        val ? (
                          <Check className={`w-5 h-5 mx-auto ${plan.highlight ? "text-primary" : "text-foreground/80"}`} />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className={plan.highlight ? "text-primary font-medium" : ""}>{val}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Mobile: stacked per-plan cards */}
          <div className="md:hidden max-w-md mx-auto space-y-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border-2 bg-background overflow-hidden ${
                  plan.highlight ? "border-primary" : "border-border/60"
                }`}
              >
                <div className={`px-5 py-3 flex items-baseline justify-between ${plan.highlight ? "bg-primary/5" : "bg-muted/40"}`}>
                  <p className={`font-bold ${plan.highlight ? "text-primary" : "text-foreground"}`}>{plan.name}</p>
                  <p className="text-sm text-muted-foreground">${plan.price}/mo</p>
                </div>
                <div className="divide-y divide-border/40">
                  {COMPARE_ROWS.map((row) => {
                    const val = row.values[plan.id]
                    return (
                      <div key={row.label} className="px-5 py-2.5 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground flex-shrink-0">{row.label}</span>
                        <span className="text-right">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check className={`w-4 h-4 ${plan.highlight ? "text-primary" : "text-foreground/80"}`} />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )
                          ) : (
                            <span className={`font-medium ${plan.highlight ? "text-primary" : ""}`}>{val}</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Soukly */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs md:text-sm font-medium text-primary uppercase tracking-wider mb-2">Why Soukly</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-3">Built for Lebanese sellers</h2>
          </div>

          {(() => {
            const rows = [
              { label: "Marketplace traffic", ours: true, theirs: false },
              { label: "Starting cost", ours: "$10/mo", theirs: "$30+ hosting + domain" },
              { label: "Commission on sales", ours: "0%", theirs: "0%" },
              { label: "Setup time", ours: "5 minutes", theirs: "Weeks" },
              { label: "Payment integration", ours: "Whish (built-in)", theirs: "You build it" },
              { label: "Built-in reviews & ratings", ours: true, theirs: false },
              { label: "Designed for Lebanon", ours: true, theirs: false },
            ] as const

            const renderValue = (v: boolean | string, accent: "primary" | "muted") => {
              if (typeof v === "boolean") {
                return v
                  ? <Check className={`w-5 h-5 inline ${accent === "primary" ? "text-primary" : "text-muted-foreground"}`} />
                  : <X className="w-5 h-5 text-muted-foreground/40 inline" />
              }
              return <span className={accent === "primary" ? "font-medium text-primary" : "text-muted-foreground"}>{v}</span>
            }

            return (
              <>
                {/* Desktop: 3-col table */}
                <div className="hidden md:block max-w-3xl mx-auto rounded-2xl border border-border/60 overflow-hidden">
                  <div className="grid grid-cols-3 bg-muted/50 border-b border-border/60">
                    <div className="p-4 text-xs font-medium text-muted-foreground">&nbsp;</div>
                    <div className="p-4 text-center text-sm font-bold text-primary">Soukly</div>
                    <div className="p-4 text-center text-sm font-medium text-muted-foreground">Building it yourself</div>
                  </div>
                  {rows.map((row, i) => (
                    <div key={row.label} className={`grid grid-cols-3 items-center ${i % 2 ? "bg-muted/20" : "bg-background"} border-b border-border/40 last:border-b-0`}>
                      <div className="p-4 text-sm font-medium">{row.label}</div>
                      <div className="p-4 text-center text-sm">{renderValue(row.ours, "primary")}</div>
                      <div className="p-4 text-center text-sm">{renderValue(row.theirs, "muted")}</div>
                    </div>
                  ))}
                </div>

                {/* Mobile: per-feature rows with two pill values */}
                <div className="md:hidden max-w-md mx-auto rounded-2xl border border-border/60 overflow-hidden bg-background divide-y divide-border/40">
                  {rows.map((row) => (
                    <div key={row.label} className="px-5 py-3">
                      <p className="text-sm font-medium mb-2">{row.label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-0.5">Soukly</p>
                          {renderValue(row.ours, "primary")}
                        </div>
                        <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">DIY</p>
                          {renderValue(row.theirs, "muted")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs md:text-sm font-medium text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-3">Common questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl bg-card border border-border/60 overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none">
                  <p className="font-semibold text-sm md:text-base">{item.q}</p>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-open:rotate-45 transition-transform">
                    <span className="text-lg leading-none">+</span>
                  </div>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to start selling?
              </h2>
              <p className="text-base md:text-lg text-white/85 mb-8 max-w-xl mx-auto">
                Apply in 5 minutes. Admin approves within 2-3 business days. Your first {TRIAL_DAYS} days are free.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/become-seller">
                  <Button size="lg" variant="secondary" className="gap-2 text-base shadow-xl">
                    Start your application
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="gap-2 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                    Browse the marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
