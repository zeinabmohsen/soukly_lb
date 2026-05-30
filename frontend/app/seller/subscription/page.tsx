"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles, Loader2,
  ArrowRight, Check, Star, Crown, Store, Receipt, Wallet, CalendarDays, Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import {
  useGetMyStoreQuery,
  useStartMyTrialMutation,
  useChangeMyPlanMutation,
  useGetMyPaymentsQuery,
  type Store as StoreType,
  type SubscriptionPayment,
  type PaymentStatus,
} from "@/store/api/storeApi"
import { PLANS, getPlan, TRIAL_DAYS, type PlanId } from "@/lib/plans"

const TIER_ICON: Record<PlanId, React.ComponentType<{ className?: string }>> = {
  starter: Store,
  pro: Star,
  premium: Crown,
}

const TIER_ACCENT: Record<PlanId, string> = {
  starter: "from-sky-500/10 via-sky-500/5 to-transparent",
  pro: "from-primary/15 via-accent/5 to-transparent",
  premium: "from-amber-500/15 via-amber-500/5 to-transparent",
}

function daysBetween(future: Date, past: Date = new Date()) {
  return Math.max(0, Math.ceil((future.getTime() - past.getTime()) / (24 * 60 * 60 * 1000)))
}

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string | Date | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : "—"

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  whish: "Whish Money",
  card: "Credit card",
  manual: "Manual",
}

const STATUS_STYLES: Record<PaymentStatus, { label: string; className: string }> = {
  paid:     { label: "Paid",     className: "bg-green-500/15 text-green-600 border-green-500/30" },
  pending:  { label: "Pending",  className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  failed:   { label: "Failed",   className: "bg-destructive/15 text-destructive border-destructive/30" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground border-border" },
}

// ── Billing summary stat strip ──────────────────────────────────────────────────
function BillingSummary({
  summary,
  plan,
  method,
}: {
  summary: { total_paid: number; currency: string; payments_count: number; member_since: string | null }
  plan: string
  method: string
}) {
  const stats = [
    { icon: Coins,        label: "Lifetime paid", value: money(summary.total_paid, summary.currency) },
    { icon: Receipt,      label: "Payments",      value: String(summary.payments_count) },
    { icon: CalendarDays, label: "Member since",  value: fmtDate(summary.member_since, { month: "short", year: "numeric" }) },
    { icon: Wallet,       label: "Pays via",      value: PAYMENT_METHOD_LABEL[method] ?? method },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <s.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{s.label}</span>
          </div>
          <p className="text-lg md:text-xl font-bold truncate">{s.value}</p>
        </Card>
      ))}
    </div>
  )
}

