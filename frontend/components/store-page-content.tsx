"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Star, MapPin, Share2, Heart, Check, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import {
  useGetFollowedStoresQuery,
  useFollowStoreMutation,
  useUnfollowStoreMutation,
} from "@/store/api/wishlistApi"
import { useGetStoreCategoriesQuery } from "@/store/api/storeApi"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/useCart"
import { ProductCard } from "@/components/shared/product-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  StorefrontHero,
  StorefrontFooter,
  StorefrontAnnouncementBar,
  StorefrontAbout,
  StorefrontNav,
  StorefrontTrustBadges,
  GoogleFontsLoader,
  storeToView,
  themeTokens,
  fontFamily,
} from "@/components/storefront/storefront-view"
import { MarketplaceFloatingActions } from "@/components/storefront/marketplace-actions"
import type { Store } from "@/store/api/storeApi"
import type { Product } from "@/store/api/productApi"

const ALL_CATEGORY = ""

interface StorePageContentProps {
  store: Store
  products: Product[]
  productsLoading?: boolean
}

export default function StorePageContent({ store, products, productsLoading }: StorePageContentProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { setIsCartOpen, totalItems } = useCart()
  const [copied, setCopied] = useState(false)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(ALL_CATEGORY)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: followsData } = useGetFollowedStoresQuery(undefined, { skip: !isAuthenticated })
  const [followStore, { isLoading: isFollowing }] = useFollowStoreMutation()
  const [unfollowStore, { isLoading: isUnfollowing }] = useUnfollowStoreMutation()
  const following = followsData?.data?.some((entry) => entry.store_id === store.id) ?? false
  const isFollowMutating = isFollowing || isUnfollowing

  const { data: storeCategories } = useGetStoreCategoriesQuery(store.id)
  const categories = useMemo(
    () => (storeCategories ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
    [storeCategories],
  )

  const visibleProducts = useMemo(() => {
    let filtered = products
    if (selectedCategorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === selectedCategorySlug)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
      )
    }
    return filtered
  }, [products, selectedCategorySlug, searchQuery])

  const view = storeToView(store)
  const tokens = themeTokens(view.theme)

  // Body font applies to the entire storefront wrapper. Heading font is applied per-component.
  const rootStyle: React.CSSProperties = {
    fontFamily: view.fonts.bodyFont !== "system" ? fontFamily(view.fonts.bodyFont) : undefined,
  }

  const productsBgStyle = view.bgColors.products ? { backgroundColor: view.bgColors.products } : undefined
  const headingStyle: React.CSSProperties | undefined =
    view.fonts.headingFont !== "system" ? { fontFamily: fontFamily(view.fonts.headingFont) } : undefined

  const handleShare = () => {
    const url = `${window.location.origin}/store/${store.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Link copied!", description: "Store link has been copied to clipboard." })
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    try {
      if (following) {
        await unfollowStore(store.id).unwrap()
        toast({ title: "Unfollowed", description: `You unfollowed ${store.name}` })
      } else {
        await followStore(store.id).unwrap()
        toast({ title: "Following", description: `You're now following ${store.name}` })
      }
    } catch {
      toast({ title: "Follow action failed", variant: "destructive" })
    }
  }

  return (
    <div id="top" className="min-h-screen bg-background flex flex-col" style={rootStyle}>
      {/* Inject Google Fonts CSS link (React 19 hoists <link> into <head>) */}
      <GoogleFontsLoader view={view} />

      {/* Seller's promo / announcement bar */}
      <StorefrontAnnouncementBar view={view} />

      {/* Seller's own nav (replaces Soukly Navbar) */}
      <StorefrontNav
        view={view}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={totalItems}
      />

      {/* Templated, fully customized hero */}
      <StorefrontHero view={view} />

      {/* Buyer-side info strip (rating / location / share / follow) */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {store.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{store.rating.toFixed(1)}</span>
              </span>
            )}
            {store.location && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {store.location}
              </span>
            )}
            {store.is_approved && (
              <Badge variant="secondary" className="gap-1">
                <Check className="w-3 h-3" />
                Verified
              </Badge>
            )}
            {store.category && <Badge variant="outline">{store.category.name}</Badge>}

            <div className="ms-auto flex gap-2">
              <Button size="icon" variant="outline" className="rounded-full bg-transparent h-9 w-9" onClick={handleShare}>
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className={cn("rounded-full h-9 w-9", following && "bg-primary text-primary-foreground")}
                onClick={handleFollow}
                disabled={isFollowMutating}
              >
                {isFollowMutating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={cn("w-4 h-4", following && "fill-current")} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* About section */}
      <StorefrontAbout view={view} />

      {/* Products */}
      <div
        id="products"
        className={cn("scroll-mt-20 flex-1", !productsBgStyle && "bg-background")}
        style={productsBgStyle}
      >
        <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={headingStyle}>Products</h2>
              <p className="text-muted-foreground">
                {productsLoading
                  ? "Loading products..."
                  : `${visibleProducts.length} product${visibleProducts.length !== 1 ? "s" : ""}${
                      searchQuery.trim()
                        ? ` matching "${searchQuery.trim()}"`
                        : selectedCategorySlug
                          ? ` in ${categories.find((c) => c.slug === selectedCategorySlug)?.name ?? selectedCategorySlug}`
                          : " available"
                    }`}
              </p>
            </div>

            {/* Product search — filters this store's products by name/description */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${store.name}…`}
                className="pl-9 pr-9 h-10 rounded-full bg-background"
                aria-label="Search products in this store"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mb-8 -mx-4 px-4 overflow-x-auto">
              <div className="inline-flex gap-2 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug(ALL_CATEGORY)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    !selectedCategorySlug
                      ? "border-transparent text-white"
                      : "bg-background hover:bg-muted",
                  )}
                  style={!selectedCategorySlug ? { backgroundColor: view.primaryColor } : undefined}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition-colors",
                      selectedCategorySlug === cat.slug
                        ? "border-transparent text-white"
                        : "bg-background hover:bg-muted",
                    )}
                    style={selectedCategorySlug === cat.slug ? { backgroundColor: view.primaryColor } : undefined}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {productsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : visibleProducts.length === 0 ? (
            <EmptyState
              icon={searchQuery.trim() ? Search : Package}
              title={
                searchQuery.trim()
                  ? `No products match "${searchQuery.trim()}"`
                  : selectedCategorySlug
                    ? "No products in this category"
                    : "No products yet"
              }
              description={
                searchQuery.trim()
                  ? "Try a different search term, or clear the search to see all products."
                  : selectedCategorySlug
                    ? "Try a different category."
                    : "This store hasn't added any products yet. Check back soon!"
              }
              action={
                searchQuery.trim()
                  ? { label: "Clear search", onClick: () => setSearchQuery("") }
                  : selectedCategorySlug
                    ? { label: "Show all products", onClick: () => setSelectedCategorySlug(ALL_CATEGORY) }
                    : undefined
              }
            />
          ) : (
            <div
              className={cn(
                "grid gap-4 md:gap-6",
                view.theme.productCardStyle === "compact"
                  ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
                  : view.theme.productCardStyle === "cinematic"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
              )}
            >
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  variant={view.theme.productCardStyle}
                  borderRadius={view.theme.borderRadius}
                  accentColor={view.primaryColor}
                  showRating={view.theme.showProductRating}
                  product={{
                    id:        product.id,
                    name:      product.name,
                    price:     product.price,
                    image:     product.images?.[0]?.url,
                    rating:    product.rating,
                    inStock:   product.status !== "out_of_stock" && product.stock > 0,
                    storeId:   product.store_id,
                    storeName: store.name,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trust badges (between products and footer) */}
      <StorefrontTrustBadges view={view} />

      {/* Store-branded footer */}
      <StorefrontFooter view={view} />

      {/* Floating Soukly dock — gives buyers search + cart + back to marketplace */}
      <MarketplaceFloatingActions view={view} />
    </div>
  )
}
