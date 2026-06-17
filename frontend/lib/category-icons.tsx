import {
  Shirt, UtensilsCrossed, Scissors, Sparkles, Gem, Home, Palette, Laptop,
  BookOpen, Dumbbell, ShoppingBag, type LucideIcon,
} from "lucide-react"

// Maps a global-category slug to a clean lucide line icon, so the marketplace,
// hero, and marquee all share one consistent icon language (no mismatched emoji).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fashion: Shirt,
  food: UtensilsCrossed,
  handmade: Scissors,
  beauty: Sparkles,
  jewelry: Gem,
  home: Home,
  art: Palette,
  electronics: Laptop,
  books: BookOpen,
  sports: Dumbbell,
}

export function categoryIcon(slug: string | null | undefined): LucideIcon {
  if (!slug) return ShoppingBag
  return CATEGORY_ICONS[slug] ?? ShoppingBag
}
