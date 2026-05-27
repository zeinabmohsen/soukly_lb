"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu, X, Sparkles, ShoppingCart, LogOut, Store, LayoutDashboard, Package,
  ChevronDown, ChevronRight, BarChart3, User as UserIcon, Heart, ListOrdered, Shield, Clock,
  TrendingUp, ArrowRight,
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { AdvancedSearch } from "@/components/advanced-search"

type MenuRow = {
  href: string
  label: string
  icon: LucideIcon
  iconClass?: string
  badge?: string
}

function MobileMenuSection({
  title,
  rows,
  onNavigate,
}: {
  title: string
  rows: MenuRow[]
  onNavigate: () => void
}) {
  if (rows.length === 0) return null
  return (
    <div>
      <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/50">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <Link
              key={row.href}
              href={row.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/60 hover:bg-muted/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                <Icon className={`h-4 w-4 ${row.iconClass ?? "text-foreground/70"}`} />
              </div>
              <span className="flex-1 text-[15px] font-medium text-foreground">{row.label}</span>
              {row.badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {row.badge}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function QuickActionTile({
  href,
  label,
  icon: Icon,
  badgeCount,
  onNavigate,
}: {
  href: string
  label: string
  icon: LucideIcon
  badgeCount?: number
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="relative flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.97] transition-all"
    >
      <div className="relative">
        <Icon className="h-5 w-5 text-primary" />
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>
      <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
    </Link>
  )
}

function MobileAuthedMenu({
  user,
  isAdmin,
  isSeller,
  primaryCta,
  cartCount,
  onNavigate,
  onSignOut,
}: {
  user: ReturnType<typeof useAuth>["user"]
  isAdmin: boolean
  isSeller: boolean
  primaryCta: React.ReactNode | null
  cartCount?: number
  onNavigate: () => void
  onSignOut: () => void
}) {
  const initials = (user?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const manageRows: MenuRow[] = []
  if (isAdmin) {
    manageRows.push({ href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield, iconClass: "text-primary" })
  }
  if (isSeller) {
    manageRows.push(
      { href: "/seller/products", label: "My Products", icon: Package },
      { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/seller/store-builder", label: "Store Builder", icon: Store },
    )
  }

  const browseRows: MenuRow[] = [
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/products", label: "All Products", icon: Package },
    { href: "/pricing", label: "Pricing", icon: Sparkles },
  ]

  const accountRows: MenuRow[] = [
    { href: "/profile", label: "Account Settings", icon: UserIcon },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky top: search + close button on the same row */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 pt-3 pb-3 border-b border-border/40 bg-background">
        <div className="flex-1 min-w-0">
          <AdvancedSearch />
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Everything below scrolls together — hero, quick actions, sections */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* Hero user card */}
        <div className="relative px-5 pt-5 pb-5 bg-gradient-to-br from-primary/15 via-accent/8 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                {initials}
              </div>
              {(isAdmin || isSeller) && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                  {isAdmin ? (
                    <Shield className="h-3 w-3 text-destructive" />
                  ) : (
                    <Store className="h-3 w-3 text-primary" />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isAdmin && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Admin</Badge>
                )}
                {isSeller && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                    Seller
                  </Badge>
                )}
                {!isAdmin && !isSeller && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Buyer</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick action tiles */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <QuickActionTile href="/orders"   label="Orders"   icon={ListOrdered} onNavigate={onNavigate} />
            <QuickActionTile href="/wishlist" label="Wishlist" icon={Heart}       onNavigate={onNavigate} />
            <QuickActionTile href="/cart"     label="Cart"     icon={ShoppingCart} badgeCount={cartCount} onNavigate={onNavigate} />
          </div>
        </div>

        <div className="px-4 py-5 space-y-5">
          {primaryCta && <div onClick={onNavigate}>{primaryCta}</div>}

          <MobileMenuSection title="Manage" rows={manageRows} onNavigate={onNavigate} />
          <MobileMenuSection title="Browse" rows={browseRows} onNavigate={onNavigate} />
          <MobileMenuSection title="Account" rows={accountRows} onNavigate={onNavigate} />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border/60 bg-background/95 backdrop-blur">
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-destructive/8 text-destructive text-sm font-semibold active:bg-destructive/15 hover:bg-destructive/12 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

const TRENDING_TAGS = ["Silk Scarves", "Pottery", "Olive Oil", "Fashion", "Electronics"]

function MobileGuestMenu({
  onNavigate,
}: {
  onNavigate: () => void
}) {
  const browseRows: MenuRow[] = [
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/products", label: "All Products", icon: Package },
    { href: "/pricing", label: "Pricing", icon: Sparkles },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky top: search + close */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 pt-3 pb-3 border-b border-border/40 bg-background">
        <div className="flex-1 min-w-0">
          <AdvancedSearch />
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 py-5 space-y-6">
          {/* 1. Trending */}
          <div>
            <p className="px-2 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Trending Now
            </p>
            <div className="flex flex-wrap gap-2 px-2">
              {TRENDING_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/products?search=${encodeURIComponent(tag)}`}
                  onClick={onNavigate}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-medium bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 active:scale-95 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Welcome — centered, breathable hero */}
          <div className="text-center pt-2 pb-1">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/15 to-transparent ring-1 ring-primary/15 mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Soukly
              </span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
              Lebanon&apos;s marketplace for handpicked goods.
            </p>
          </div>

          {/* 3. Sign in — primary gradient with chevron */}
          <Link href="/login" onClick={onNavigate} className="block">
            <Button className="w-full h-12 px-4 text-[15px] font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <UserIcon className="h-4 w-4" />
              <span className="flex-1 text-center">Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3 -my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* 4. Start Selling — invitational card with Free badge */}
          <Link href="/become-seller" onClick={onNavigate} className="block group">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02] active:scale-[0.99] transition-all p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-transparent ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[15px] font-semibold text-foreground leading-tight">Start Selling</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Open your store and reach buyers across Lebanon
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </div>
          </Link>

          {/* 5. Browse */}
          <MobileMenuSection title="Browse" rows={browseRows} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}

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
            {isAuthenticated && !isSeller && <PrimaryCtaButton />}
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

        {/* Mobile slide-in drawer */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="right" className="p-0 w-full sm:max-w-sm [&>button.absolute]:hidden">
            <VisuallyHidden>
              <SheetTitle>Menu</SheetTitle>
            </VisuallyHidden>
            {isAuthenticated ? (
              <MobileAuthedMenu
                user={user}
                isAdmin={isAdmin}
                isSeller={isSeller}
                primaryCta={isSeller ? null : <PrimaryCtaButton fullWidth />}
                cartCount={cartCount}
                onNavigate={() => setIsMobileMenuOpen(false)}
                onSignOut={() => {
                  logoutAsync()
                  setIsMobileMenuOpen(false)
                }}
              />
            ) : (
              <MobileGuestMenu
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
