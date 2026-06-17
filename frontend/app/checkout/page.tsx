"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { applyStockSync } from "@/store/slices/cartSlice"
import { useCheckoutMutation } from "@/store/api/orderApi"
import { useValidatePromotionMutation } from "@/store/api/promotionApi"
import {
  useGetMyAddressesQuery,
  useCreateMyAddressMutation,
  type Address,
} from "@/store/api/addressApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ShoppingBag, Loader2, CreditCard, Truck, MapPin, Plus, Check, Tag, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface ShippingForm {
  name: string
  phone: string
  email: string
  address: string
  city: string
}

const EMPTY_FORM: ShippingForm = { name: "", phone: "", email: "", address: "", city: "" }

export default function CheckoutPage() {
  const { isAuthenticated, isHydrating, user } = useAuth()
  const { items, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation()
  const { data: addressesData, isLoading: addressesLoading } = useGetMyAddressesQuery(undefined, {
    skip: !isAuthenticated,
  })
  const [createAddress] = useCreateMyAddressMutation()

  const savedAddresses = addressesData?.data ?? []

  const [mode, setMode] = useState<"saved" | "new">("saved")
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM)
  const [saveAddress, setSaveAddress] = useState(true)
  const [addressLabel, setAddressLabel] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "card">("cash_on_delivery")

  // Coupon: a code applies to a single store's items in the cart.
  const [validatePromotion, { isLoading: isValidatingCoupon }] = useValidatePromotionMutation()
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<
    { code: string; storeId: string; storeName: string; discount: number } | null
  >(null)

  // When addresses load, pick the default (or first) as the initial selection,
  // and flip to "new" mode if the user has no saved addresses.
  useEffect(() => {
    if (addressesLoading) return
    if (savedAddresses.length === 0) {
      setMode("new")
      setForm((f) => ({
        ...f,
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        email: user?.email ?? "",
      }))
    } else if (!selectedAddressId) {
      const def = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0]
      setSelectedAddressId(def.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesLoading, savedAddresses.length])

  const selectedAddress = useMemo(
    () => savedAddresses.find((a) => a.id === selectedAddressId) ?? null,
    [savedAddresses, selectedAddressId],
  )

  // Redirect in an effect (never during render), and only once hydration has
  // settled so a reloaded shopper isn't bounced while /auth/refresh is pending.
  useEffect(() => {
    if (!isHydrating && !isAuthenticated) router.push("/login?redirect=/checkout")
  }, [isHydrating, isAuthenticated, router])

  if (!isAuthenticated) return null

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleChange = (field: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const buildShippingFromForm = (): ShippingForm => form
  const buildShippingFromAddress = (a: Address): ShippingForm => ({
    name: a.recipient_name,
    phone: a.phone,
    email: user?.email ?? "",
    address: a.address_line,
    city: a.city ?? "",
  })

  // Mirror of the backend discount math, scoped to one store's subtotal.
  const computeDiscount = (
    promo: { discount_type: "percentage" | "fixed"; discount_value: number; max_discount: number | null },
    storeSubtotal: number,
  ) => {
    let d = promo.discount_type === "percentage" ? storeSubtotal * (promo.discount_value / 100) : promo.discount_value
    if (promo.discount_type === "percentage" && promo.max_discount != null) d = Math.min(d, promo.max_discount)
    return Number(Math.min(d, storeSubtotal).toFixed(2))
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    try {
      const res = await validatePromotion({ code }).unwrap()
      const { promotion } = res
      const storeItems = items.filter((i) => i.storeId === promotion.store.id)
      const storeSubtotal = storeItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

      if (storeItems.length === 0) {
        return toast({
          title: "Code doesn't apply",
          description: `“${promotion.code}” is for ${promotion.store.name}, which isn't in your cart.`,
          variant: "destructive",
        })
      }
      if (promotion.min_order_amount != null && storeSubtotal < promotion.min_order_amount) {
        return toast({
          title: "Minimum not met",
          description: `Spend $${promotion.min_order_amount.toFixed(2)} at ${promotion.store.name} to use this code.`,
          variant: "destructive",
        })
      }

      const discount = computeDiscount(promotion, storeSubtotal)
      setAppliedCoupon({ code: promotion.code, storeId: promotion.store.id, storeName: promotion.store.name, discount })
      toast({ title: "Code applied", description: `${promotion.code} — you save $${discount.toFixed(2)}` })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "That code isn't valid"
      toast({ title: "Couldn't apply code", description: msg, variant: "destructive" })
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let shipping: ShippingForm
    if (mode === "saved") {
      if (!selectedAddress) {
        return toast({ title: "Pick an address to ship to", variant: "destructive" })
      }
      shipping = buildShippingFromAddress(selectedAddress)
    } else {
      if (!form.name || !form.phone || !form.address) {
        return toast({ title: "Name, phone and address are required", variant: "destructive" })
      }
      shipping = buildShippingFromForm()

      // Optionally save the new address for future checkouts
      if (saveAddress) {
        try {
          await createAddress({
            label: addressLabel || null,
            recipient_name: form.name,
            phone: form.phone,
            address_line: form.address,
            city: form.city || null,
            is_default: savedAddresses.length === 0,
          }).unwrap()
        } catch {
          // Non-fatal — order still goes through even if save fails
        }
      }
    }

    try {
      const result = await checkout({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: shipping,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
      }).unwrap()

      clearCart()
      toast({ title: `${result.orders.length} order(s) placed successfully!` })
      router.push("/orders")
    } catch (err: unknown) {
      const data = (err as { data?: { message?: string; code?: string; items?: Array<{ product_id: string; name: string; requested: number; available: number }> } })?.data
      if (data?.code === "INSUFFICIENT_STOCK" && Array.isArray(data.items)) {
        dispatch(applyStockSync(data.items.map((i) => ({ product_id: i.product_id, available: i.available }))))
        const removed = data.items.filter((i) => i.available === 0).map((i) => `"${i.name}"`).join(", ")
        const capped  = data.items.filter((i) => i.available > 0)
          .map((i) => `"${i.name}" (now ${i.available})`).join(", ")
        const parts = []
        if (capped)  parts.push(`Updated: ${capped}`)
        if (removed) parts.push(`Out of stock — removed: ${removed}`)
        toast({
          title: "Stock changed — cart updated",
          description: parts.join(" · ") || "We've adjusted your cart to match what's available. Try again.",
          variant: "destructive",
        })
        return
      }
      const msg = data?.message ?? "Checkout failed"
      toast({ title: msg, variant: "destructive" })
    }
  }

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-20">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Left — Shipping + Payment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                {savedAddresses.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Choose a saved address or add a new one.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved address picker */}
                {savedAddresses.length > 0 && (
                  <>
                    <RadioGroup
                      value={mode === "saved" ? (selectedAddressId ?? "") : "__new__"}
                      onValueChange={(v) => {
                        if (v === "__new__") {
                          setMode("new")
                        } else {
                          setMode("saved")
                          setSelectedAddressId(v)
                        }
                      }}
                      className="space-y-2"
                    >
                      {savedAddresses.map((a) => (
                        <label
                          key={a.id}
                          htmlFor={`addr-${a.id}`}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            mode === "saved" && selectedAddressId === a.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <RadioGroupItem value={a.id} id={`addr-${a.id}`} className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {a.label || a.recipient_name}
                              </p>
                              {a.is_default && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {a.recipient_name} · {a.phone}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.address_line}{a.city ? `, ${a.city}` : ""}
                            </p>
                          </div>
                        </label>
                      ))}

                      <label
                        htmlFor="addr-new"
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                          mode === "new"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <RadioGroupItem value="__new__" id="addr-new" />
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span className="font-medium text-sm">Use a different address</span>
                        </div>
                      </label>
                    </RadioGroup>
                  </>
                )}

                {/* New address form */}
                {mode === "new" && (
                  <div className={`grid grid-cols-2 gap-4 ${savedAddresses.length > 0 ? "pt-4 border-t" : ""}`}>
                    {savedAddresses.length > 0 && (
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="label">Label (optional)</Label>
                        <Input
                          id="label"
                          placeholder="e.g. Home, Office"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name">Full name *</Label>
                      <Input id="name" value={form.name} onChange={handleChange("name")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" value={form.phone} onChange={handleChange("phone")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={handleChange("email")} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" value={form.address} onChange={handleChange("address")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={handleChange("city")} />
                    </div>

                    <div className="col-span-2 flex items-center gap-2 pt-2">
                      <Checkbox
                        id="save-address"
                        checked={saveAddress}
                        onCheckedChange={(v) => setSaveAddress(Boolean(v))}
                      />
                      <Label htmlFor="save-address" className="text-sm cursor-pointer">
                        Save this address for next time
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cash_on_delivery" | "card")}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="w-5 h-5" />
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-5 h-5" />
                      Credit / Debit Card
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right — Order Summary */}
          <div>
            <Card className="lg:sticky lg:top-28">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.storeName} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold font-mono truncate">{appliedCoupon.code}</p>
                        <p className="text-xs text-muted-foreground truncate">Applied to {appliedCoupon.storeName}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-destructive p-1" aria-label="Remove code">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Discount code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon() } }}
                      className="font-mono uppercase"
                    />
                    <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponInput.trim()} className="bg-transparent flex-shrink-0">
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && appliedCoupon.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>−${appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${Math.max(0, subtotal - (appliedCoupon?.discount ?? 0)).toFixed(2)}</span>
                </div>

                {mode === "saved" && selectedAddress && (
                  <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs">
                    <p className="font-semibold flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3" />
                      Shipping to
                    </p>
                    <p className="text-muted-foreground">{selectedAddress.recipient_name}</p>
                    <p className="text-muted-foreground">{selectedAddress.address_line}{selectedAddress.city ? `, ${selectedAddress.city}` : ""}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full gap-2" disabled={isCheckingOut}>
                  {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                  {isCheckingOut ? "Placing order…" : "Place Order"}
                </Button>

                <Link href="/profile" className="block text-center text-xs text-muted-foreground hover:text-foreground">
                  Manage saved addresses →
                </Link>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
