"use client"

import { useAppSelector } from "./useAppSelector"
import { useAppDispatch } from "./useAppDispatch"
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setIsCartOpen,
  type CartItem,
} from "@/store/slices/cartSlice"

export function useCart() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return {
    items,
    isCartOpen,
    totalItems,
    totalPrice,
    addItem: (item: Omit<CartItem, "quantity" | "line_id"> & { line_id?: string }) => dispatch(addItem(item)),
    removeItem: (id: string) => dispatch(removeItem(id)),
    updateQuantity: (id: string, quantity: number) => dispatch(updateQuantity({ id, quantity })),
    clearCart: () => dispatch(clearCart()),
    setIsCartOpen: (open: boolean) => dispatch(setIsCartOpen(open)),
  }
}
