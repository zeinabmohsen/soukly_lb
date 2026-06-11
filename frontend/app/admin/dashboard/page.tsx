"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Store, ShoppingBag, TrendingUp, DollarSign, Package, Check, Loader2,
  Wallet, Users, CreditCard, Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PLANS, getPlan } from "@/lib/plans"
import {
  useGetAdminStoresQuery,
  useGetAdminBillingQuery,
  useApproveStoreMutation,
  type SubscriptionStatus,
} from "@/store/api/storeApi"
import { useGetUsersQuery } from "@/store/api/userApi"
import { useGetAdminOrdersQuery } from "@/store/api/orderApi"
import {
  SUBSCRIPTION_LABEL, SUBSCRIPTION_BAR_CLASS, SUBSCRIPTION_STATUSES,
  ORDER_STATUS_CFG, ORDER_STATUSES, PLAN_BAR_CLASS, BarTrack, EmptyHint, initials,
} from "@/components/admin/admin-ui"

export default function AdminOverviewPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const { data: storesData, isLoading: storesLoading } = useGetAdminStoresQuery({ status: "all" }, { skip: !isAdmin })
  const { data: usersData,  isLoading: usersLoading  } = useGetUsersQuery(undefined, { skip: !isAdmin })
  const { data: ordersData, isLoading: ordersLoading } = useGetAdminOrdersQuery({ limit: 250 }, { skip: !isAdmin })
  const { data: billingData } = useGetAdminBillingQuery({ limit: 1 }, { skip: !isAdmin })
  const [approveStore, { isLoading: isApproving }] = useApproveStoreMutation()

  const stores  = useMemo(() => storesData?.data ?? [], [storesData])
  const users   = useMemo(() => usersData?.data  ?? [], [usersData])
  const orders  = useMemo(() => ordersData?.data ?? [], [ordersData])

  const pending  = stores.filter((s) => !s.is_approved)
  const paying   = stores.filter((s) => s.subscription_status === "active" || s.subscription_status === "trialing")
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled")
  const ordersRevenue = nonCancelledOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const avgOrderValue = nonCancelledOrders.length ? ordersRevenue / nonCancelledOrders.length : 0

  const activeSubs   = stores.filter((s) => s.subscription_status === "active")
  const trialingSubs = stores.filter((s) => s.subscription_status === "trialing")
  const mrr = activeSubs.reduce((sum, s) => sum + getPlan(s.plan_id).price, 0)
  const trialPipeline = trialingSubs.reduce((sum, s) => sum + getPlan(s.plan_id).price, 0)

  const planDistribution = useMemo(
    () => PLANS.map((p) => ({
      id: p.id, name: p.name, price: p.price,
      count: activeSubs.filter((s) => (s.plan_id ?? "starter") === p.id).length,
    })),
    [activeSubs],
  )

  const subStatusDistribution = useMemo(
    () => SUBSCRIPTION_STATUSES.map((status) => ({
      status,
      count: stores.filter((s) => (s.subscription_status ?? "inactive") === status).length,
    })).filter((d) => d.count > 0),
    [stores],
  )

  const orderStatusDistribution = useMemo(
    () => ORDER_STATUSES.map((status) => ({
      status, count: orders.filter((o) => o.status === status).length,
    })).filter((d) => d.count > 0),
    [orders],
  )

  const handleApprove = async (storeId: string) => {
    try {
      await approveStore({ id: storeId, approved: true }).unwrap()
      toast({ title: "Store approved", description: "The seller can now access their dashboard." })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    }
  }

  const stats = [
    { label: "MRR",              value: storesLoading ? "—" : `$${mrr.toFixed(0)}`,           icon: Wallet, accent: mrr > 0, hint: `${activeSubs.length} active` },
    { label: "Total Stores",     value: storesLoading ? "—" : String(stores.length),         icon: Store },
    { label: "Pending Approval", value: storesLoading ? "—" : String(pending.length),        icon: ShoppingBag, accent: pending.length > 0 },
    { label: "Paying / Trialing",value: storesLoading ? "—" : String(paying.length),         icon: DollarSign },
    { label: "Total Users",      value: usersLoading  ? "—" : String(users.length),          icon: Users },
    { label: "Platform GMV",     value: ordersLoading ? "—" : `$${ordersRevenue.toFixed(0)}`, icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Marketplace health at a glance.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className={`animate-in fade-in slide-in-from-bottom duration-500 ${stat.accent ? "border-amber-500/40 bg-amber-500/5" : ""}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-4 md:p-5">
                <div className={`p-2 rounded-lg w-fit mb-3 ${stat.accent ? "bg-amber-500/15" : "bg-primary/10"}`}>
                  <Icon className={`w-4 h-4 ${stat.accent ? "text-amber-600" : "text-primary"}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                {stat.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{stat.hint}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <CreditCard className="w-4 h-4 text-green-600" /> Monthly Recurring Revenue
            </div>
            <p className="text-3xl font-bold">${mrr.toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              From {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Clock className="w-4 h-4 text-blue-600" /> Trial Pipeline
            </div>
            <p className="text-3xl font-bold">${trialPipeline.toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              {trialingSubs.length} store{trialingSubs.length !== 1 ? "s" : ""} on free trial — potential MRR
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <ShoppingBag className="w-4 h-4 text-primary" /> Avg Order Value
            </div>
            <p className="text-3xl font-bold">${avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {nonCancelledOrders.length} non-cancelled order{nonCancelledOrders.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan distribution */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Active plans</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {storesLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : activeSubs.length === 0 ? (
              <EmptyHint icon={CreditCard} text="No active paid subscriptions yet." />
            ) : (
              planDistribution.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium capitalize">{p.name} <span className="text-muted-foreground font-normal">· ${p.price}/mo</span></span>
                    <span className="text-muted-foreground">{p.count} · ${(p.count * p.price).toFixed(0)}/mo</span>
                  </div>
                  <BarTrack value={p.count} total={activeSubs.length} className={PLAN_BAR_CLASS[p.id] ?? "bg-primary"} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Subscription status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Subscription status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {storesLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : subStatusDistribution.length === 0 ? (
              <EmptyHint icon={Store} text="No stores yet." />
            ) : (
              subStatusDistribution.map((d) => (
                <div key={d.status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{SUBSCRIPTION_LABEL[d.status]}</span>
                    <span className="text-muted-foreground">{d.count}</span>
                  </div>
                  <BarTrack value={d.count} total={stores.length} className={SUBSCRIPTION_BAR_CLASS[d.status]} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Orders by status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {ordersLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : orderStatusDistribution.length === 0 ? (
              <EmptyHint icon={Package} text="No orders yet." />
            ) : (
              orderStatusDistribution.map((d) => (
                <div key={d.status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{ORDER_STATUS_CFG[d.status]?.label ?? d.status}</span>
                    <span className="text-muted-foreground">{d.count}</span>
                  </div>
                  <BarTrack value={d.count} total={orders.length} className={ORDER_STATUS_CFG[d.status]?.bar ?? "bg-primary"} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Needs attention
              {pending.length > 0 && <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">{pending.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : pending.length === 0 ? (
              <EmptyHint icon={Check} text="All seller applications are reviewed." />
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 5).map((store) => (
                  <div key={store.id} className="flex items-center gap-3 p-2.5 rounded-lg border">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(store.name)}
                    </div>
                    <Link href={`/admin/stores/${store.id}`} className="flex-1 min-w-0 group">
                      <p className="font-medium text-sm truncate group-hover:underline">{store.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{store.location ?? "—"}</p>
                    </Link>
                    <Button
                      size="sm" className="gap-1 h-8 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(store.id)} disabled={isApproving}
                    >
                      {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </Button>
                  </div>
                ))}
                {pending.length > 5 && (
                  <Link href="/admin/sellers?status=pending" className="block text-center text-sm text-primary hover:underline pt-1">
                    View all {pending.length} pending
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
