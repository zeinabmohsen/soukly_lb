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
    storeId?: string
    storeName?: string
  }
  showAddToCart?: boolean
  className?: string
  variant?: ProductCardVariant
  borderRadius?: "sharp" | "rounded" | "pill"
  accentColor?: string
}

export function ProductCard({ product, showAddToCart = true, className, variant = "standard", borderRadius, accentColor }: ProductCardProps) {
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
    "rounded-xl"

  // Compact: dense, smaller image, tight padding
  if (variant === "compact") {
    return (
      <Card className={cn("group overflow-hidden hover:shadow-md transition-all duration-300 border", radiusClass, className)}>
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {product.inStock === false && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
              </div>
            )}
            <button
              onClick={handleToggleWishlist}
              disabled={isMutating}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition-all"
            >
              {isMutating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={cn("w-4 h-4", inWishlist && "fill-red-500 text-red-500")} />
              )}
            </button>
          </div>
        </Link>
        <div className="p-2.5 space-y-1">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold" style={accentColor ? { color: accentColor } : undefined}>
              ${product.price}
            </span>
            {product.rating && <StarRating rating={product.rating} size="sm" />}
          </div>
        </div>
      </Card>
    )
  }

  // Cinematic: full-bleed image, generous spacing, hover overlay
  if (variant === "cinematic") {
    return (
      <Card className={cn("group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-transparent", radiusClass, className)}>
        <Link href={`/product/${product.id}`} className="block">
          <div className={cn("relative aspect-[4/5] overflow-hidden bg-muted", radiusClass)}>
            <img
              src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
            {product.inStock === false && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
            <button
              onClick={handleToggleWishlist}
              disabled={isMutating}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
            >
              {isMutating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={cn("w-5 h-5", inWishlist && "fill-red-500 text-red-500")} />
              )}
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="font-bold text-lg leading-tight mb-1.5 line-clamp-2 drop-shadow">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold drop-shadow">${product.price}</span>
                {product.rating && <StarRating rating={product.rating} size="sm" />}
              </div>
            </div>
          </div>
        </Link>
        {showAddToCart && (
          <div className="pt-3">
            <Button
              className="w-full gap-2"
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
    <Card className={cn("group overflow-hidden hover:shadow-xl transition-all duration-300", radiusClass, className)}>
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          {product.inStock === false && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          <button
            onClick={handleToggleWishlist}
            disabled={isMutating}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            {isMutating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={cn("w-5 h-5", inWishlist && "fill-red-500 text-red-500")} />
            )}
          </button>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold" style={accentColor ? { color: accentColor } : { color: "var(--primary)" }}>
            ${product.price}
          </span>
          {product.rating && <StarRating rating={product.rating} size="sm" showValue />}
        </div>
        {showAddToCart && (
          <Button
            className="w-full gap-2"
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
    </Card>
  )
}
