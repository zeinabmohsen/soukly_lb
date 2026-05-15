"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Search, SlidersHorizontal, X, Loader2, Package, Star,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useGetProductsQuery, type Product } from "@/store/api/productApi"
import { useGetCategoriesQuery } from "@/store/api/categoriesApi"
import { useCart } from "@/hooks/useCart"
import CartSidebar from "@/components/cart-sidebar"
import CheckoutModal from "@/components/checkout-modal"

const PAGE_SIZE = 24
const ALL_SLUG = ""

export default function ProductsPage() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const { isCartOpen, setIsCartOpen, totalItems } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const { data: categoriesData } = useGetCategoriesQuery()
  const categories = categoriesData?.data ?? []

  const initialCategorySlug = searchParams.get("category") ?? ALL_SLUG
  const initialSearch       = searchParams.get("q") ?? ""

  const [searchInput, setSearchInput]                 = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch]         = useState(initialSearch)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialCategorySlug)
  const [sortBy, setSortBy]                           = useState<"popular" | "newest" | "price_asc" | "price_desc" | "rating">("popular")
  const [ratingFilter, setRatingFilter]               = useState([0])
  const [inStockOnly, setInStockOnly]                 = useState(false)
  const [showFilters, setShowFilters]                 = useState(false)
  const [offset, setOffset]                           = useState(0)

  // Sync URL → filter state when ?category=, ?q= change
  useEffect(() => {
    setSelectedCategorySlug(searchParams.get("category") ?? ALL_SLUG)
  }, [searchParams])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset offset on filter changes
  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, selectedCategorySlug])

  const queryParams = useMemo(
    () => ({
      search:   debouncedSearch || undefined,
      category: selectedCategorySlug || undefined,
      limit:    PAGE_SIZE,
      offset,
    }),
    [debouncedSearch, selectedCategorySlug, offset],
  )

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams)
  const apiProducts: Product[] = data?.data ?? []
  const hasMore = data?.has_more ?? false
  const handleLoadMore = () => setOffset((o) => o + PAGE_SIZE)

  // Client-side filters layered on top
  const filteredProducts = useMemo(() => {
    let products = apiProducts.filter((p) => {
      if (p.rating < ratingFilter[0]) return false
      if (inStockOnly && p.stock <= 0) return false
      return true
    })

    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "newest":     return 0  // already DESC from server
        case "price_asc":  return a.price - b.price
        case "price_desc": return b.price - a.price
        case "rating":     return b.rating - a.rating
        case "popular":
        default:           return b.sales_count - a.sales_count
      }
    })
  }, [apiProducts, ratingFilter, inStockOnly, sortBy])

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategorySlug) return "All"
    return categories.find((c) => c.slug === selectedCategorySlug)?.name ?? selectedCategorySlug
  }, [categories, selectedCategorySlug])

  // Update URL when category changes (so the link is shareable/refreshable)
  const updateCategorySlug = (slug: string) => {
    setSelectedCategorySlug(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set("category", slug)
    else params.delete("category")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const clearFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    updateCategorySlug(ALL_SLUG)
    setRatingFilter([0])
    setInStockOnly(false)
    setSortBy("popular")
  }

  const activeFiltersCount =
    (selectedCategorySlug ? 1 : 0) +
    (ratingFilter[0] > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-3 block">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => updateCategorySlug(ALL_SLUG)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
              !selectedCategorySlug ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const active = selectedCategorySlug === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => updateCategorySlug(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm line-clamp-1 ${
                  active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">
          Minimum Rating: {ratingFilter[0].toFixed(1)} ⭐
        </label>
        <Slider value={ratingFilter} onValueChange={setRatingFilter} max={5} step={0.5} className="mt-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span>5</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="in-stock"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 accent-primary"
        />
        <label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">
          In stock only
        </label>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={totalItems} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 pt-24 md:pt-32 pb-10 md:pb-14 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Browse Products</h1>
            <p className="text-base md:text-lg text-muted-foreground mb-5 md:mb-7">
              {isLoading
                ? "Loading products..."
                : `${data?.total ?? filteredProducts.length}+ products from Lebanese stores`}
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 py-4 md:py-6 text-base md:text-lg rounded-xl border-2 focus:border-primary"
              />
              {isFetching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
            {/* Filters sidebar (desktop) */}
            <div className="hidden lg:block">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                <FilterContent />
              </Card>
            </div>

            <div>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="lg:hidden relative bg-transparent"
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 px-1.5 py-0 text-xs h-5 min-w-5">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                  <p className="text-sm md:text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
                    {debouncedSearch && <> for <span className="font-semibold text-foreground">"{debouncedSearch}"</span></>}
                  </p>
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[180px] md:w-[200px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter chips */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategorySlug && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategoryName}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => updateCategorySlug(ALL_SLUG)} />
                    </Badge>
                  )}
                  {ratingFilter[0] > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {ratingFilter[0].toFixed(1)}⭐+
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setRatingFilter([0])} />
                    </Badge>
                  )}
                  {inStockOnly && (
                    <Badge variant="secondary" className="gap-1">
                      In stock only
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                    </Badge>
                  )}
                </div>
              )}

              {/* Products grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-3 md:p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-5 w-1/3 mt-3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description="Try adjusting your filters or search."
                  action={{ label: "Clear All Filters", onClick: clearFilters }}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => {
                    const image = product.images?.[0]?.url
                    const discount = product.compare_at_price && product.compare_at_price > product.price
                      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                      : null
                    return (
                      <Link key={product.id} href={`/product/${product.id}`} className="block h-full">
                        <Card className="group h-full flex flex-col overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="relative h-40 md:h-48 shrink-0 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-primary/30" />
                              </div>
                            )}
                            {discount !== null && (
                              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
                                -{discount}%
                              </Badge>
                            )}
                            {product.stock <= 0 && (
                              <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground text-xs">
                                Out of stock
                              </Badge>
                            )}
                          </div>

                          <div className="p-3 md:p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                              {product.name}
                            </h3>

                            {product.store && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {product.store.name}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-2 min-h-[1.25rem]">
                              {product.rating > 0 ? (
                                <>
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({product.review_count})</span>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">No reviews yet</span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-2 mt-auto pt-3">
                              <span className="text-base md:text-lg font-bold">${product.price.toFixed(2)}</span>
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${product.compare_at_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}

              {hasMore && filteredProducts.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent gap-2"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                  >
                    {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFetching ? "Loading…" : `Load more (${(data?.total ?? 0) - apiProducts.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-background z-50 lg:hidden overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <FilterContent />
              <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-background">
                <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">Clear All</Button>
                <Button onClick={() => setShowFilters(false)} className="flex-1">
                  Show {filteredProducts.length} Results
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </main>
  )
}
