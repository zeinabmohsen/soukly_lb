"use client"

import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Loading skeleton for the public store pages — shaped like the real storefront
// (← Soukly pill, brand row, hero block, products grid). Renders before we know
// the seller's brand colors / template, so it stays neutral.
export function StoreLoadingShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav skeleton */}
      <nav className="border-b bg-background sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-muted text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to Soukly marketplace"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Soukly</span>
            </Link>
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        </div>
      </nav>

      {/* Hero skeleton */}
      <div className="container mx-auto px-4 py-12 md:py-16 space-y-4 max-w-3xl">
        <Skeleton className="h-10 sm:h-14 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-11 w-32 rounded-full mt-2" />
      </div>

      {/* Products skeleton */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Friendly "store not found" shell — gives buyers two ways out (Stores list, Marketplace home).
export function StoreNotFoundShell({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-background">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Soukly</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-2">
          <ShoppingBag className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">Store Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          {message ?? "This store doesn't exist or is no longer available."}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Link href="/stores"><Button>Browse Stores</Button></Link>
          <Link href="/"><Button variant="outline">Back to Marketplace</Button></Link>
        </div>
      </div>
    </div>
  )
}
