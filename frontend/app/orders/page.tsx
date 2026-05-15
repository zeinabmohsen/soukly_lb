"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useGetMyOrdersQuery, useCancelOrderMutation } from "@/store/api/orderApi"

const PAGE_SIZE = 10
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Package, MapPin, Calendar, Eye, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-orange-100 text-orange-700 border-orange-200",
  confirmed: "bg-purple-100 text-purple-700 border-purple-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [offset, setOffset] = useState(0)
  const { data, isLoading, isFetching } = useGetMyOrdersQuery(
    { limit: PAGE_SIZE, offset },
    { skip: !isAuthenticated },
  )
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()

  useEffect(() => {
    if (!isAuthenticated) router.push("/login")
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const orders = data?.data ?? []
  const hasMore = data?.has_more ?? false
  const handleLoadMore = () => setOffset((o) => o + PAGE_SIZE)

  const handleCancel = async (id: string) => {
    try {
      await cancelOrder(id).unwrap()
      toast({ title: "Order cancelled" })
    } catch {
      toast({ title: "Failed to cancel order", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link href="/marketplace">
                <Button size="lg">Browse Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = order.OrderItems ?? []
              const addr = order.shipping_address
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-mono text-sm">{order.id.split("-")[0]}…</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-3">
                          {items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={item.product_snapshot?.image_url ?? "/placeholder.svg"}
                                  alt={item.product_snapshot?.name ?? "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.product_snapshot?.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <span className="font-semibold">${item.unit_price.toFixed(2)}</span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <p className="text-sm text-muted-foreground">+{items.length - 3} more items</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Shipping Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> {addr.name}</p>
                          <p><span className="text-muted-foreground">Phone:</span> {addr.phone}</p>
                          {addr.email && <p><span className="text-muted-foreground">Email:</span> {addr.email}</p>}
                          <p><span className="text-muted-foreground">Address:</span> {addr.address}{addr.city ? `, ${addr.city}` : ""}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {order.payment_method.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t flex gap-3">
                      <Link href={`/orders/${order.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2 bg-transparent">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </Link>
                      {order.status === "pending" && (
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2"
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling}
                        >
                          {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="lg"
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
      </main>
      <Footer />
    </div>
  )
}
