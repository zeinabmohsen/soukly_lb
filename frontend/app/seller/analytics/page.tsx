"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Receipt,
  Calendar,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useGetStoreOrdersQuery, type Order } from "@/store/api/orderApi"
import { useGetMyProductsQuery, type Product } from "@/store/api/productApi"

type TimeRange = "7days" | "30days" | "3months" | "year"

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

// Returns the inclusive lower bound for a given range, plus the previous-period
// lower bound (used for delta comparisons).
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

function isPaid(o: Order): boolean {
  return o.status !== "cancelled"
}

export default function AnalyticsPage() {
  const { isSeller, isAuthenticated } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<TimeRange>("30days")

  useEffect(() => {
    if (!isAuthenticated || !isSeller) router.push("/login")
  }, [isAuthenticated, isSeller, router])

  const { data: ordersData, isLoading: ordersLoading } = useGetStoreOrdersQuery(
    { limit: 500 },
    { skip: !isSeller },
  )
  const { data: productsData } = useGetMyProductsQuery(undefined, { skip: !isSeller })

  const allOrders: Order[] = ordersData?.data ?? []
  const products:  Product[] = productsData?.data ?? []

  // Lookup: product_id -> store category name (joins live products with frozen
  // order snapshots). Snapshots that reference deleted products fall back to
  // "Uncategorized".
  const productCategoryMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of products) {
      m.set(p.id, p.category?.name ?? "Uncategorized")
    }
    return m
  }, [products])

  const { current: rangeStart, previous: prevStart } = useMemo(() => rangeBounds(timeRange), [timeRange])

  const splitOrders = useMemo(() => {
    const inCurrent: Order[]  = []
    const inPrevious: Order[] = []
    for (const o of allOrders) {
      const ts = new Date(o.created_at).getTime()
      if (ts >= rangeStart.getTime()) {
        inCurrent.push(o)
      } else if (ts >= prevStart.getTime()) {
        inPrevious.push(o)
      }
    }
    return { current: inCurrent, previous: inPrevious }
  }, [allOrders, rangeStart, prevStart])

  // ── KPIs (current vs previous) ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const sumRevenue = (list: Order[]) =>
      list.filter(isPaid).reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
    const uniqueBuyers = (list: Order[]) => new Set(list.map((o) => o.buyer_id)).size

    const currRev   = sumRevenue(splitOrders.current)
    const prevRev   = sumRevenue(splitOrders.previous)
    const currOrd   = splitOrders.current.length
    const prevOrd   = splitOrders.previous.length
    const currCust  = uniqueBuyers(splitOrders.current)
    const prevCust  = uniqueBuyers(splitOrders.previous)
    const currAov   = currOrd === 0 ? 0 : currRev / currOrd
    const prevAov   = prevOrd === 0 ? 0 : prevRev / prevOrd

    return {
      revenue:   { value: currRev,  prev: prevRev,  delta: pctDelta(currRev,  prevRev) },
      orders:    { value: currOrd,  prev: prevOrd,  delta: pctDelta(currOrd,  prevOrd) },
      customers: { value: currCust, prev: prevCust, delta: pctDelta(currCust, prevCust) },
      aov:       { value: currAov,  prev: prevAov,  delta: pctDelta(currAov,  prevAov) },
    }
  }, [splitOrders])

  // ── Revenue & Orders trend (daily for short ranges, monthly for year) ──────
  const trendData = useMemo(() => {
    const monthly = timeRange === "year"
    const buckets: Record<string, { label: string; revenue: number; orders: number; sortKey: number }> = {}

    if (monthly) {
      // 12 months of the current year, oldest first
      const now = new Date()
      for (let m = 0; m <= now.getMonth(); m++) {
        const d = new Date(now.getFullYear(), m, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        buckets[key] = {
          label:   d.toLocaleDateString("en-US", { month: "short" }),
          revenue: 0,
          orders:  0,
          sortKey: d.getTime(),
        }
      }
    } else {
      // Day buckets across the current range
      const dayCount = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
      const now = new Date()
      for (let i = dayCount - 1; i >= 0; i--) {
        const d = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        buckets[key] = {
          label:   d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: 0,
          orders:  0,
          sortKey: d.getTime(),
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

  // ── Top products (aggregated from order items in the current range) ────────
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

  // ── Revenue per store category ─────────────────────────────────────────────
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

      <div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            label="Total Revenue"
            icon={DollarSign}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            valueLabel={`$${kpis.revenue.value.toFixed(2)}`}
            delta={kpis.revenue.delta}
            previousLabel={`vs $${kpis.revenue.prev.toFixed(2)} last period`}
          />
          <KpiCard
            label="Total Orders"
            icon={ShoppingCart}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            valueLabel={String(kpis.orders.value)}
            delta={kpis.orders.delta}
            previousLabel={`vs ${kpis.orders.prev} last period`}
          />
          <KpiCard
            label="Unique Buyers"
            icon={Users}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            valueLabel={String(kpis.customers.value)}
            delta={kpis.customers.delta}
            previousLabel={`vs ${kpis.customers.prev} last period`}
          />
          <KpiCard
            label="Avg Order Value"
            icon={Receipt}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            valueLabel={`$${kpis.aov.value.toFixed(2)}`}
            delta={kpis.aov.delta}
            previousLabel={`vs $${kpis.aov.prev.toFixed(2)} last period`}
          />
        </div>

        {showEmpty ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <p className="text-base font-medium text-foreground mb-1">No orders in this period</p>
              <p className="text-sm">Try a longer range, or share your store to start collecting data.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="revenue">Revenue & Orders</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Orders Trend</CardTitle>
                  <CardDescription>{periodLabel}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left"  type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} name="Revenue ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="orders"  stroke="#EC4899" strokeWidth={3} name="Orders" />
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
                    <div className="space-y-4">
                      {topProducts.map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{p.name}</p>
                              <p className="text-sm text-muted-foreground">{p.sales} units sold</p>
                            </div>
                          </div>
                          <p className="font-bold text-xl text-primary">${p.revenue.toFixed(2)}</p>
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
                    <div className="grid md:grid-cols-2 gap-8">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={100} fill="#8884d8" dataKey="value">
                            {categoryData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-4">
                        {categoryData.map((c) => (
                          <div key={c.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                              <span className="font-medium">{c.name}</span>
                            </div>
                            <span className="font-bold text-primary">${c.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  icon: Icon,
  iconBg,
  iconColor,
  valueLabel,
  delta,
  previousLabel,
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
    <Card className="animate-in fade-in slide-in-from-bottom duration-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{formatDelta(delta)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold">{valueLabel}</p>
        <p className="text-xs text-muted-foreground mt-2">{previousLabel}</p>
      </CardContent>
    </Card>
  )
}
