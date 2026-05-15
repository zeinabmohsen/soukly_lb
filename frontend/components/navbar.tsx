"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu, X, Sparkles, ShoppingCart, LogOut, Store, LayoutDashboard, Package,
  ChevronDown, BarChart3, User as UserIcon, Heart, ListOrdered, Shield, Clock,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdvancedSearch } from "@/components/advanced-search"

export default function Navbar({ onCartClick, cartCount }: { onCartClick?: () => void; cartCount?: number }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logoutAsync, isAuthenticated, isSeller, isAdmin } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Marketing/browse nav links. "Become a Seller" moved into the primary CTA
  // below — it adapts to the user's auth + role state.
  const navItems = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Products", href: "/products" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/#how-it-works" },
  ]

  // Adaptive primary CTA — the single most important next action for this user.
  type Cta = {
    label: string
    href: string
    icon: LucideIcon
    variant: "primary" | "outline"
    pulse?: boolean
  }
  const primaryCta = useMemo<Cta>(() => {
    if (!isAuthenticated) {
      return { label: "Start Selling", href: "/become-seller", icon: Sparkles, variant: "primary" }
    }
    if (isAdmin) {
      return { label: "Admin", href: "/admin/dashboard", icon: Shield, variant: "primary" }
    }
    if (isSeller) {
      return { label: "Seller Dashboard", href: "/seller/dashboard", icon: LayoutDashboard, variant: "primary" }
    }
    if (user?.is_seller && user?.seller_status === "pending") {
      return { label: "Application Pending", href: "/seller/subscription", icon: Clock, variant: "outline", pulse: true }
    }
    // Authenticated buyer (or rejected seller — they can re-apply)
    return { label: "Become a Seller", href: "/become-seller", icon: Store, variant: "primary" }
  }, [isAuthenticated, isSeller, isAdmin, user])

  const PrimaryCtaButton = ({ fullWidth = false }: { fullWidth?: boolean }) => {
    const Icon = primaryCta.icon
    const isOutline = primaryCta.variant === "outline"
    return (
      <Link href={primaryCta.href} className={fullWidth ? "block w-full" : undefined}>
        <Button
          variant={isOutline ? "outline" : "default"}
          className={`gap-2 group ${isOutline ? "bg-transparent" : ""} ${fullWidth ? "w-full" : ""}`}
        >
          {primaryCta.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
          )}
          <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
          {primaryCta.label}
        </Button>
      </Link>
    )
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Soukly
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <AdvancedSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {onCartClick && (
              <Button variant="ghost" size="icon" onClick={onCartClick} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            {isAuthenticated && <PrimaryCtaButton />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-primary/8 transition-all group border border-transparent hover:border-border/60 outline-none">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                      {(user?.name ?? "U")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                        {user?.name}
                      </span>
                      {isSeller && (
                        <span className="text-[10px] text-primary/70 font-medium">Seller</span>
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  {/* Profile header */}
                  <div className="px-2 py-2.5 mb-1 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user?.name ?? "U")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      {isSeller && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                          Seller
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isSeller && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard" className="cursor-pointer gap-2">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          <span>Seller Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/products" className="cursor-pointer gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>My Products</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/analytics" className="cursor-pointer gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/store-builder" className="cursor-pointer gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>Store Builder</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer gap-2">
                      <ListOrdered className="h-4 w-4 text-muted-foreground" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logoutAsync}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/8"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <PrimaryCtaButton />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {onCartClick && (
              <Button variant="ghost" size="icon" onClick={onCartClick} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <div className="py-4 space-y-4">
              <div className="px-4 mb-4">
                <AdvancedSearch />
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-4 space-y-3 border-t border-border">
                {isAuthenticated ? (
                  <>
                    {/* Primary CTA at the top so it's the first thing they see */}
                    <div onClick={() => setIsMobileMenuOpen(false)} className="mb-3">
                      <PrimaryCtaButton fullWidth />
                    </div>

                    {/* Mobile user info */}
                    <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-muted/40 border border-border/50 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(user?.name ?? "U")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Badge variant="destructive" className="text-[10px] px-1.5">
                          Admin
                        </Badge>
                      )}
                      {isSeller && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 bg-primary/10 text-primary border-primary/20">
                          Seller
                        </Badge>
                      )}
                    </div>
                    {isAdmin && (
                      <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                          <Shield className="h-4 w-4 text-primary" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    {isSeller && (
                      <>
                        <Link href="/seller/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                            <LayoutDashboard className="h-4 w-4 text-primary" />
                            Seller Dashboard
                          </Button>
                        </Link>
                        <Link href="/seller/products" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                            <Package className="h-4 w-4" />
                            My Products
                          </Button>
                        </Link>
                        <Link href="/seller/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                        <ListOrdered className="h-4 w-4" />
                        My Orders
                      </Button>
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                        <UserIcon className="h-4 w-4" />
                        Account Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={() => {
                        logoutAsync()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                      <PrimaryCtaButton fullWidth />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