// ── Billing history table ───────────────────────────────────────────────────────
function BillingHistory({ payments, isLoading }: { payments: SubscriptionPayment[]; isLoading: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-5 md:p-6 border-b border-border">
        <Receipt className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-bold text-lg">Billing history</h3>
        {payments.length > 0 && (
          <Badge variant="outline" className="ml-auto">{payments.length} invoices</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="p-5 md:p-6 space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No charges yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Once your trial converts to a paid subscription, your monthly receipts will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Header — desktop only */}
          <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1fr_0.8fr_auto] gap-4 px-6 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/40">
            <span>Invoice</span>
            <span>Billing period</span>
            <span>Plan</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-border">
            {payments.map((p) => {
              const status = STATUS_STYLES[p.status]
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-2 md:grid-cols-[1.4fr_1.6fr_1fr_0.8fr_auto] gap-y-1 gap-x-4 px-5 md:px-6 py-3.5 items-center text-sm"
                >
                  <span className="font-mono text-xs md:text-sm font-medium">{p.invoice_number}</span>
                  <span className="text-right md:text-left text-muted-foreground">
                    {fmtDate(p.period_start, { day: "numeric", month: "short" })} – {fmtDate(p.period_end, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="capitalize text-muted-foreground">{p.plan_id}</span>
                  <span className="font-semibold md:text-right">{money(p.amount, p.currency)}</span>
                  <span className="md:text-right">
                    <Badge variant="outline" className={status.className}>{status.label}</Badge>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="px-6 py-3 text-xs text-muted-foreground border-t border-border bg-muted/20">
            Receipts are issued automatically each cycle. Whish Money integration is rolling out — downloadable PDFs coming soon.
          </p>
        </>
      )}
    </Card>
  )
}

function StatusBanner({ store, currentPlanPrice }: { store: StoreType; currentPlanPrice: number }) {
  if (!store.is_approved) {
    return (
      <Card className="p-6 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Application under review</h3>
            <p className="text-sm text-muted-foreground mt-1">
              An admin will review your application within 2-3 business days. Once approved, you can start your free trial here.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const status = store.subscription_status
  const trialEnds = store.trial_ends_at ? new Date(store.trial_ends_at) : null
  const nextBilling = store.next_billing_at ? new Date(store.next_billing_at) : null

  if (status === "trialing" && trialEnds) {
    const days = daysBetween(trialEnds)
    return (
      <Card className="p-6 border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">Free trial — {days} days left</h3>
              <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">Trialing</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your trial ends on <span className="font-medium text-foreground">{trialEnds.toLocaleDateString()}</span>.
              You'll be charged ${currentPlanPrice}/month after that.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === "active") {
    return (
      <Card className="p-6 border-green-500/30 bg-green-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">Subscription active</h3>
              <Badge className="bg-green-500/15 text-green-600 border-green-500/30">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {nextBilling
                ? <>Next charge on <span className="font-medium text-foreground">{nextBilling.toLocaleDateString()}</span> — ${currentPlanPrice}/month.</>
                : "Your store is live in the marketplace."}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === "lapsed") {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">Payment failed — store hidden</h3>
              <Badge variant="destructive">Lapsed</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your last payment didn't go through, so your store is currently hidden from the marketplace. Reactivate below to make it visible again.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === "cancelled") {
    return (
      <Card className="p-6 border-border bg-muted/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">Subscription cancelled</h3>
              <Badge variant="outline">Cancelled</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your store is hidden from the marketplace. Start a new trial below to bring it back.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // inactive — approved but never activated
  return (
    <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">You're approved! 🎉</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Start your {TRIAL_DAYS}-day free trial to make your store visible in the marketplace. No charge until the trial ends.
          </p>
        </div>
      </div>
    </Card>
  )
}

export default function SellerSubscriptionPage() {
  const router = useRouter()
  const { isAuthenticated, isSeller } = useAuth()
  const { toast } = useToast()

  const { data: store, isLoading } = useGetMyStoreQuery(undefined, { skip: !isSeller })
  const { data: billing, isLoading: isBillingLoading } = useGetMyPaymentsQuery(undefined, { skip: !isSeller })
  const [startTrial, { isLoading: isStartingTrial }] = useStartMyTrialMutation()
  const [changePlan, { isLoading: isChangingPlan }] = useChangeMyPlanMutation()
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null)

  const payments = billing?.payments ?? []
  const paymentMethod = payments[0]?.payment_method ?? "whish"

  useEffect(() => {
    if (!isAuthenticated || !isSeller) router.push("/login")
  }, [isAuthenticated, isSeller, router])

  const currentPlan = useMemo(() => getPlan(store?.plan_id ?? "starter"), [store?.plan_id])

  // Store is publicly visible only when approved AND subscription is live
  const isStoreLive = !!store?.is_approved && (store?.subscription_status === "active" || store?.subscription_status === "trialing")

  const canStartTrial = useMemo(() => {
    if (!store) return false
    if (!store.is_approved) return false
    return store.subscription_status === "inactive" || store.subscription_status === "cancelled" || store.subscription_status === "lapsed"
  }, [store])

  const handleStartTrial = async () => {
    try {
      await startTrial().unwrap()
      toast({
        title: "Trial started!",
        description: `Your store is now live. Enjoy your ${TRIAL_DAYS} free days.`,
      })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Couldn't start the trial. Please try again."
      toast({ title: "Action failed", description: msg, variant: "destructive" })
    }
  }

  const handleChangePlan = async (planId: PlanId) => {
    if (planId === store?.plan_id) return
    setPendingPlanId(planId)
    try {
      await changePlan({ plan_id: planId }).unwrap()
      const target = getPlan(planId)
      const isUpgrade = target.price > currentPlan.price
      toast({
        title: isUpgrade ? `Upgraded to ${target.name}` : `Switched to ${target.name}`,
        description: `Your store is now on the ${target.name} plan ($${target.price}/month).`,
      })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Couldn't change plan."
      toast({ title: "Action failed", description: msg, variant: "destructive" })
    } finally {
      setPendingPlanId(null)
    }
  }

  if (!isAuthenticated || !isSeller) return null

  return (
    <div className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your subscription keeps your store visible in the Soukly marketplace.
        </p>
      </div>

      {isLoading || !store ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <StatusBanner store={store} currentPlanPrice={currentPlan.price} />
      )}

      {/* Billing snapshot — only meaningful once there's payment history */}
      {store && billing && payments.length > 0 && (
        <BillingSummary summary={billing.summary} plan={currentPlan.name} method={paymentMethod} />
      )}

      {/* Current plan summary */}
      {store && (
        <Card className="overflow-hidden">
          <div className={`p-5 md:p-6 bg-gradient-to-br ${TIER_ACCENT[currentPlan.id]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Current Plan</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5 border ${
                    isStoreLive
                      ? "bg-green-500/15 text-green-600 border-green-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStoreLive ? "bg-green-500" : "bg-muted-foreground"}`} />
                    {isStoreLive ? "Live in marketplace" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => { const Icon = TIER_ICON[currentPlan.id]; return <Icon className="w-6 h-6 text-primary" /> })()}
                  <h2 className="text-xl md:text-2xl font-bold">{currentPlan.name}</h2>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{currentPlan.tagline}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl md:text-3xl font-bold">${currentPlan.price}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
          </div>
          <div className="p-5 md:p-6 pt-0 md:pt-0">

          {/* Key dates / method */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {store.subscription_status === "trialing" ? "Trial ends" : "Next charge"}
              </p>
              <p className="text-sm font-semibold">
                {store.subscription_status === "trialing"
                  ? fmtDate(store.trial_ends_at)
                  : store.subscription_status === "active"
                    ? fmtDate(store.next_billing_at)
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Billing</p>
              <p className="text-sm font-semibold">${currentPlan.price} / month</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Payment method</p>
              <p className="text-sm font-semibold">{PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}</p>
            </div>
          </div>

          {/* What's included */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">What's included</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {currentPlan.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {canStartTrial && (
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Activate your subscription to make your store visible.
              </p>
              <Button onClick={handleStartTrial} disabled={isStartingTrial} className="gap-2 w-full sm:w-auto">
                {isStartingTrial && <Loader2 className="w-4 h-4 animate-spin" />}
                {isStartingTrial ? "Starting trial..." : `Start ${TRIAL_DAYS}-day free trial`}
                {!isStartingTrial && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          )}
          </div>
        </Card>
      )}

      {/* Plan switcher */}
      {store && (
        <Card className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-lg">Change plan</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Upgrade or downgrade anytime — applies on next billing cycle.</p>
            </div>
            <Link href="/pricing" className="text-sm text-primary hover:underline flex-shrink-0">
              Compare plans →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-3 md:gap-4">
            {PLANS.map((plan) => {
              const Icon = TIER_ICON[plan.id]
              const isCurrent = store.plan_id === plan.id
              const isPending = pendingPlanId === plan.id
              const isUpgrade = plan.price > currentPlan.price
              const isDowngrade = plan.price < currentPlan.price
              const showPopular = plan.highlight && !isCurrent
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-4 md:p-5 flex flex-col transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : showPopular
                        ? "border-primary/40 ring-1 ring-primary/15"
                        : "border-border/60 hover:border-border"
                  }`}
                >
                  {showPopular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 shadow-sm">
                      Most popular
                    </Badge>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                      <h4 className="font-bold">{plan.name}</h4>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                        <Check className="w-3 h-3" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    className={`w-full gap-1 ${isCurrent ? "bg-transparent cursor-default" : ""}`}
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={isCurrent || isChangingPlan}
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isCurrent
                      ? "Your plan"
                      : isPending
                        ? "Switching..."
                        : isUpgrade
                          ? `Upgrade to ${plan.name}`
                          : isDowngrade
                            ? `Downgrade to ${plan.name}`
                            : `Switch to ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Billing history */}
      {store && <BillingHistory payments={payments} isLoading={isBillingLoading} />}
    </div>
  )
}
