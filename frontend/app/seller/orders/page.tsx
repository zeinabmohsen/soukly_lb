"use client"

import { useEffect, useMemo, useState } from "react"
import {
  useGetStoreOrdersQuery,
  useUpdateOrderStatusMutation,
  type Order,
} from "@/store/api/orderApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package, Calendar, MapPin, Loader2, Search, X, Copy, Check,
  User, Phone, Mail, CreditCard, Banknote, FileText, ChevronRight, BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

type Status = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

const STATUS_BADGE: Record<Status, string> = {
  delivered:  "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
  shipped:    "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  processing: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  confirmed:  "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100",
  cancelled:  "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  pending:    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
}

// Single-step "what does the seller do next" — drives the primary action button.
const NEXT_ACTION: Record<Status, { next: Status; label: string } | null> = {
  pending:    { next: "confirmed",  label: "Confirm order" },
  confirmed:  { next: "processing", label: "Start processing" },
  processing: { next: "shipped",    label: "Mark as shipped" },
  shipped:    { next: "delivered",  label: "Mark as delivered" },
  delivered:  null,
  cancelled:  null,
}

const CAN_CANCEL: Set<Status> = new Set(["pending", "confirmed"])
const OPEN_STATUSES: Set<Status> = new Set(["pending", "confirmed", "processing", "shipped"])

const FILTERS: { value: "all" | Status; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
]

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)     return "just now"
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

