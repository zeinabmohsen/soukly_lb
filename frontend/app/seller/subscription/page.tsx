"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles, Loader2,
  ArrowRight, Check, Star, Crown, Store,
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
  type Store as StoreType,
} from "@/store/api/storeApi"
import { PLANS, getPlan, TRIAL_DAYS, type PlanId } from "@/lib/plans"

const TIER_ICON: Record<PlanId, React.ComponentType<{ className?: string }>> = {
  starter: Store,
  pro: Star,
  premium: Crown,
}

function daysBetween(future: Date, past: Date = new Date()) {
  return Math.max(0, Math.ceil((future.getTime() - past.getTime()) / (24 * 60 * 60 * 1000)))
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
  const [startTrial, { isLoading: isStartingTrial }] = useStartMyTrialMutation()
  const [changePlan, { isLoading: isChangingPlan }] = useChangeMyPlanMutation()
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !isSeller) router.push("/login")
  }, [isAuthenticated, isSeller, router])

  const currentPlan = useMemo(() => getPlan(store?.plan_id ?? "starter"), [store?.plan_id])

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
    <div className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-5 md:space-y-6 max-w-5xl">
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

      {/* Current plan summary */}
      {store && (
        <Card className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Current Plan</p>
              <h2 className="text-xl md:text-2xl font-bold">{currentPlan.name}</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{currentPlan.tagline}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl md:text-3xl font-bold">${currentPlan.price}</p>
              <p className="text-xs text-muted-foreground">per month</p>
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
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-4 md:p-5 flex flex-col ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border/60"
                  }`}
                >
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
                  <p className="text-xs text-muted-foreground mb-4 flex-1">{plan.tagline}</p>

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

      {/* Billing history placeholder */}
      <Card className="p-6 bg-muted/30 border-dashed">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Billing history</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Payment receipts will appear here once Whish Money integration is live.
        </p>
      </Card>

      <div className="text-center pt-4">
        <Link href="/seller/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowRight className="w-3 h-3 rotate-180" />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
