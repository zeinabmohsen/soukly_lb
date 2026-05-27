import { redirect } from "next/navigation"

// Promotions was removed — no backend API existed for it, the page was a mock.
// This redirect keeps old bookmarks alive.
export default function LegacyPromotionsPage() {
  redirect("/seller/dashboard")
}
