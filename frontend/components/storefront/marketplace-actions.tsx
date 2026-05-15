"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ShoppingBag, ArrowLeft, Sparkles, X } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { AdvancedSearch } from "@/components/advanced-search"
import CartSidebar from "@/components/cart-sidebar"
import { cn } from "@/lib/utils"
import type { StorefrontView } from "./storefront-view"

// Floating bottom-right dock that gives buyers access to marketplace functions
// (search · cart · back to Soukly) on a store page where the Soukly navbar
// has been replaced by the seller's own nav.

export function MarketplaceFloatingActions({ view }: { view: StorefrontView }) {
  const router = useRouter()
  const { isCartOpen, setIsCartOpen, totalItems } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search on outside click / escape
  useEffect(() => {
    if (!searchOpen) return
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [searchOpen])

  const sideClass = view.rtl ? "left-4 sm:left-6" : "right-4 sm:right-6"

  return (
    <>
      {/* Search popover */}
      {searchOpen && (
        <div
          className={cn("fixed bottom-24 z-50 w-[min(92vw,440px)]", sideClass)}
          ref={searchRef}
        >
          <div className="bg-background rounded-2xl shadow-2xl border p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Search Soukly
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AdvancedSearch />
          </div>
        </div>
      )}

      {/* Floating dock */}
      <div className={cn("fixed bottom-4 sm:bottom-6 z-40 flex items-center gap-2", sideClass)}>
        {/* Expanded buttons */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300",
            expanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none",
          )}
        >
          <button
            onClick={() => {
              setSearchOpen((s) => !s)
              setExpanded(false)
            }}
            className="w-11 h-11 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsCartOpen(true)
              setExpanded(false)
            }}
            className="relative w-11 h-11 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: view.primaryColor }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          <Link href="/" aria-label="Back to Soukly">
            <span className="w-11 h-11 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Trigger pill */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "h-11 px-4 rounded-full bg-foreground text-background shadow-lg flex items-center gap-2 hover:opacity-90 transition-all",
            expanded && "rotate-0",
          )}
          aria-label={expanded ? "Hide marketplace actions" : "Show marketplace actions"}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            {expanded ? "Close" : "Soukly"}
          </span>
          {!expanded && totalItems > 0 && (
            <span
              className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: view.primaryColor }}
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Cart sidebar (controlled) */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          router.push("/checkout")
        }}
      />
    </>
  )
}
