"use client"

import { Suspense, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Receipt,
  Calendar, AlertTriangle, Award, Trophy, Flame, Banknote, CreditCard,
  Repeat, PackageX, PackagePlus, Download,
} from "lucide-react"
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useGetStoreOrdersQuery, type Order } from "@/store/api/orderApi"
import { useGetMyProductsQuery, type Product } from "@/store/api/productApi"

type TimeRange = "7days" | "30days" | "3months" | "year"
type AnalyticsTab = "revenue" | "products" | "categories" | "health"

const VALID_RANGES: TimeRange[] = ["7days", "30days", "3months", "year"]
const VALID_TABS: AnalyticsTab[] = ["revenue", "products", "categories", "health"]

const ORDER_LIMIT = 500

const RANGE_LABEL: Record<TimeRange, string> = {
  "7days":   "Last 7 days",
  "30days":  "Last 30 days",
  "3months": "Last 3 months",
  "year":    "This year",
}

const PIE_COLORS = ["#8B5CF6", "#EC4899", "#F97316", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#14B8A6"]

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function rangeBounds(range: TimeRange): { current: Date; previous: Date } {
  const now = new Date()
  if (range === "year") {
    return {
      current:  new Date(now.getFullYear(), 0, 1),
      previous: new Date(now.getFullYear() - 1, 0, 1),
    }
  }
  const days = range === "7days" ? 7 : range === "30days" ? 30 : 90
  const current  = startOfDay(new Date(now.getTime() - days * 24 * 60 * 60 * 1000))
  const previous = startOfDay(new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000))
  return { current, previous }
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null
  return ((curr - prev) / prev) * 100
}

