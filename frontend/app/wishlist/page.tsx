"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import {
  useGetMyWishlistQuery,
  useRemoveProductFromWishlistMutation,
  useGetFollowedStoresQuery,
  useUnfollowStoreMutation,
} from "@/store/api/wishlistApi"

const PAGE_SIZE = 12
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Heart, ShoppingCart, Trash2, Store, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [productOffset, setProductOffset] = useState(0)
  const [storeOffset, setStoreOffset]     = useState(0)

  const { data: wishlistData, isLoading: loadingWishlist, isFetching: fetchingWishlist } = useGetMyWishlistQuery(
    { limit: PAGE_SIZE, offset: productOffset },
    { skip: !isAuthenticated },
  )
  const { data: followsData, isLoading: loadingFollows, isFetching: fetchingFollows } = useGetFollowedStoresQuery(
    { limit: PAGE_SIZE, offset: storeOffset },
    { skip: !isAuthenticated },
  )
  const [removeProduct] = useRemoveProductFromWishlistMutation()
  const [unfollowStore] = useUnfollowStoreMutation()

  useEffect(() => {
    if (!isAuthenticated) router.push("/login")
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const items = wishlistData?.data ?? []
  const followedStores = followsData?.data ?? []
  const itemsHasMore  = wishlistData?.has_more ?? false
  const storesHasMore = followsData?.has_more ?? false

  const handleRemove = async (productId: string) => {
    try {
      await removeProduct(productId).unwrap()
    } catch {
      toast({ title: "Failed to remove from wishlist", variant: "destructive" })
    }
  }

  const handleUnfollow = async (storeId: string) => {
    try {
      await unfollowStore(storeId).unwrap()
    } catch {
      toast({ title: "Failed to unfollow store", variant: "destructive" })
    }
  }

  const handleAddToCart = (entry: typeof items[number]) => {
    const p = entry.product
    if (!p) return
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0]?.url ?? "/placeholder.svg",
      storeId: p.store_id,
      storeName: p.store?.name ?? "",
    })
    toast({ title: "Added to cart!", description: `${p.name} has been added to your cart.` })
  }

  const isLoading = loadingWishlist || loadingFollows

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <PageHeader title="My Wishlist" description="Save your favorite products and stores">
          <Heart className="w-10 h-10 text-primary fill-primary" />
        </PageHeader>

        {/* Wishlist Items */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Saved Products ({items.length})</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved products yet"
              description="Start adding products to your wishlist and they'll appear here"
              action={{ label: "Browse Marketplace", onClick: () => router.push("/marketplace") }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {items.map((entry) => {
                const p = entry.product
                if (!p) return null
                return (
                  <Card key={entry.id} className="group hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={p.images?.[0]?.url ?? "/placeholder.svg"}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={() => handleRemove(p.id)}
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                      <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{p.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{p.store?.name}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-lg md:text-xl font-bold text-primary">${p.price}</span>
                          <Badge variant="secondary" className="text-xs w-fit">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 gap-1 md:gap-2 text-xs md:text-sm"
                            size="sm"
                            onClick={() => handleAddToCart(entry)}
                            disabled={p.status === "out_of_stock"}
                          >
                            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Add to Cart</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent px-2 md:px-3"
                            onClick={() => handleRemove(p.id)}
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {itemsHasMore && items.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="bg-transparent gap-2"
                onClick={() => setProductOffset((o) => o + PAGE_SIZE)}
                disabled={fetchingWishlist}
              >
                {fetchingWishlist && <Loader2 className="w-4 h-4 animate-spin" />}
                {fetchingWishlist ? "Loading…" : `Load more (${(wishlistData?.total ?? 0) - items.length} remaining)`}
              </Button>
            </div>
          )}
        </section>

        {/* Followed Stores */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Followed Stores ({followedStores.length})</h2>
          {followedStores.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No followed stores yet"
              description="Follow stores to get updates on new products and special offers"
              action={{ label: "Browse Stores", onClick: () => router.push("/stores") }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {followedStores.map((entry) => {
                const s = entry.store
                if (!s) return null
                return (
                  <Card key={entry.id} className="group hover:shadow-xl transition-all">
                    <CardContent className="p-4 md:p-6 text-center">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-primary/10">
                        <img
                          src={s.logo_url ?? "/placeholder.svg"}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 line-clamp-1">{s.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                        Since {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/store/${s.slug}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full gap-1 md:gap-2 bg-transparent text-xs md:text-sm"
                            size="sm"
                          >
                            <Store className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Visit Store</span>
                            <span className="sm:hidden">Visit</span>
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent px-2 md:px-3"
                          onClick={() => handleUnfollow(entry.store_id)}
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {storesHasMore && followedStores.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="bg-transparent gap-2"
                onClick={() => setStoreOffset((o) => o + PAGE_SIZE)}
                disabled={fetchingFollows}
              >
                {fetchingFollows && <Loader2 className="w-4 h-4 animate-spin" />}
                {fetchingFollows ? "Loading…" : `Load more (${(followsData?.total ?? 0) - followedStores.length} remaining)`}
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
