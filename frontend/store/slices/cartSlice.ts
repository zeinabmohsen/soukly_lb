import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface CartItem {
  id: string
  // Stable per-line key — same product but different colour/customization is a
  // separate line. For plain products, line_id === id.
  line_id: string
  name: string
  price: number
  image: string
  quantity: number
  storeId: string
  storeName: string
  stock?: number
  selected_color?: { name: string; hex: string }
  customization_values?: Record<string, string>
}

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
}

const STORAGE_KEY = "soukly_cart"

function capToStock(quantity: number, stock?: number): number {
  if (typeof stock === "number" && stock >= 0) return Math.min(quantity, stock)
  return quantity
}

// Two cart items with the same product id but different colour or customization
// values must live on separate lines. line_id captures that.
function buildLineId(input: Pick<CartItem, "id" | "selected_color" | "customization_values">): string {
  const parts = [input.id]
  if (input.selected_color?.name) parts.push(`c:${input.selected_color.name}`)
  if (input.customization_values && Object.keys(input.customization_values).length > 0) {
    parts.push(`x:${JSON.stringify(input.customization_values)}`)
  }
  return parts.join("|")
}

// Hydrate cart items from localStorage so the buyer's cart survives a reload
// or coming back later. isCartOpen is session-only and intentionally excluded.
function loadStoredItems(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.items)) return parsed.items as CartItem[]
  } catch {}
  return []
}

function persistItems(items: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
  } catch {
    // localStorage may be full or disabled — cart still works in-memory
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: ((): CartState => ({ items: loadStoredItems(), isCartOpen: false })) as () => CartState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, "quantity" | "line_id"> & { line_id?: string }>) {
      const line_id = action.payload.line_id ?? buildLineId(action.payload)
      const existing = state.items.find((item) => item.line_id === line_id)
      if (existing) {
        existing.quantity = capToStock(existing.quantity + 1, action.payload.stock ?? existing.stock)
        if (action.payload.stock !== undefined) existing.stock = action.payload.stock
      } else {
        state.items.push({ ...action.payload, line_id, quantity: capToStock(1, action.payload.stock) })
      }
      persistItems(state.items)
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.line_id !== action.payload)
      persistItems(state.items)
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.line_id !== action.payload.id)
      } else {
        const item = state.items.find((i) => i.line_id === action.payload.id)
        if (item) item.quantity = capToStock(action.payload.quantity, item.stock)
      }
      persistItems(state.items)
    },
    clearCart(state) {
      state.items = []
      persistItems(state.items)
    },
    setIsCartOpen(state, action: PayloadAction<boolean>) {
      state.isCartOpen = action.payload
    },
    // Reconcile cart with fresh server-side stock — used after the checkout API
    // reports INSUFFICIENT_STOCK so the user's cart matches what's actually
    // available, without them having to manually re-edit each line.
    applyStockSync(state, action: PayloadAction<Array<{ product_id: string; available: number }>>) {
      for (const update of action.payload) {
        for (const item of state.items) {
          if (item.id === update.product_id) {
            item.stock = update.available
            item.quantity = capToStock(item.quantity, update.available)
          }
        }
      }
      state.items = state.items.filter((i) => i.quantity > 0)
      persistItems(state.items)
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, setIsCartOpen, applyStockSync } = cartSlice.actions
export default cartSlice.reducer
