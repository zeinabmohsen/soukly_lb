import { redirect } from "next/navigation"

// Inventory was removed — stock is managed inline on each product (Products page).
// This redirect keeps old bookmarks alive.
export default function LegacyInventoryPage() {
  redirect("/seller/products")
}
