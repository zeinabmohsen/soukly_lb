import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  storeId: string
  storeName: string
}

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], isCartOpen: false } as CartState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload.id)
        return
      }
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) item.quantity = action.payload.quantity
    },
    clearCart(state) {
      state.items = []
    },
    setIsCartOpen(state, action: PayloadAction<boolean>) {
      state.isCartOpen = action.payload
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, setIsCartOpen } = cartSlice.actions
export default cartSlice.reducer
