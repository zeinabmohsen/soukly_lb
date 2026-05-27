"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useGetMyStoreQuery } from "@/store/api/storeApi"
import { useGetMyProductsQuery } from "@/store/api/productApi"
import { useGetStoreOrdersQuery } from "@/store/api/orderApi"
import {
  Package,
  TrendingUp,
  Users,
  Plus,
  Edit,
  BarChart3,
  ShoppingBag,
  Sparkles,
  Bell,
  ChevronRight,
  LayoutList,
  Zap,
  Store,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Clock,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

const STATUS: Record<string, { label: string; cls: string }> = {
  delivered:  { label: "Delivered",  cls: "bg-green-100  text-green-700  border-green-200" },
  shipped:    { label: "Shipped",    cls: "bg-blue-100   text-blue-700   border-blue-200" },
  processing: { label: "Processing", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed:  { label: "Confirmed",  cls: "bg-purple-100 text-purple-700 border-purple-200" },
  pending:    { label: "Pending",    cls: "bg-amber-100  text-amber-700  border-amber-200" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-100    text-red-700    border-red-200" },
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

// Coerce a possibly-null/undefined/string money field to a number, treating
// non-finite values (incl. NaN) as 0 so they don't poison sums or render "$NaN".
function toAmount(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function initialsFor(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"
}

/* ─── mini sparkline ─────────────────────────────────────────── */

function Spark({ data, color, id }: { data: { v: number }[]; color: string; id: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#${id})`} dot={false} />
        <RechartsTooltip wrapperStyle={{ display: "none" }} contentStyle={{ display: "none" }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ─── revenue chart tooltip ──────────────────────────────────── */

function RevTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg shadow-primary/10">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-primary">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────────── */

export default function SellerDashboard() {
  const { user, isSeller, isAuthenticated } = useAuth()
  const router = useRouter()
  const [revPeriod, setRevPeriod] = useState<"W" | "M" | "Y">("W")
  const { data: myStore } = useGetMyStoreQuery(undefined, { skip: !isSeller })
  const { data: productsData } = useGetMyProductsQuery(undefined, { skip: !isSeller })
  const { data: ordersData } = useGetStoreOrdersQuery({ limit: 100 }, { skip: !isSeller })
  // Use the paginated `total` — not data.length — so the count reflects ALL
  // products, not just the first page returned by the default limit.
  const productCount = productsData?.total ?? 0
  const orders = ordersData?.data ?? []

  useEffect(() => {
    if (!isAuthenticated || !isSeller) router.push("/login")
  }, [isAuthenticated, isSeller, router])

  // Aggregations
  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + toAmount(o.total_amount), 0)

    // Use the paginated `total` so the count is accurate even when the store
    // has more orders than our fetch limit (100).
    const totalOrders = ordersData?.total ?? orders.length

    const customerSet = new Set(orders.map((o) => o.buyer_id))

    const todays = orders.filter((o) => new Date(o.created_at) >= todayStart)
    const todaysRevenue = todays
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + toAmount(o.total_amount), 0)
    const todaysOrders = todays.length

    const pendingCount = orders.filter((o) => o.status === "pending").length

    return {
      totalRevenue,
      totalOrders,
      customers: customerSet.size,
      todaysRevenue,
      todaysOrders,
      pendingCount,
    }
  }, [orders])

  // Revenue chart — buckets depend on the W / M / Y toggle.
  //   W → last 7 days, day buckets (Mon, Tue, …)
  //   M → last 30 days, 6 buckets of 5 days each (labelled by day-of-month)
  //   Y → last 12 months, month buckets (Jan, Feb, …)
  const revenueChart = useMemo(() => {
    const now = new Date()
    const buckets: { day: string; revenue: number }[] = []

    if (revPeriod === "W") {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
        const revenue = orders
          .filter((o) => {
            const ts = new Date(o.created_at)
            return o.status !== "cancelled" && ts >= day && ts < next
          })
          .reduce((sum, o) => sum + toAmount(o.total_amount), 0)
        buckets.push({ day: DAY_LABELS[day.getDay()], revenue })
      }
    } else if (revPeriod === "M") {
      // 30 days in 6 × 5-day buckets, labelled by the start day-of-month
      const bucketDays = 5
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * bucketDays + 1)
        const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * bucketDays + 1)
        const revenue = orders
          .filter((o) => {
            const ts = new Date(o.created_at)
            return o.status !== "cancelled" && ts >= start && ts < end
          })
          .reduce((sum, o) => sum + toAmount(o.total_amount), 0)
        buckets.push({ day: String(start.getDate()), revenue })
      }
    } else {
      // Last 12 months, month buckets
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const revenue = orders
          .filter((o) => {
            const ts = new Date(o.created_at)
            return o.status !== "cancelled" && ts >= start && ts < end
          })
          .reduce((sum, o) => sum + toAmount(o.total_amount), 0)
        buckets.push({ day: monthLabels[start.getMonth()], revenue })
      }
    }
    return buckets
  }, [orders, revPeriod])

  // Sparklines keep showing the weekly view so stat cards have a consistent
  // 7-day-trend feel regardless of the chart toggle.
  const weeklyRevenue = useMemo(() => {
    const now = new Date()
    const buckets: { day: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
      const revenue = orders
        .filter((o) => {
          const ts = new Date(o.created_at)
          return o.status !== "cancelled" && ts >= day && ts < next
        })
        .reduce((sum, o) => sum + toAmount(o.total_amount), 0)
      buckets.push({ day: DAY_LABELS[day.getDay()], revenue })
    }
    return buckets
  }, [orders])

  const chartTotal = revenueChart.reduce((s, d) => s + d.revenue, 0)
  const chartLabel = revPeriod === "W" ? "This week" : revPeriod === "M" ? "Last 30 days" : "This year"

  // Sparklines from weekly data
  const sparkRevenue = weeklyRevenue.map((d) => ({ v: d.revenue }))
  const sparkOrders = useMemo(() => {
    const now = new Date()
    const buckets: { v: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
      buckets.push({
        v: orders.filter((o) => {
          const ts = new Date(o.created_at)
          return ts >= day && ts < next
        }).length,
      })
    }
    return buckets
  }, [orders])

  // Recent 5 orders, newest first
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [orders])

  // Real Store Health — replaces the hardcoded percentages and fake Views/Conv/Rating.
  // We measure three concrete, fixable things and link the setup CTA to whatever
  // the seller is most behind on.
  const storeHealth = useMemo(() => {
    const profileChecks = myStore
      ? [
          { key: "description", ok: !!(myStore.description && myStore.description.trim().length > 20) },
          { key: "location",    ok: !!myStore.location },
          { key: "logo",        ok: !!myStore.logo_url },
          { key: "cover",       ok: !!myStore.cover_url },
          { key: "whatsapp",    ok: !!myStore.whatsapp },
        ]
      : []
    const profileCompletePct = profileChecks.length
      ? Math.round((profileChecks.filter((c) => c.ok).length / profileChecks.length) * 100)
      : 0

    // Catalog — 10+ products is "healthy"
    const catalogPct = Math.min(100, Math.round((productCount / 10) * 100))

    // Storefront — hero customized away from defaults + a footer about-text.
    // Store.hero/footer are JSONB, typed as Record<string, unknown> on the
    // client; coerce to strings before reading.
    const heroBg       = (myStore?.hero?.bg_image_url as string | undefined) ?? ""
    const heroHeadline = (myStore?.hero?.headline    as string | undefined) ?? ""
    const footerAbout  = (myStore?.footer?.about_text as string | undefined) ?? ""
    const heroSet   = !!(heroBg || heroHeadline.trim())
    const footerSet = !!footerAbout.trim()
    const storefrontPct = Math.round(((heroSet ? 1 : 0) + (footerSet ? 1 : 0)) / 2 * 100)

    const isLive =
      !!myStore?.is_approved &&
      (myStore?.subscription_status === "active" || myStore?.subscription_status === "trialing")

    return {
      profileCompletePct,
      catalogPct,
      storefrontPct,
      isLive,
      profileChecks,
      heroSet,
      footerSet,
    }
  }, [myStore, productCount])

  // Average product rating (real) — null when no reviews yet so we can hide it
  const avgProductRating = useMemo(() => {
    const rated = (productsData?.data ?? []).filter((p) => p.review_count > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((s, p) => s + toAmount(p.rating) * p.review_count, 0)
    const totalReviews = rated.reduce((s, p) => s + p.review_count, 0)
    return totalReviews > 0 ? sum / totalReviews : null
  }, [productsData])

  if (!isAuthenticated || !isSeller) return null

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <>
      {/* ── Topbar ── */}
      <header className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 lg:top-0 z-10 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-foreground font-semibold text-[15px]">Dashboard</h1>
          <p className="text-muted-foreground text-xs truncate">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {myStore && (
            <Link
              href={`/store/${myStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
              title="Open your public store page in a new tab"
            >
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                View Store
              </Button>
            </Link>
          )}
          <Link
            href="/seller/orders"
            title={stats.pendingCount > 0 ? `${stats.pendingCount} pending order${stats.pendingCount === 1 ? "" : "s"}` : "Orders"}
            className="relative p-2 rounded-xl border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
          >
            <Bell className="w-4 h-4" />
            {stats.pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats.pendingCount}
              </span>
            )}
          </Link>
          <Link href="/seller/products/add">
            <Button size="sm" className="gap-1.5 text-xs shadow-md shadow-primary/20">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Product</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-5 md:space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl px-5 py-4 md:px-6 md:py-5 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white mb-2 md:mb-3">
                <Sparkles className="h-3 w-3" />
                {greeting} 👋
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                {user?.name ?? "Your Store"}
              </h2>
              <p className="text-white/70 text-[11px] md:text-xs mt-1 flex items-center gap-1.5 truncate">
                <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${storeHealth.isLive ? "bg-green-300" : "bg-amber-300"}`} />
                <span className="truncate">{myStore?.name ?? "—"} · {storeHealth.isLive ? "Live in the marketplace" : "Not live yet"}</span>
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 md:gap-8">
              {[
                { label: "Today's Revenue", value: `$${stats.todaysRevenue.toFixed(0)}` },
                { label: "Today's Orders",  value: String(stats.todaysOrders) },
              ].map((k) => (
                <div key={k.label} className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-white">{k.value}</p>
                  <p className="text-white/60 text-[10px] md:text-[11px]">{k.label}</p>
                </div>
              ))}
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              {myStore && (
                <Link href={`/store/${myStore.slug}`} className="hidden sm:block" target="_blank">
                  <Button variant="secondary" size="sm" className="gap-1.5 shadow-xl text-xs">
                    <ExternalLink className="w-3 h-3" />
                    Visit Store
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Subscription banner — only show when action is needed */}
        {myStore && (() => {
          const status = myStore.subscription_status
          const trialEnds = myStore.trial_ends_at ? new Date(myStore.trial_ends_at) : null
          const daysLeft = trialEnds
            ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
            : null

          if (!myStore.is_approved) return null
          if (status === "active") return null
          if (status === "trialing" && (daysLeft ?? 0) > 7) return null

          const config = (() => {
            if (status === "inactive") return {
              icon: Sparkles,
              color: "primary",
              wrap: "bg-primary/5 border-primary/30",
              iconWrap: "bg-primary/15 text-primary",
              title: "Activate your store to go live",
              body: "You're approved! Start your 30-day free trial to make your store visible in the marketplace.",
              cta: "Start free trial",
            }
            if (status === "trialing") return {
              icon: Clock,
              color: "blue",
              wrap: "bg-blue-50 border-blue-200",
              iconWrap: "bg-blue-100 text-blue-600",
              title: `Trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
              body: "Manage your subscription to keep your store live after the trial.",
              cta: "Manage subscription",
            }
            if (status === "lapsed") return {
              icon: AlertTriangle,
              color: "red",
              wrap: "bg-red-50 border-red-200",
              iconWrap: "bg-red-100 text-red-600",
              title: "Store hidden — payment failed",
              body: "Your last subscription payment didn't go through. Reactivate to bring your store back.",
              cta: "Reactivate",
            }
            return {
              icon: CreditCard,
              color: "amber",
              wrap: "bg-amber-50 border-amber-200",
              iconWrap: "bg-amber-100 text-amber-600",
              title: "Subscription cancelled — store hidden",
              body: "Your store is currently hidden from the marketplace. Start a new trial to bring it back.",
              cta: "Restart trial",
            }
          })()
          const Icon = config.icon

          return (
            <div className={`rounded-xl px-4 py-3 flex items-center gap-3 border ${config.wrap}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconWrap}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{config.title}</p>
                <p className="text-xs text-muted-foreground">{config.body}</p>
              </div>
              <Link href="/seller/subscription" className="flex-shrink-0">
                <Button size="sm" className="gap-1 text-xs">
                  {config.cta}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )
        })()}

        {/* Pending alert */}
        {stats.pendingCount > 0 && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-3 bg-amber-50 border border-amber-200">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-amber-800 text-sm flex-1">
              You have{" "}
              <span className="font-semibold">{stats.pendingCount} order{stats.pendingCount > 1 ? "s" : ""}</span>{" "}
              awaiting fulfillment
            </p>
            <Link href="/seller/orders"
              className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs font-semibold transition-colors">
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue",   value: `$${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp,  spark: sparkRevenue, color: "#7C3AED", id: "sp0" },
            { label: "Total Orders",    value: String(stats.totalOrders),           icon: ShoppingBag, spark: sparkOrders,  color: "#EA580C", id: "sp1" },
            // Products / Customers don't have time-series so we hide their sparklines
            // rather than reusing revenue/orders data (which was misleading).
            { label: "Products Listed", value: String(productCount),                icon: Package,     spark: null,         color: "#059669", id: "sp2" },
            { label: "Unique Buyers",   value: String(stats.customers),             icon: Users,       spark: null,         color: "#DB2777", id: "sp3" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label}
                className="group bg-card border border-border rounded-2xl p-5 flex flex-col hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-xs mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight mb-3">{stat.value}</p>
                {stat.spark && (
                  <div className="h-12 -mx-1 -mb-1 mt-auto">
                    <Spark data={stat.spark} color={stat.color} id={stat.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Revenue chart */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-border">
            <div>
              <h3 className="text-foreground font-semibold text-sm">Revenue Overview</h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                {chartLabel} · <span className="text-foreground font-medium">${chartTotal.toFixed(2)} total</span>
              </p>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
              {(["W", "M", "Y"] as const).map((p) => (
                <button key={p} onClick={() => setRevPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    revPeriod === p
                      ? "bg-card border border-border shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {p === "W" ? "Week" : p === "M" ? "Month" : "Year"}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fill: "oklch(0.5 0.01 270)", fontSize: 11 }} />
                <YAxis hide />
                <RechartsTooltip content={<RevTooltip />}
                  cursor={{ stroke: "#7C3AED", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5}
                  fill="url(#revGrad)" dot={false}
                  activeDot={{ r: 4, fill: "#7C3AED", stroke: "rgba(124,58,237,0.3)", strokeWidth: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-5 gap-6 pb-8">

          {/* Orders */}
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-semibold text-sm">Recent Orders</h3>
                <p className="text-muted-foreground text-xs">Latest customer activity</p>
              </div>
              <Link href="/seller/orders"
                className="text-primary hover:text-primary/80 text-xs font-medium transition-colors flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm">
                No orders yet — share your store to start selling.
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 px-6 py-2 bg-muted/30 border-b border-border">
                  {["Order", "Customer", "Items", "Amount", "Status"].map((h) => (
                    <span key={h} className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                <div className="divide-y divide-border">
                  {recentOrders.map((order) => {
                    const s = STATUS[order.status] ?? STATUS.pending
                    const customerName = order.shipping_address?.name ?? "Customer"
                    const items = order.OrderItems ?? []
                    const firstItem = items[0]?.product_snapshot?.name ?? "—"
                    const moreCount = items.length - 1
                    return (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block sm:grid sm:grid-cols-[auto_1fr_1fr_auto_auto] gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        {/* Mobile: stacked card */}
                        <div className="sm:hidden flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {initialsFor(customerName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-foreground text-sm font-medium truncate">{customerName}</p>
                              <p className="text-foreground text-sm font-bold flex-shrink-0">${toAmount(order.total_amount).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-primary text-[11px] font-mono font-semibold">#{order.id.slice(0, 6)}</span>
                              <span className="text-muted-foreground text-[11px]">·</span>
                              <span className="text-muted-foreground text-[11px] truncate flex-1 min-w-0">
                                {firstItem}{moreCount > 0 ? ` +${moreCount} more` : ""}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${s.cls}`}>
                                {s.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop: 5-col grid */}
                        <span className="hidden sm:inline text-primary text-xs font-mono font-semibold self-center">
                          #{order.id.slice(0, 6)}
                        </span>
                        <div className="hidden sm:flex items-center gap-2.5 min-w-0 self-center">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm">
                            {initialsFor(customerName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground text-sm font-medium truncate">{customerName}</p>
                            <p className="text-muted-foreground text-[10px]">{timeAgo(new Date(order.created_at))}</p>
                          </div>
                        </div>
                        <p className="hidden sm:block text-muted-foreground text-sm truncate self-center">
                          {firstItem}{moreCount > 0 ? ` +${moreCount} more` : ""}
                        </p>
                        <p className="hidden sm:block text-foreground text-sm font-bold self-center">${toAmount(order.total_amount).toFixed(2)}</p>
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border self-center ${s.cls}`}>
                          {s.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-foreground font-semibold text-sm">Quick Actions</h3>
              </div>
              <div className="space-y-1">
                {[
                  { icon: Plus,       label: "Add New Product",   href: "/seller/products/add"  },
                  { icon: Edit,       label: "Edit Store Design", href: "/seller/store-builder" },
                  { icon: BarChart3,  label: "View Analytics",    href: "/seller/analytics"     },
                  { icon: LayoutList, label: "Manage Categories", href: "/seller/products?tab=categories" },
                ].map((a) => {
                  const Icon = a.icon
                  return (
                    <Link key={a.href} href={a.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all group border border-transparent hover:border-primary/20">
                      <div className="p-1.5 rounded-lg bg-primary/8 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors flex-1">{a.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Store health — real signals only */}
            <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Store className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-semibold text-sm">Store Health</h3>
                </div>
                {storeHealth.isLive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    Not live
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: "Profile complete", pct: storeHealth.profileCompletePct, hint: "logo, cover, description, location, contact" },
                  { label: "Catalog (10+ products)", pct: storeHealth.catalogPct, hint: `${productCount} listed` },
                  { label: "Storefront set up", pct: storeHealth.storefrontPct, hint: "hero + footer customised" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground" title={item.hint}>{item.label}</span>
                      <span className="text-foreground font-semibold">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center py-2.5 rounded-xl bg-muted/50 border border-border">
                  <p className="text-foreground text-sm font-bold">{productCount}</p>
                  <p className="text-muted-foreground text-[10px]">Products</p>
                </div>
                <div className="text-center py-2.5 rounded-xl bg-muted/50 border border-border">
                  <p className="text-foreground text-sm font-bold">{stats.totalOrders}</p>
                  <p className="text-muted-foreground text-[10px]">Orders</p>
                </div>
                <div className="text-center py-2.5 rounded-xl bg-muted/50 border border-border">
                  <p className="text-foreground text-sm font-bold">
                    {avgProductRating !== null ? `${avgProductRating.toFixed(1)}★` : "—"}
                  </p>
                  <p className="text-muted-foreground text-[10px]">Rating</p>
                </div>
              </div>

              <Link href="/seller/store-builder">
                <Button className="w-full gap-2 shadow-md shadow-primary/20 group" size="sm">
                  <Zap className="w-3.5 h-3.5" />
                  {storeHealth.profileCompletePct < 100 || storeHealth.storefrontPct < 100
                    ? "Finish storefront setup"
                    : "Edit storefront"}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
