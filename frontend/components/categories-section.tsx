"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useGetCategoriesQuery, type GlobalCategory } from "@/store/api/categoriesApi"

function CategoryTile({
  category,
  onClick,
  isActive,
}: {
  category: GlobalCategory
  onClick?: (slug: string) => void
  isActive?: boolean
}) {
  const inner = (
    <Card
      className={`group relative h-full overflow-hidden cursor-pointer p-5 md:p-6 bg-card border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isActive
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/60 hover:border-primary/40"
      }`}
    >
      <div className="flex flex-col items-start gap-4 h-full">
        <div className="w-full">
          <h3 className="font-semibold text-base md:text-lg text-foreground leading-tight line-clamp-2">
            {category.name}
          </h3>
        </div>

        <div className="w-full mt-auto">
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Explore</span>
            <ArrowRight
              className={`w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-0.5 ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`}
            />
          </div>
        </div>
      </div>
    </Card>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(category.slug)}
        aria-label={`Browse ${category.name}`}
        aria-pressed={isActive}
        className="text-left w-full h-full"
      >
        {inner}
      </button>
    )
  }

  return (
    <Link href={`/stores?category=${category.slug}`} aria-label={`Browse ${category.name}`} className="h-full">
      {inner}
    </Link>
  )
}

function TileSkeleton() {
  return (
    <Card className="h-full p-5 md:p-6 bg-card border border-border/60">
      <div className="flex flex-col items-start gap-4 animate-pulse">
        <div className="w-full space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted/60" />
        </div>
        <div className="w-full pt-2 border-t border-border/40">
          <div className="h-3 w-12 rounded bg-muted/60" />
        </div>
      </div>
    </Card>
  )
}

interface CategoriesSectionProps {
  onCategoryClick?: (slug: string) => void
  activeSlug?: string
}

export default function CategoriesSection({ onCategoryClick, activeSlug }: CategoriesSectionProps = {}) {
  const { data, isLoading, isError } = useGetCategoriesQuery()
  const categories = data?.data ?? []

  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/60">
      <div className="container mx-auto px-4">
        {activeSlug ? (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => onCategoryClick?.("")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filter
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        ) : null}

        {isError && !isLoading && categories.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Couldn't load categories right now. Please try again later.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} />)
              : categories.map((category) => (
                  <CategoryTile
                    key={category.id}
                    category={category}
                    onClick={onCategoryClick}
                    isActive={activeSlug === category.slug}
                  />
                ))}
          </div>
        )}
      </div>
    </section>
  )
}
