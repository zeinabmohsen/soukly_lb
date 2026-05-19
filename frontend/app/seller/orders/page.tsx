"use client"

import { useEffect, useState } from "react"
import { useGetStoreOrdersQuery, useUpdateOrderStatusMutation, type Order } from "@/store/api/orderApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Calendar, MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const PAGE_SIZE = 20

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-orange-100 text-orange-700 border-orange-200",
  confirmed: "bg-purple-100 text-purple-700 border-purple-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
}

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
}

export default function SellerOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [offset, setOffset] = useState(0)

  useEffect(() => { setOffset(0) }, [filterStatus])

  const { data, isLoading, isFetching } = useGetStoreOrdersQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: PAGE_SIZE,
    offset,
  })
  const [updateStatus] = useUpdateOrderStatusMutation()
  const { toast } = useToast()

  const orders = data?.data ?? []
  const hasMore = data?.has_more ?? false
  const handleLoadMore = () => setOffset((o) => o + PAGE_SIZE)

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    try {
      await updateStatus({ id: order.id, status: newStatus }).unwrap()
      toast({ title: `Order marked as ${newStatus}` })
    } catch {
      toast({ title: "Failed to update order status", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage orders placed in your store</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">Orders placed in your store will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.OrderItems ?? []
            const addr = order.shipping_address
            const nextStatuses = NEXT_STATUSES[order.status] ?? []
            return (
              <Card key={order.id}>
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-sm font-mono">{order.id}</CardTitle>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {items.length} items
                        </span>
                        <span className="font-semibold text-foreground">${Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}>
                        {order.status}
                      </Badge>
                      {nextStatuses.length > 0 && (
                        <Select onValueChange={(s) => handleStatusUpdate(order, s)}>
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextStatuses.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items</p>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={item.product_snapshot?.image_url ?? "/placeholder.svg"}
                                alt={item.product_snapshot?.name ?? "Product"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product_snapshot?.name}</p>
                              <p className="text-xs text-muted-foreground">× {item.quantity} @ ${item.unit_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Shipping
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-muted-foreground">{addr.phone}</p>
                        <p className="text-muted-foreground">{addr.address}{addr.city ? `, ${addr.city}` : ""}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="bg-transparent gap-2"
                onClick={handleLoadMore}
                disabled={isFetching}
              >
                {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFetching ? "Loading…" : `Load more (${(data?.total ?? 0) - orders.length} remaining)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
