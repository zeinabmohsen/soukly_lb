"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"

export default function CheckoutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { items } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isOpen) return null

  const handleGoToCheckout = () => {
    onClose()
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
    } else {
      router.push("/checkout")
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-2xl shadow-2xl z-50 p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Ready to checkout?</h2>
        <p className="text-muted-foreground mb-6">
          You have {items.length} {items.length === 1 ? "item" : "items"} in your cart.
        </p>
        <Button size="lg" className="w-full" onClick={handleGoToCheckout}>
          Go to Checkout
        </Button>
      </div>
    </>
  )
}
