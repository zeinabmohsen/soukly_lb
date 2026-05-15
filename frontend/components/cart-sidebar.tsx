"use client"

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"

export default function CartSidebar({
  isOpen,
  onClose,
  onCheckout,
}: {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <p className="text-sm text-muted-foreground">{items.length} items</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Add some products to get started!</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl border-2 hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.storeName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${item.price}</span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Shipping:</span>
                <span>Calculated at checkout</span>
              </div>
              <Button size="lg" className="w-full text-lg py-6" onClick={onCheckout}>
                Proceed to Checkout • ${totalPrice.toFixed(2)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
