"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useGetOrderByIdQuery, useCancelOrderMutation } from "@/store/api/orderApi"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, MapPin, Package, X, Loader2, CreditCard, Truck, Star } from "lucide-react"
import { WriteReviewDialog } from "@/components/write-review-dialog"

const STATUS_COLORS: Record<string, string> = {
  delivered:  "bg-green-100 text-green-700 border-green-200",
  shipped:    "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-orange-100 text-orange-700 border-orange-200",
  confirmed:  "bg-purple-100 text-purple-700 border-purple-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
  pending:    "bg-gray-100 text-gray-700 border-gray-200",
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const id = params.id as string

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id, { skip: !isAuthenticated })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()

  const [reviewingItem, setReviewingItem] = useState<{ productId: string; productName: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.push("/login")
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleCancel = async () => {
    if (!confirm("Cancel this order? This cannot be undone.")) return
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
        <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 pt-20">
          <Package className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Order Not Found</h1>
          <p className="text-muted-foreground">This order doesn&apos;t exist or isn&apos;t yours.</p>
          <Link href="/orders"><Button>Back to Orders</Button></Link>
        </div>
        <Footer />
      </div>
    )
  }

  const items = order.OrderItems ?? []
  const addr = order.shipping_address
  const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0)
  const total = Number(order.total_amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-mono text-lg md:text-2xl break-all">{order.id}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.created_at).toLocaleString()}
              </span>
              {order.store && (
                <Link href={`/store/${order.store.slug}`} className="hover:text-foreground transition-colors">
                  Sold by {order.store.name}
                </Link>
              )}
            </div>
          </div>
          <Badge className={STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}>
            {order.status}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Items ({items.length})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const snap = item.product_snapshot
                  const canReview = order.status === "delivered" && item.product_id
                  return (
                    <div key={item.id} className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={snap?.image_url ?? "/placeholder.svg"}
                          alt={snap?.name ?? "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.product_id ? (
                          <Link href={`/product/${item.product_id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                            {snap?.name}
                          </Link>
                        ) : (
                          <p className="font-medium line-clamp-1">{snap?.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                        </p>
                        {canReview && (
                          <button
                            type="button"
                            onClick={() => setReviewingItem({ productId: item.product_id!, productName: snap?.name ?? "Product" })}
                            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Star className="w-3 h-3" />
                            Write a review
                          </button>
                        )}
                      </div>
                      <span className="font-semibold whitespace-nowrap">
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{addr.name}</p>
                <p className="text-muted-foreground">{addr.phone}</p>
                {addr.email && <p className="text-muted-foreground">{addr.email}</p>}
                <p className="text-muted-foreground">
                  {addr.address}{addr.city ? `, ${addr.city}` : ""}{addr.country ? `, ${addr.country}` : ""}
                </p>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{order.notes}</p></CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-28">
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
                    <span>−${Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  {order.payment_method === "card" ? (
                    <CreditCard className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  <span className="capitalize">{order.payment_method.replace(/_/g, " ")}</span>
                </div>

                {order.status === "pending" && (
                  <Button
                    variant="destructive"
                    className="w-full gap-2 mt-4"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {reviewingItem && (
        <WriteReviewDialog
          productId={reviewingItem.productId}
          productName={reviewingItem.productName}
          orderId={order.id}
          open={!!reviewingItem}
          onOpenChange={(open) => !open && setReviewingItem(null)}
        />
      )}
    </div>
  )
}
