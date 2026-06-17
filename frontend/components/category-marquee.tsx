"use client"

import Link from "next/link"
import { useGetCategoriesQuery } from "@/store/api/categoriesApi"
import { categoryIcon } from "@/lib/category-icons"

// Categories intentionally hidden from the marquee.
const HIDDEN_SLUGS = ["handmade", "beauty"]

// Fallback so the marquee still feels alive before the API resolves (or if it
// fails). Mirrors the seeded global categories.
const FALLBACK = [
  { slug: "fashion", name: "Fashion & Apparel" },
  { slug: "food", name: "Food & Beverages" },
  { slug: "jewelry", name: "Jewelry & Accessories" },
  { slug: "home", name: "Home & Living" },
  { slug: "art", name: "Art & Collectibles" },
  { slug: "electronics", name: "Electronics & Tech" },
  { slug: "books", name: "Books & Stationery" },
  { slug: "sports", name: "Sports & Fitness" },
]

export default function CategoryMarquee() {
  const { data } = useGetCategoriesQuery()
  const categories = (data?.data?.length ? data.data : FALLBACK)
    .filter((c) => !HIDDEN_SLUGS.includes(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
    }))

  // Duplicate the list so the -50% translate loops seamlessly.
  const track = [...categories, ...categories]

  return (
    <section className="relative py-8 border-y border-border bg-muted/20 overflow-hidden">
      {/* Edge fades so pills dissolve into the page rather than hard-clipping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <div className="marquee-pause">
        <div className="flex w-max animate-marquee gap-4">
          {track.map((cat, i) => {
            const Icon = categoryIcon(cat.slug)
            return (
              <Link
                key={`${cat.slug}-${i}`}
                href={`/marketplace?category=${cat.slug}`}
                className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-card px-5 py-2.5 shadow-sm transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
