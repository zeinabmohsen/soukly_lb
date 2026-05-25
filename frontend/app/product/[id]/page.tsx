"use client"

import { use, useState } from "react"
import { Star, ShoppingCart, Heart, Share2, Check, Package, ChevronLeft, ChevronRight, Minus, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ProductCard } from "@/components/shared/product-card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/api/productApi"
import { useGetProductReviewsQuery, useCreateReviewMutation } from "@/store/api/reviewApi"
import {
  useGetMyWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from "@/store/api/wishlistApi"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [copied, setCopied] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)

  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const { data: wishlistData } = useGetMyWishlistQuery(undefined, { skip: !isAuthenticated })
  const [addToWishlist, { isLoading: isAdding }] = useAddProductToWishlistMutation()
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveProductFromWishlistMutation()
  const isWishlistMutating = isAdding || isRemoving

  const { data: reviewsData } = useGetProductReviewsQuery(id)
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation()
  const reviews = reviewsData?.data ?? []

  const { data: relatedData } = useGetProductsQuery(
    product?.store_id ? { store_id: product.store_id } : undefined,
    { skip: !product?.store_id },
  )
  const relatedProducts = (relatedData?.data ?? []).filter((p) => p.id !== id).slice(0, 4)

  const inWishlist = product ? (wishlistData?.data?.some((e) => e.product_id === product.id) ?? false) : false
  const inStock = product ? product.status !== "out_of_stock" && product.stock > 0 : false
  const images = product?.images ?? []

  // If the selected colour has its own image_url, that takes over as the hero
  // image — the buyer sees the product in the colour they picked.
  const colorImage = product?.colors?.find((c) => c.name === selectedColor)?.image_url
  const mainImage = colorImage ?? images[selectedImage]?.url ?? "/placeholder.svg"

  // Required customizations must be filled before Add to Cart enables.
  const customizations = product?.customizations ?? []
  const missingRequired = customizations.some(
    (c) => c.required && !(customizationValues[c.label]?.trim()),
  )

  const handleAddToCart = () => {
    if (!product) return
    if (missingRequired) {
      toast({ title: "Please fill in required options", variant: "destructive" })
      return
    }
    const colorObj = product.colors?.find((c) => c.name === selectedColor)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id:        product.id,
        name:      product.name,
        price:     product.price,
        image:     colorObj?.image_url ?? images[0]?.url ?? "/placeholder.svg",
        storeId:   product.store_id,
        storeName: product.store?.name ?? "",
        stock:     product.stock,
        selected_color: colorObj ? { name: colorObj.name, hex: colorObj.hex } : undefined,
        customization_values: Object.keys(customizationValues).length > 0 ? customizationValues : undefined,
      })
    }
    toast({ title: "Added to cart", description: `${quantity}× ${product.name} added to your cart.` })
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id).unwrap()
        toast({ title: "Removed from wishlist", description: `${product.name} removed from wishlist` })
      } else {
        await addToWishlist(product.id).unwrap()
        toast({ title: "Added to wishlist", description: `${product.name} added to wishlist` })
      }
    } catch {
      toast({ title: "Wishlist action failed", variant: "destructive" })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Link copied!" })
  }

  const handleSubmitReview = async () => {
    if (!reviewRating) return toast({ title: "Please select a rating", variant: "destructive" })
    try {
      await createReview({ product_id: id, rating: reviewRating, comment: reviewComment || undefined }).unwrap()
      setReviewRating(0)
      setReviewComment("")
      toast({ title: "Review submitted!" })
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-20 h-20 rounded-lg" />)}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">This product doesn&apos;t exist or is no longer available.</p>
          <Link href="/marketplace"><Button>Back to Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-28">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span>/</span>
          {product.store && (
            <>
              <Link href={`/store/${product.store.slug}`} className="hover:text-foreground transition-colors">
                {product.store.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              {!inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">Out of Stock</Badge>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                      selectedImage === i ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
                    )}
                  >
                    <img src={img.url} alt={img.alt ?? product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-3">{product.category.name}</Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("w-4 h-4", s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">${product.price}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xl text-muted-foreground line-through">${product.compare_at_price}</span>
              )}
              {product.compare_at_price && product.compare_at_price > product.price && (
                <Badge variant="destructive" className="text-sm">
                  -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                </Badge>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {product.features?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Features</h3>
                <ul className="space-y-1">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><span className="font-medium">{f.label}</span>{f.value && `: ${f.value}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold">Color</h3>
                  <span className="text-sm text-muted-foreground">
                    {selectedColor ?? product.colors[0].name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const active = (selectedColor ?? product.colors[0].name) === c.name
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        aria-label={`Select colour ${c.name}`}
                        className={cn(
                          "relative w-9 h-9 rounded-full ring-1 ring-black/15 shadow-sm transition-all",
                          "hover:scale-110 active:scale-95",
                          active && "ring-2 ring-offset-2 ring-primary",
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {active && (
                          <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {customizations.length > 0 && (
              <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">Personalise this item</h3>
                </div>
                <div className="space-y-3">
                  {customizations.map((c) => {
                    const value = customizationValues[c.label] ?? ""
                    const setValue = (v: string) =>
                      setCustomizationValues((prev) => ({ ...prev, [c.label]: v }))
                    return (
                      <div key={c.label} className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-1">
                          {c.label}
                          {c.required && <span className="text-destructive">*</span>}
                          {c.help && <span className="text-xs text-muted-foreground font-normal">— {c.help}</span>}
                        </label>
                        {c.type === "text" ? (
                          <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={c.placeholder ?? "Enter your text"}
                            maxLength={c.max_length}
                          />
                        ) : (
                          <Select value={value} onValueChange={setValue}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {c.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-9 w-9 bg-transparent" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button size="icon" variant="outline" className="h-9 w-9 bg-transparent" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">({product.stock} in stock)</span>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2"
                  size="lg"
                  disabled={!inStock || missingRequired}
                  onClick={handleAddToCart}
                  title={missingRequired ? "Please fill in required options" : undefined}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={handleToggleWishlist}
                  disabled={isWishlistMutating}
                >
                  <Heart className={cn("w-5 h-5", inWishlist && "fill-red-500 text-red-500")} />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent" onClick={handleShare}>
                  {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {product.store && (
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-sm text-muted-foreground mb-1">Sold by</p>
                <Link href={`/store/${product.store.slug}`} className="font-semibold hover:text-primary transition-colors">
                  {product.store.name}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <Separator className="mb-12" />
            <h2 className="text-2xl font-bold mb-6">More from this store</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id:           p.id,
                    name:         p.name,
                    price:        p.price,
                    image:        p.images?.[0]?.url,
                    rating:       p.rating,
                    inStock:      p.status !== "out_of_stock" && p.stock > 0,
                    storeId:      p.store_id,
                    storeName:    product.store?.name ?? "",
                    colors:       p.colors,
                    customizable: (p.customizations?.length ?? 0) > 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16">
          <Separator className="mb-12" />
          <h2 className="text-2xl font-bold mb-8">Customer Reviews ({reviews.length})</h2>

          {/* Write a review */}
          {isAuthenticated && (
            <div className="mb-10 p-6 rounded-xl border bg-muted/30">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        s <= (hoverRating || reviewRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience with this product (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <Button onClick={handleSubmitReview} disabled={submittingReview || !reviewRating} className="gap-2">
                <Send className="w-4 h-4" />
                {submittingReview ? "Submitting…" : "Submit Review"}
              </Button>
            </div>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 pb-6 border-b last:border-0">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={review.user?.avatar_url ?? undefined} />
                    <AvatarFallback>{review.user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{review.user?.name ?? "Anonymous"}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-4 h-4",
                            s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
