"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Loader2 } from "lucide-react"
import { StarRating } from "./star-rating"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import {
  useGetMyWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from "@/store/api/wishlistApi"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type ProductCardVariant = "compact" | "standard" | "cinematic"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    rating?: number
    inStock?: boolean
    stock?: number
    storeId?: string
    storeName?: string
    colors?: { name: string; hex: string }[]
    customizable?: boolean
  }
  showAddToCart?: boolean
  showRating?: boolean
  className?: string
  variant?: ProductCardVariant
  borderRadius?: "sharp" | "rounded" | "pill"
  accentColor?: string
}

function CustomizableBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30">
      ✦ Customizable
    </span>
  )
}

function ColorSwatchRow({ colors, max = 5 }: { colors: { name: string; hex: string }[]; max?: number }) {
  if (!colors?.length) return null
  const shown = colors.slice(0, max)
  const remaining = colors.length - shown.length
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((c) => (
        <span
          key={c.name}
          title={c.name}
          aria-label={c.name}
          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/15 shadow-sm"
          style={{ backgroundColor: c.hex }}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[11px] text-muted-foreground font-medium ml-0.5">+{remaining}</span>
      )}
    </div>
  )
}

export function ProductCard({ product, showAddToCart = true, showRating = true, className, variant = "standard", borderRadius, accentColor }: ProductCardProps) {
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [imageError, setImageError] = useState(false)

  const { data: wishlistData } = useGetMyWishlistQuery(undefined, { skip: !isAuthenticated })
  const [addToWishlist, { isLoading: isAdding }] = useAddProductToWishlistMutation()
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveProductFromWishlistMutation()

  const inWishlist = wishlistData?.data?.some((entry) => entry.product_id === product.id) ?? false
  const isMutating = isAdding || isRemoving

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? "/placeholder.svg",
      storeId: product.storeId ?? "",
      storeName: product.storeName ?? "",
      stock: product.stock,
    })
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` })
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
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

  const radiusClass =
    borderRadius === "sharp" ? "rounded-none" :
    borderRadius === "pill"  ? "rounded-3xl"  :
    "rounded-2xl"

  const innerRadiusClass =
    borderRadius === "sharp" ? "rounded-none" :
    borderRadius === "pill"  ? "rounded-2xl"  :
    "rounded-xl"

  const formattedPrice = Number.isInteger(product.price)
    ? `$${product.price}`
    : `$${product.price.toFixed(2)}`

  // Compact: dense, smaller image, tight padding
  if (variant === "compact") {
    return (
      <Card className={cn(
        "group relative overflow-hidden border border-border/60 bg-card",
        "shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-border",
        "transition-all duration-300 ease-out",
        "h-full flex flex-col",
        radiusClass,
        className,
      )}>
        <Link href={`/product/${product.id}`} className="block">
          <div className={cn("relative aspect-square overflow-hidden bg-muted/50 m-1.5", innerRadiusClass)}>
            <img
              src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transform group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            />
            {product.inStock === false && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">Out of Stock</Badge>
              </div>
            )}
            {product.customizable && product.inStock !== false && (
              <div className="absolute top-2 left-2"><CustomizableBadge /></div>
            )}
            <button
              onClick={handleToggleWishlist}
              disabled={isMutating}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md hover:bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5 transition-all hover:scale-105 active:scale-95"
            >
              {isMutating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Heart className={cn("w-3.5 h-3.5 transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-neutral-700")} />
              )}
            </button>
          </div>
        </Link>
        <div className="px-3 pt-1 pb-3 flex-1 flex flex-col gap-1.5">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-sm leading-snug tracking-tight line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="min-h-[14px]">
            {product.colors && product.colors.length > 0 && (
              <ColorSwatchRow colors={product.colors} max={4} />
            )}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span
              className="text-base font-bold tabular-nums tracking-tight"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {formattedPrice}
            </span>
            {showRating && product.rating && <StarRating rating={product.rating} size="sm" />}
          </div>
        </div>
      </Card>
    )
  }

  // Cinematic: full-bleed image, generous spacing, hover overlay
  if (variant === "cinematic") {
    return (
      <Card className={cn(
        "group overflow-hidden border-0 bg-transparent shadow-none",
        "transition-all duration-500 ease-out",
        "h-full flex flex-col",
        radiusClass,
        className,
      )}>
        <Link href={`/product/${product.id}`} className="block">
          <div className={cn(
            "relative aspect-[4/5] overflow-hidden bg-muted ring-1 ring-black/5",
            "shadow-md group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 ease-out",
            radiusClass,
          )}>
            <img
              src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transform group-hover:scale-[1.08] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {product.inStock === false && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="secondary" className="uppercase tracking-wider text-xs font-semibold">Out of Stock</Badge>
              </div>
            )}
            {product.customizable && product.inStock !== false && (
              <div className="absolute top-4 left-4"><CustomizableBadge /></div>
            )}
            <button
              onClick={handleToggleWishlist}
              disabled={isMutating}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md hover:bg-white flex items-center justify-center shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 active:scale-95"
            >
              {isMutating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={cn("w-4 h-4 transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-neutral-800")} />
              )}
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              {showRating && product.rating && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-xs font-semibold tabular-nums">{product.rating.toFixed(1)}</span>
                </div>
              )}
              <h3 className="font-bold text-lg leading-tight tracking-tight mb-1.5 line-clamp-2 [text-shadow:_0_1px_8px_rgb(0_0_0_/_40%)]">
                {product.name}
              </h3>
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight [text-shadow:_0_1px_8px_rgb(0_0_0_/_40%)]">
                  {formattedPrice}
                </span>
                {product.colors && product.colors.length > 0 && (
                  <ColorSwatchRow colors={product.colors} max={4} />
                )}
              </div>
            </div>
          </div>
        </Link>
        {showAddToCart && (
          <div className="pt-3">
            <Button
              className="w-full gap-2 font-semibold"
              disabled={product.inStock === false}
              onClick={handleAddToCart}
              size="sm"
              style={accentColor ? { backgroundColor: accentColor } : undefined}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.inStock === false ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        )}
      </Card>
    )
  }

  // Standard (default)
  return (
    <Card className={cn(
      "group relative overflow-hidden border border-border/60 bg-card",
      "shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-border",
      "transition-all duration-300 ease-out",
      "h-full flex flex-col",
      radiusClass,
      className,
    )}>
      <Link href={`/product/${product.id}`} className="block">
        <div className={cn("relative aspect-square overflow-hidden bg-muted/50 m-2", innerRadiusClass)}>
          <img
            src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transform group-hover:scale-[1.08] transition-transform duration-500 ease-out"
          />
          {product.inStock === false && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
              <Badge variant="secondary" className="uppercase tracking-wider text-xs font-semibold">Out of Stock</Badge>
            </div>
          )}
          {product.customizable && product.inStock !== false && (
            <div className="absolute top-3 left-3"><CustomizableBadge /></div>
          )}
          <button
            onClick={handleToggleWishlist}
            disabled={isMutating}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md hover:bg-white",
              "flex items-center justify-center shadow-md ring-1 ring-black/5",
              "transition-all duration-200 hover:scale-105 active:scale-95",
              inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              "disabled:opacity-50",
            )}
          >
            {isMutating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={cn("w-4 h-4 transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-neutral-700")} />
            )}
          </button>
        </div>
      </Link>

      <div className="px-4 pt-1 pb-4 flex-1 flex flex-col gap-2.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-base leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer min-h-[2.6rem]">
            {product.name}
          </h3>
        </Link>
        <div className="min-h-[16px]">
          {product.colors && product.colors.length > 0 && (
            <ColorSwatchRow colors={product.colors} max={5} />
          )}
        </div>
        <div className="mt-auto space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <span
              className="text-2xl font-bold tabular-nums tracking-tight leading-none"
              style={accentColor ? { color: accentColor } : { color: "var(--primary)" }}
            >
              {formattedPrice}
            </span>
            {showRating && product.rating && <StarRating rating={product.rating} size="sm" showValue />}
          </div>
          {showAddToCart && (
            <Button
              className="w-full gap-2 font-semibold"
              disabled={product.inStock === false}
              onClick={handleAddToCart}
              size="sm"
              style={accentColor ? { backgroundColor: accentColor } : undefined}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.inStock === false ? "Out of Stock" : "Add to Cart"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
