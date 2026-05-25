"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { Search, TrendingUp, StoreIcon, SlidersHorizontal, X, Star, MapPin, Loader2 } from "lucide-react"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import MarketplaceHero from "@/components/marketplace-hero"
import CartSidebar from "@/components/cart-sidebar"
import CheckoutModal from "@/components/checkout-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useGetStoresQuery, type Store } from "@/store/api/storeApi"
import { useGetCategoriesQuery } from "@/store/api/categoriesApi"
import { useCart } from "@/hooks/useCart"

const ALL_SLUG = ""
const PAGE_SIZE = 20
const locations = ["All Locations", "Beirut", "Tripoli", "Sidon", "Byblos", "Jounieh", "Zahle", "Baalbek"]

export default function MarketplacePage() {
  const { isCartOpen, setIsCartOpen, totalItems } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const { data: categoriesData } = useGetCategoriesQuery()
  const categories = categoriesData?.data ?? []

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(ALL_SLUG)
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("popular")
  const [ratingFilter, setRatingFilter] = useState([0])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [offset, setOffset] = useState(0)

  const storesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, selectedCategorySlug, selectedLocation, sortBy])

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: selectedCategorySlug || undefined,
      location: selectedLocation !== "All Locations" ? selectedLocation : undefined,
      sort: sortBy as "popular" | "rating" | "newest",
      limit: PAGE_SIZE,
      offset,
    }),
    [debouncedSearch, selectedCategorySlug, selectedLocation, sortBy, offset],
  )

  const { data, isLoading, isFetching } = useGetStoresQuery(queryParams)
  const apiStores: Store[] = data?.data ?? []
  const hasMore = data?.has_more ?? false

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategorySlug) return "All"
    return categories.find((c) => c.slug === selectedCategorySlug)?.name ?? selectedCategorySlug
  }, [categories, selectedCategorySlug])

  const filteredStores = useMemo(() => {
    return apiStores.filter((store) => {
      const matchesRating = store.rating >= ratingFilter[0]
      const matchesVerified = !verifiedOnly || store.is_approved
      return matchesRating && matchesVerified
    })
  }, [apiStores, ratingFilter, verifiedOnly])

  const scrollToStores = () => {
    storesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleHeroSubmit = () => {
    scrollToStores()
  }

  const handleLoadMore = () => setOffset((o) => o + PAGE_SIZE)

  const clearFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    setSelectedCategorySlug(ALL_SLUG)
    setSelectedLocation("All Locations")
    setRatingFilter([0])
    setVerifiedOnly(false)
  }

  const activeFiltersCount =
    (selectedCategorySlug ? 1 : 0) +
    (selectedLocation !== "All Locations" ? 1 : 0) +
    (ratingFilter[0] > 0 ? 1 : 0) +
    (verifiedOnly ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-3 block">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategorySlug(ALL_SLUG)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
              !selectedCategorySlug
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const active = selectedCategorySlug === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm line-clamp-1 ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Location</label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">
          Minimum Rating: {ratingFilter[0].toFixed(1)} ⭐
        </label>
        <Slider value={ratingFilter} onValueChange={setRatingFilter} max={5} step={0.1} className="mt-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span>5</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="verified-marketplace"
          checked={verifiedOnly}
          onChange={(e) => setVerifiedOnly(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 accent-primary"
        />
        <label htmlFor="verified-marketplace" className="text-sm font-medium cursor-pointer">
          Verified Stores Only
        </label>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={totalItems} />

      <MarketplaceHero value={searchInput} onChange={setSearchInput} onSubmit={handleHeroSubmit} />

      <section ref={storesRef} id="stores" className="py-12 md:py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">All Stores</h2>
            <p className="text-lg text-muted-foreground">
              {isLoading
                ? "Loading stores..."
                : `Browse ${data?.total ?? filteredStores.length}+ verified stores across Lebanon`}
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
            <div className="hidden lg:block space-y-6">
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
                    <span className="font-semibold text-foreground">{filteredStores.length}</span> stores
                    {debouncedSearch ? (
                      <>
                        {" "}
                        for <span className="font-semibold text-foreground">"{debouncedSearch}"</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] md:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategorySlug && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategoryName}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedCategorySlug(ALL_SLUG)}
                      />
                    </Badge>
                  )}
                  {selectedLocation !== "All Locations" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedLocation}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedLocation("All Locations")}
                      />
                    </Badge>
                  )}
                  {ratingFilter[0] > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {ratingFilter[0].toFixed(1)}⭐+
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setRatingFilter([0])} />
                    </Badge>
                  )}
                  {verifiedOnly && (
                    <Badge variant="secondary" className="gap-1">
                      Verified Only
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                    </Badge>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32 md:h-48 w-full" />
                      <div className="p-3 md:p-6 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-9 w-full mt-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredStores.length === 0 ? (
                <EmptyState
                  icon={StoreIcon}
                  title="No stores found"
                  description="Try adjusting your filters or search to see more results"
                  action={{ label: "Clear All Filters", onClick: clearFilters }}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredStores.map((store, index) => (
                    <Link key={store.id} href={`/store/${store.slug}`} className="block h-full">
                      <Card
                        className="group h-full flex flex-col overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative h-32 md:h-48 shrink-0 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                          {store.cover_url || store.logo_url ? (
                            <img
                              src={store.cover_url ?? store.logo_url ?? ""}
                              alt={store.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl md:text-5xl font-bold text-primary/40">
                                {store.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {store.is_approved && (
                            <div className="absolute top-2 md:top-4 left-2 md:left-4">
                              <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                                <TrendingUp className="w-3 h-3" />
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-3 md:p-6 flex-1 flex flex-col">
                          <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1 break-words">
                            {store.name}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-1 md:line-clamp-2 min-h-[1.1rem] md:min-h-[2.75rem] break-words">
                            {store.description ?? "Explore our curated collection"}
                          </p>

                          <div className="flex items-center gap-3 text-sm mb-2 md:mb-4 min-h-[1.25rem]">
                            {store.rating > 0 && (
                              <span className="flex items-center gap-1 text-amber-500 font-medium">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {store.rating.toFixed(1)}
                              </span>
                            )}
                            {store.location && (
                              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                <MapPin className="w-3 h-3" />
                                {store.location}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 md:pt-4 border-t mt-auto">
                            <span className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                              {store.category?.name ?? ""}
                            </span>
                            <Button
                              size="sm"
                              className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs md:text-sm px-3 py-1"
                            >
                              Visit
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {hasMore && filteredStores.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent gap-2"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                  >
                    {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFetching ? "Loading…" : `Load more (${(data?.total ?? 0) - apiStores.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

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
                <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                  Clear All
                </Button>
                <Button onClick={() => setShowFilters(false)} className="flex-1">
                  Show {filteredStores.length} Results
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