function OrderIdCopy({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API may be unavailable
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy full order ID"}
      className="inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
    >
      <span>#{id.slice(0, 8).toUpperCase()}</span>
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function SellerOrdersPage() {
  const [filter, setFilter] = useState<"all" | Status>("all")
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => { setOffset(0) }, [filter])

  const { data, isLoading, isFetching } = useGetStoreOrdersQuery({
    status: filter === "all" ? undefined : filter,
    limit: PAGE_SIZE,
    offset,
  })

  // Tab counts — one tiny query per status. RTK Query caches them by serialized
  // args, so the 7 queries dedupe per status across the session and re-fetch
  // together when the "Order" tag is invalidated.
  const allCount        = useGetStoreOrdersQuery({                          limit: 1 }).data?.total
  const pendingCount    = useGetStoreOrdersQuery({ status: "pending",       limit: 1 }).data?.total
  const confirmedCount  = useGetStoreOrdersQuery({ status: "confirmed",     limit: 1 }).data?.total
  const processingCount = useGetStoreOrdersQuery({ status: "processing",    limit: 1 }).data?.total
  const shippedCount    = useGetStoreOrdersQuery({ status: "shipped",       limit: 1 }).data?.total
  const deliveredCount  = useGetStoreOrdersQuery({ status: "delivered",     limit: 1 }).data?.total
  const cancelledCount  = useGetStoreOrdersQuery({ status: "cancelled",     limit: 1 }).data?.total
  const tabCounts: Record<"all" | Status, number | undefined> = {
    all:        allCount,
    pending:    pendingCount,
    confirmed:  confirmedCount,
    processing: processingCount,
    shipped:    shippedCount,
    delivered:  deliveredCount,
    cancelled:  cancelledCount,
  }

  const [updateStatus] = useUpdateOrderStatusMutation()
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)
  const { toast } = useToast()

  const orders = data?.data ?? []
  const totalForFilter = data?.total ?? 0
  const hasMore = data?.has_more ?? false

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      o.shipping_address.name.toLowerCase().includes(q) ||
      o.shipping_address.phone.toLowerCase().includes(q) ||
      (o.shipping_address.email?.toLowerCase().includes(q) ?? false),
    )
  }, [orders, search])

  const handleAdvance = async (order: Order, newStatus: Status) => {
    setBusyOrderId(order.id)
    try {
      await updateStatus({ id: order.id, status: newStatus }).unwrap()
      toast({ title: `Order marked as ${newStatus}` })
    } catch {
      toast({ title: "Could not update status", variant: "destructive" })
    } finally {
      setBusyOrderId(null)
    }
  }

  const handleCancel = async (order: Order) => {
    if (!confirm(`Cancel order #${order.id.slice(0, 8).toUpperCase()}? This cannot be undone.`)) return
    setBusyOrderId(order.id)
    try {
      await updateStatus({ id: order.id, status: "cancelled" }).unwrap()
      toast({ title: "Order cancelled" })
    } catch {
      toast({ title: "Could not cancel order", variant: "destructive" })
    } finally {
      setBusyOrderId(null)
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage orders placed in your store.
          </p>
        </div>
        <Link
          href="/seller/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40"
          title="Open the analytics dashboard"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | Status)}>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex">
            {FILTERS.map((f) => {
              const count = tabCounts[f.value]
              return (
                <TabsTrigger key={f.value} value={f.value} className="capitalize gap-1.5">
                  {f.label}
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] tabular-nums font-semibold"
                  >
                    {count ?? "—"}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
      </Tabs>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer, phone or email…"
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : visibleOrders.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Package className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
            <h2 className="font-semibold mb-1">
              {search.trim()
                ? "No orders match your search"
                : filter === "all"
                  ? "No orders yet"
                  : `No ${filter} orders`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {search.trim()
                ? "Try a different keyword or clear the search."
                : filter === "all"
                  ? "Orders placed in your store will appear here."
                  : `You don't have any orders in "${filter}" status right now.`}
            </p>
            {search.trim() && (
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const items     = order.OrderItems ?? []
            const addr      = order.shipping_address
            const totalQty  = items.reduce((s, i) => s + i.quantity, 0)
            const status    = order.status as Status
            const action    = NEXT_ACTION[status]
            const canCancel = CAN_CANCEL.has(status)
            const isOpen    = OPEN_STATUSES.has(status)
            const isBusy    = busyOrderId === order.id
            const isCOD     = order.payment_method === "cash_on_delivery"

            return (
              <Card
                key={order.id}
                className={cn(
                  "overflow-hidden transition-shadow hover:shadow-md",
                  isOpen && "border-l-4 border-l-primary/70",
                  status === "cancelled" && "opacity-75",
                )}
              >
                <CardHeader className="pb-3 border-b bg-muted/30">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <OrderIdCopy id={order.id} />
                        <Badge className={STATUS_BADGE[status]} variant="outline">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {timeAgo(order.created_at)} · {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {totalQty} {totalQty === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-lg font-bold text-foreground tabular-nums">
                        ${(Number(order.total_amount) || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                        {isCOD ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {isCOD ? "Cash on delivery" : "Card"}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-3">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
                      <div className="space-y-2.5">
                        {items.map((item) => {
                          const lineTotal = item.unit_price * item.quantity
                          return (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                                <img
                                  src={item.product_snapshot?.image_url ?? "/placeholder.svg"}
                                  alt={item.product_snapshot?.name ?? "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product_snapshot?.name ?? "Product"}</p>
                                <p className="text-xs text-muted-foreground tabular-nums">
                                  {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                                </p>
                              </div>
                              <div className="text-sm font-semibold tabular-nums">${lineTotal.toFixed(2)}</div>
                            </div>
                          )
                        })}
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Buyer note
                          </p>
                          <p className="text-xs text-amber-900 whitespace-pre-wrap">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Customer + shipping */}
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                      <div className="text-sm space-y-1.5">
                        <p className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{addr.name}</span>
                        </p>
                        {addr.phone && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <a href={`tel:${addr.phone}`} className="hover:text-foreground hover:underline truncate">{addr.phone}</a>
                          </p>
                        )}
                        {addr.email && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <a href={`mailto:${addr.email}`} className="hover:text-foreground hover:underline truncate">{addr.email}</a>
                          </p>
                        )}
                        <p className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {addr.address}
                            {addr.city ? `, ${addr.city}` : ""}
                            {addr.country ? `, ${addr.country}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {(action || canCancel) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-end gap-2">
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => handleCancel(order)}
                          disabled={isBusy}
                        >
                          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Cancel order
                        </Button>
                      )}
                      {action && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAdvance(order, action.next)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          {action.label}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="bg-transparent gap-2"
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={isFetching}
              >
                {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFetching ? "Loading…" : `Load more (${totalForFilter - orders.length} remaining)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
