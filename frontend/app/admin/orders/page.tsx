"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search, Download, Package, Eye, Store, User as UserIcon, Phone, Mail, MapPin, CreditCard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation, type Order } from "@/store/api/orderApi"
import { ORDER_STATUS_CFG, ORDER_STATUSES } from "@/components/admin/admin-ui"

export default function AdminOrdersPage() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useGetAdminOrdersQuery({ limit: 250 }, { skip: !isAdmin })
  const orders = useMemo(() => data?.data ?? [], [data])

  const nonCancelled = orders.filter((o) => o.status !== "cancelled")
  const revenue = nonCancelled.reduce((sum, o) => sum + Number(o.total_amount), 0)

  const filtered = orders
    .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
    .filter((o) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        (o.shipping_address?.name ?? "").toLowerCase().includes(q) ||
        (o.store?.name ?? "").toLowerCase().includes(q)
      )
    })

  const exportCsv = () => {
    const rows = [
      ["Order ID", "Buyer", "Store", "Status", "Items", "Total", "Date"],
      ...filtered.map((o) => [
        o.id,
        o.shipping_address?.name ?? "",
        o.store?.name ?? "",
        o.status,
        String(o.OrderItems?.length ?? 0),
        Number(o.total_amount).toFixed(2),
        new Date(o.created_at).toISOString(),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `soukly-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">Every order across all stores.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>{filtered.length} order{filtered.length !== 1 ? "s" : ""}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue (excl. cancelled): <span className="font-semibold text-foreground">${revenue.toFixed(2)}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent self-start" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by order ID, buyer, or store..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex rounded-lg bg-muted/50 p-0.5 overflow-x-auto">
              {["all", ...ORDER_STATUSES].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    statusFilter === f ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : ORDER_STATUS_CFG[f]?.label ?? f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-semibold">No orders found</p>
              <p className="text-sm text-muted-foreground">
                {orders.length === 0 ? "Orders will appear here as buyers check out across stores." : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((order) => {
                const statusCfg = ORDER_STATUS_CFG[order.status]
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left flex items-center gap-4 p-3 border rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                      <div>
                        <p className="font-medium text-sm truncate">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.shipping_address?.name ?? "Unknown buyer"}</p>
                      </div>
                      <div className="hidden md:block min-w-0">
                        <p className="text-sm font-medium truncate">{order.store?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.OrderItems?.length ?? 0} item{(order.OrderItems?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={statusCfg?.cls ?? ""}>{statusCfg?.label ?? order.status}</Badge>
                      <span className="md:hidden font-semibold text-sm">${Number(order.total_amount).toFixed(2)}</span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={setSelectedOrder} />
    </div>
  )
}

function OrderDetailDialog({
  order,
  onClose,
  onUpdated,
}: {
  order: Order | null
  onClose: () => void
  onUpdated: (order: Order) => void
}) {
  const { toast } = useToast()
  const [updateStatus, { isLoading }] = useUpdateAdminOrderStatusMutation()
  const statusCfg = order ? ORDER_STATUS_CFG[order.status] : null

  const handleStatus = async (status: string) => {
    if (!order || status === order.status) return
    try {
      const updated = await updateStatus({ id: order.id, status }).unwrap()
      onUpdated(updated)
      toast({ title: "Order updated", description: `Status set to ${ORDER_STATUS_CFG[status]?.label ?? status}` })
    } catch (e) {
      const msg = (e as { data?: { message?: string } })?.data?.message
      toast({ title: "Update failed", description: msg, variant: "destructive" })
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Order #{order.id.slice(0, 8)}
                <Badge variant="outline" className={statusCfg?.cls ?? ""}>{statusCfg?.label ?? order.status}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5"><Store className="w-4 h-4" />{order.store?.name ?? "—"}</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>

              <Separator />

              <div>
                <p className="font-semibold mb-2">Shipping &amp; contact</p>
                <div className="space-y-1.5 text-muted-foreground">
                  <p className="flex items-center gap-2"><UserIcon className="w-3.5 h-3.5" />{order.shipping_address?.name ?? "—"}</p>
                  {order.shipping_address?.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{order.shipping_address.phone}</p>}
                  {order.shipping_address?.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{order.shipping_address.email}</p>}
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      {order.shipping_address?.address}
                      {order.shipping_address?.city ? `, ${order.shipping_address.city}` : ""}
                      {order.shipping_address?.country ? `, ${order.shipping_address.country}` : ""}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 capitalize">
                    <CreditCard className="w-3.5 h-3.5" />{order.payment_method?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-semibold mb-2">Items ({order.OrderItems?.length ?? 0})</p>
                <div className="space-y-2">
                  {(order.OrderItems ?? []).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {item.product_snapshot?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product_snapshot.image_url} alt={item.product_snapshot?.name ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_snapshot?.name ?? "Product"}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * Number(item.unit_price)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-1">Notes</p>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="font-semibold mb-2">Update status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === order.status ? "default" : "outline"}
                      disabled={isLoading || s === order.status}
                      onClick={() => handleStatus(s)}
                      className={s === order.status ? "" : "bg-transparent"}
                    >
                      {ORDER_STATUS_CFG[s]?.label ?? s}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Admin override — sets any status. Cancelling restores stock; reinstating re-reserves it.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
