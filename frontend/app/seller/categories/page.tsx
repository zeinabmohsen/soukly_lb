import { redirect } from "next/navigation"

// Categories management moved into a tab on /seller/products.
// Kept this route as a redirect so old bookmarks don't 404.
export default function LegacyCategoriesPage() {
  redirect("/seller/products?tab=categories")
}