function formatDelta(pct: number | null): string {
  if (pct === null) return "—"
  const sign = pct > 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function fmtCompactUSD(n: number): string {
  if (n < 1000) return `$${n.toFixed(0)}`
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

function isPaid(o: Order): boolean {
  return o.status !== "cancelled"
}

// Convert the current-range orders to a CSV file the seller can hand to an
// accountant. Quotes embedded commas / quotes per RFC 4180.
function ordersToCsv(orders: Order[]): string {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = [
    "order_id", "created_at", "status", "customer_name", "customer_email",
    "customer_phone", "items", "quantity_total", "total_amount", "payment_method",
  ].join(",")
  const rows = orders.map((o) => {
    const items = (o.OrderItems ?? [])
      .map((i) => `${i.quantity}× ${i.product_snapshot.name}`)
      .join("; ")
    const qty = (o.OrderItems ?? []).reduce((s, i) => s + i.quantity, 0)
    return [
      o.id, o.created_at, o.status, o.shipping_address?.name ?? "",
      o.shipping_address?.email ?? "", o.shipping_address?.phone ?? "",
      items, qty, Number(o.total_amount).toFixed(2), o.payment_method,
    ].map(escape).join(",")
  })
  return [header, ...rows].join("\r\n")
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  // useSearchParams requires a Suspense boundary in Next.js 16. Wrap the inner
  // component so the page doesn't deopt to fully dynamic rendering on every nav.
  return (
    <Suspense fallback={null}>
      <AnalyticsPageInner />
    </Suspense>
  )
}

function AnalyticsPageInner() {
  const { isSeller, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL is the source of truth — no local state. This way same-route navigation
  // (e.g. clicking an in-app Link with new params) re-renders to the new view
  // even though Next.js doesn't remount the page component.
  const urlRange = searchParams.get("range") as TimeRange | null
  const urlTab   = searchParams.get("tab") as AnalyticsTab | null
  const timeRange: TimeRange    = urlRange && VALID_RANGES.includes(urlRange) ? urlRange : "30days"
  const tab:       AnalyticsTab = urlTab   && VALID_TABS.includes(urlTab)     ? urlTab   : "revenue"

  // Use replace so we don't litter history with every tab toggle.
  const writeUrl = (next: { range?: TimeRange; tab?: AnalyticsTab }) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (next.range) sp.set("range", next.range)
    if (next.tab)   sp.set("tab",   next.tab)
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }
  const setTimeRange = (v: TimeRange)    => writeUrl({ range: v })
  const setTab       = (v: AnalyticsTab) => writeUrl({ tab: v })

  useEffect(() => {
    if (!isAuthenticated || !isSeller) router.push("/login")
  }, [isAuthenticated, isSeller, router])

  const { data: ordersData, isLoading: ordersLoading } = useGetStoreOrdersQuery(
    { limit: ORDER_LIMIT },
    { skip: !isSeller },
  )
  const { data: productsData } = useGetMyProductsQuery(undefined, { skip: !isSeller })

  const allOrders: Order[] = ordersData?.data ?? []
  const products:  Product[] = productsData?.data ?? []
  const dataCapped = (ordersData?.total ?? 0) > ORDER_LIMIT

  const productCategoryMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of products) m.set(p.id, p.category?.name ?? "Uncategorized")
    return m
  }, [products])

  const { current: rangeStart, previous: prevStart } = useMemo(() => rangeBounds(timeRange), [timeRange])

  const splitOrders = useMemo(() => {
    const inCurrent: Order[]  = []
    const inPrevious: Order[] = []
    for (const o of allOrders) {
      const ts = new Date(o.created_at).getTime()
      if (ts >= rangeStart.getTime()) inCurrent.push(o)
      else if (ts >= prevStart.getTime()) inPrevious.push(o)
    }
    return { current: inCurrent, previous: inPrevious }
  }, [allOrders, rangeStart, prevStart])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const sumRevenue = (list: Order[]) =>
      list.filter(isPaid).reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
    const uniqueBuyers = (list: Order[]) => new Set(list.map((o) => o.buyer_id)).size

    const currRev  = sumRevenue(splitOrders.current)
    const prevRev  = sumRevenue(splitOrders.previous)
    const currOrd  = splitOrders.current.length
    const prevOrd  = splitOrders.previous.length
    const currCust = uniqueBuyers(splitOrders.current)
    const prevCust = uniqueBuyers(splitOrders.previous)
    const currAov  = currOrd === 0 ? 0 : currRev / currOrd
    const prevAov  = prevOrd === 0 ? 0 : prevRev / prevOrd

    return {
      revenue:   { value: currRev,  prev: prevRev,  delta: pctDelta(currRev,  prevRev) },
      orders:    { value: currOrd,  prev: prevOrd,  delta: pctDelta(currOrd,  prevOrd) },
      customers: { value: currCust, prev: prevCust, delta: pctDelta(currCust, prevCust) },
      aov:       { value: currAov,  prev: prevAov,  delta: pctDelta(currAov,  prevAov) },
    }
  }, [splitOrders])

  // ── Trend (daily for short ranges, monthly for year) ───────────────────────
  const trendData = useMemo(() => {
    const monthly = timeRange === "year"
    const buckets: Record<string, { label: string; revenue: number; orders: number; sortKey: number }> = {}

    if (monthly) {
      const now = new Date()
      for (let m = 0; m <= now.getMonth(); m++) {
        const d = new Date(now.getFullYear(), m, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        buckets[key] = {
          label:   d.toLocaleDateString("en-US", { month: "short" }),
          revenue: 0, orders: 0, sortKey: d.getTime(),
        }
      }
    } else {
      const dayCount = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
      const now = new Date()
      for (let i = dayCount - 1; i >= 0; i--) {
        const d = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        buckets[key] = {
          label:   d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: 0, orders: 0, sortKey: d.getTime(),
        }
      }
    }

    for (const o of splitOrders.current) {
      const d = new Date(o.created_at)
      const key = monthly
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      const b = buckets[key]
      if (!b) continue
      if (isPaid(o)) b.revenue += (Number(o.total_amount) || 0)
      b.orders += 1
    }

    return Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey)
  }, [splitOrders.current, timeRange])

  // ── Top products ───────────────────────────────────────────────────────────
  const topProducts = useMemo(() => {
    type Agg = { name: string; sales: number; revenue: number }
    const byProduct = new Map<string, Agg>()

    for (const o of splitOrders.current) {
      if (!isPaid(o)) continue
      for (const item of o.OrderItems ?? []) {
        const key  = item.product_id ?? `snapshot:${item.product_snapshot.id}`
        const name = item.product_snapshot.name
        const existing = byProduct.get(key) ?? { name, sales: 0, revenue: 0 }
        existing.sales   += item.quantity
        existing.revenue += (Number(item.unit_price) || 0) * (item.quantity || 0)
        byProduct.set(key, existing)
      }
    }

    return Array.from(byProduct.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [splitOrders.current])

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>()
    for (const o of splitOrders.current) {
      if (!isPaid(o)) continue
      for (const item of o.OrderItems ?? []) {
        const categoryName = item.product_id
          ? productCategoryMap.get(item.product_id) ?? "Uncategorized"
          : "Uncategorized"
        const revenue = (Number(item.unit_price) || 0) * (item.quantity || 0)
        totals.set(categoryName, (totals.get(categoryName) ?? 0) + revenue)
      }
    }
    return Array.from(totals.entries())
      .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
  }, [splitOrders.current, productCategoryMap])

  // ── Highlights (best day / top product / top category) ─────────────────────
  const highlights = useMemo(() => {
    const bestDay = trendData.reduce(
      (best, d) => (d.revenue > best.revenue ? d : best),
      { label: "—", revenue: 0, orders: 0, sortKey: 0 },
    )
    return {
      bestDay:      bestDay.revenue > 0 ? bestDay : null,
      topProduct:   topProducts[0] ?? null,
      topCategory:  categoryData[0] ?? null,
    }
  }, [trendData, topProducts, categoryData])

  // ── Order health ───────────────────────────────────────────────────────────
  const health = useMemo(() => {
    const list = splitOrders.current
    const total = list.length
    const cancelled = list.filter((o) => o.status === "cancelled").length
    const cod = list.filter((o) => o.payment_method === "cash_on_delivery").length
    const itemsTotal = list.reduce(
      (s, o) => s + (o.OrderItems?.reduce((q, i) => q + i.quantity, 0) ?? 0),
      0,
    )

    // Repeat-buyer rate within the current range: buyers with ≥2 orders.
    const buyerCounts = new Map<string, number>()
    for (const o of list) buyerCounts.set(o.buyer_id, (buyerCounts.get(o.buyer_id) ?? 0) + 1)
    const uniqueBuyers = buyerCounts.size
    const repeatBuyers = Array.from(buyerCounts.values()).filter((n) => n >= 2).length

    return {
      total,
      cancellationRate: total === 0 ? 0 : (cancelled / total) * 100,
      itemsPerOrder:    total === 0 ? 0 : itemsTotal / total,
      repeatRate:       uniqueBuyers === 0 ? 0 : (repeatBuyers / uniqueBuyers) * 100,
      codShare:         total === 0 ? 0 : (cod / total) * 100,
      cardShare:        total === 0 ? 0 : ((total - cod) / total) * 100,
    }
  }, [splitOrders.current])

  if (!isAuthenticated || !isSeller) return null

  const periodLabel = RANGE_LABEL[timeRange]
  const showEmpty = !ordersLoading && splitOrders.current.length === 0

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Order-based metrics — revenue, orders, buyers, top products.
            <span className="block text-xs mt-0.5">Page views and visitor traffic are not tracked yet.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            disabled={splitOrders.current.length === 0}
            onClick={() => {
              const csv = ordersToCsv(splitOrders.current)
              const stamp = new Date().toISOString().slice(0, 10)
              downloadCsv(`soukly-orders-${timeRange}-${stamp}.csv`, csv)
            }}
            title={splitOrders.current.length === 0 ? "No orders in this period to export" : "Download orders in this period as CSV"}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {dataCapped && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold">Showing your most recent {ORDER_LIMIT} orders</p>
            <p className="text-xs mt-0.5 text-amber-800">
              Your store has more orders than we can analyse client-side. Numbers below reflect the most recent batch only.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {ordersLoading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[148px] rounded-xl" />)
        ) : (
          <>
            <KpiCard
              label="Total Revenue"
              icon={DollarSign}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              valueLabel={fmtUSD(kpis.revenue.value)}
              delta={kpis.revenue.delta}
              previousLabel={`vs ${fmtUSD(kpis.revenue.prev)} last period`}
            />
            <KpiCard
              label="Total Orders"
              icon={ShoppingCart}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              valueLabel={kpis.orders.value.toLocaleString()}
              delta={kpis.orders.delta}
              previousLabel={`vs ${kpis.orders.prev.toLocaleString()} last period`}
            />
            <KpiCard
              label="Unique Buyers"
              icon={Users}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              valueLabel={kpis.customers.value.toLocaleString()}
              delta={kpis.customers.delta}
              previousLabel={`vs ${kpis.customers.prev.toLocaleString()} last period`}
            />
            <KpiCard
              label="Avg Order Value"
              icon={Receipt}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              valueLabel={fmtUSD(kpis.aov.value)}
              delta={kpis.aov.delta}
              previousLabel={`vs ${fmtUSD(kpis.aov.prev)} last period`}
            />
          </>
        )}
      </div>

      {/* Highlights */}
      {!ordersLoading && !showEmpty && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <HighlightCard
            icon={Flame}
            iconColor="text-rose-500"
            label="Best day"
            value={highlights.bestDay ? highlights.bestDay.label : "—"}
            sub={highlights.bestDay ? `${fmtUSD(highlights.bestDay.revenue)} · ${highlights.bestDay.orders} order${highlights.bestDay.orders === 1 ? "" : "s"}` : "No paid orders yet"}
          />
          <HighlightCard
            icon={Trophy}
            iconColor="text-amber-500"
            label="Top product"
            value={highlights.topProduct ? highlights.topProduct.name : "—"}
            sub={highlights.topProduct ? `${fmtUSD(highlights.topProduct.revenue)} · ${highlights.topProduct.sales} units` : "No products sold"}
          />
          <HighlightCard
            icon={Award}
            iconColor="text-violet-500"
            label="Top category"
            value={highlights.topCategory ? highlights.topCategory.name : "—"}
            sub={highlights.topCategory ? fmtUSD(highlights.topCategory.value) : "No category data"}
          />
        </div>
      )}

      {ordersLoading ? (
        <Skeleton className="h-[500px] rounded-xl" />
      ) : showEmpty ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-base font-medium text-foreground mb-1">No orders in this period</p>
            <p className="text-sm">Try a longer range, or share your store to start collecting data.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as AnalyticsTab)} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="revenue">Revenue & Orders</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Orders Trend</CardTitle>
                <CardDescription>{periodLabel}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#8B5CF6"
                      tickFormatter={(v: number) => fmtCompactUSD(v)}
                      width={70}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#EC4899"
                      allowDecimals={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                        fontSize: 13,
                      }}
                      formatter={(v: number, name: string) =>
                        name === "Revenue" ? [fmtUSD(v), "Revenue"] : [v.toLocaleString(), "Orders"]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      name="Revenue"
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#EC4899"
                      strokeWidth={2.5}
                      name="Orders"
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Best Selling Products</CardTitle>
                <CardDescription>Top 5 by revenue · {periodLabel}</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No product sales in this period.</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sales} units sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary tabular-nums whitespace-nowrap">{fmtUSD(p.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across your store categories · {periodLabel}</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No category sales in this period.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => {
                            const pct = Math.round((percent ?? 0) * 100)
                            return pct >= 5 ? `${pct}%` : ""
                          }}
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        >
                          {categoryData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--background))",
                            fontSize: 13,
                          }}
                          formatter={(v: number) => [fmtUSD(v), "Revenue"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {categoryData.map((c) => (
                        <div key={c.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="font-medium truncate">{c.name}</span>
                          </div>
                          <span className="font-bold text-primary tabular-nums whitespace-nowrap">{fmtUSD(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid md:grid-cols-2 gap-4">
              <HealthCard
                icon={PackageX}
                iconBg="bg-rose-100"
                iconColor="text-rose-600"
                label="Cancellation rate"
                value={`${health.cancellationRate.toFixed(1)}%`}
                hint={
                  health.cancellationRate >= 10
                    ? "High — review what's causing cancellations"
                    : "Healthy"
                }
                hintTone={health.cancellationRate >= 10 ? "warn" : "good"}
              />
              <HealthCard
                icon={PackagePlus}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                label="Items per order"
                value={health.itemsPerOrder.toFixed(2)}
                hint={
                  health.itemsPerOrder >= 2
                    ? "Buyers are bundling — good upsell signal"
                    : "Most buyers add a single item"
                }
              />
              <HealthCard
                icon={Repeat}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
                label="Repeat buyer rate"
                value={`${health.repeatRate.toFixed(1)}%`}
                hint={
                  health.repeatRate >= 20
                    ? "Strong retention"
                    : "Most buyers in this window only ordered once"
                }
                hintTone={health.repeatRate >= 20 ? "good" : undefined}
              />
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Banknote className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment mix</p>
                      <p className="text-xs text-muted-foreground">Cash on delivery vs card</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash
                      </span>
                      <span className="font-semibold tabular-nums">{health.codShare.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${health.codShare}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Card
                      </span>
                      <span className="font-semibold tabular-nums">{health.cardShare.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${health.cardShare}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function KpiCard({
  label, icon: Icon, iconBg, iconColor, valueLabel, delta, previousLabel,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  valueLabel: string
  delta: number | null
  previousLabel: string
}) {
  const positive = delta !== null && delta >= 0
  const trendColor = delta === null ? "text-muted-foreground" : positive ? "text-green-600" : "text-red-600"
  const TrendIcon = positive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold tabular-nums">{formatDelta(delta)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold tabular-nums">{valueLabel}</p>
        <p className="text-xs text-muted-foreground mt-2">{previousLabel}</p>
      </CardContent>
    </Card>
  )
}

function HighlightCard({
  icon: Icon, iconColor, label, value, sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  label: string
  value: string
  sub: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <p className="text-base font-bold truncate" title={value}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate" title={sub}>{sub}</p>
      </CardContent>
    </Card>
  )
}

function HealthCard({
  icon: Icon, iconBg, iconColor, label, value, hint, hintTone,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: string
  hint: string
  hintTone?: "good" | "warn"
}) {
  const hintColor = hintTone === "warn"
    ? "text-amber-700"
    : hintTone === "good"
      ? "text-emerald-700"
      : "text-muted-foreground"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        <p className={`text-xs mt-2 ${hintColor}`}>{hint}</p>
      </CardContent>
    </Card>
  )
}
