"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Shield, LayoutDashboard, Store, Users, ShoppingBag, Receipt,
  LogOut, ChevronDown, User as UserIcon, Heart, ListOrdered, Menu, ExternalLink,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useGetAdminStoresQuery } from "@/store/api/storeApi"
import { initials } from "./admin-ui"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** match this prefix for active state (defaults to href) */
  match?: string
}

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Sellers",  href: "/admin/sellers",   icon: Store, match: "/admin/sellers" },
  { label: "Users",    href: "/admin/users",     icon: Users },
  { label: "Orders",   href: "/admin/orders",    icon: ShoppingBag },
  { label: "Billing",  href: "/admin/billing",   icon: Receipt },
]

// The seller detail page lives under /admin/stores/[id]; keep "Sellers" lit there.
const SELLERS_PREFIXES = ["/admin/sellers", "/admin/stores"]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: NavItem) => {
    if (item.href === "/admin/sellers") return SELLERS_PREFIXES.some((p) => pathname.startsWith(p))
    return pathname.startsWith(item.match ?? item.href)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-background">
        <SidebarBody isActive={isActive} />
      </aside>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarBody isActive={isActive} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        <TopBar onOpenMenu={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  )
}

function SidebarBody({
  isActive,
  onNavigate,
}: {
  isActive: (item: NavItem) => boolean
  onNavigate?: () => void
}) {
  const { isAdmin } = useAuth()
  const { data: storesData } = useGetAdminStoresQuery({ status: "pending", limit: 1 }, { skip: !isAdmin })
  const pendingCount = storesData?.total ?? 0

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-2 px-5 border-b">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold">Soukly Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          const showBadge = item.href === "/admin/sellers" && pendingCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 h-5 px-1.5 text-[11px]">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <Link href="/" onClick={onNavigate}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <ExternalLink className="w-4 h-4" /> View site
          </Button>
        </Link>
      </div>
    </div>
  )
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter()
  const { user, logoutAsync } = useAuth()

  const handleLogout = () => {
    logoutAsync()
    router.push("/login")
  }

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMenu}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="lg:hidden flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">Soukly Admin</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-primary/8 transition-all group border border-transparent hover:border-border/60 outline-none">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
              {initials(user?.name)}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium truncate max-w-[120px]">{user?.name}</span>
              <span className="text-[10px] text-primary/70 font-medium">Admin</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <div className="px-2 py-2.5 mb-1 rounded-lg bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex-shrink-0">Admin</Badge>
            </div>
          </div>
          <DropdownMenuItem asChild>
            <Link href="/orders" className="cursor-pointer gap-2">
              <ListOrdered className="h-4 w-4 text-muted-foreground" /><span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wishlist" className="cursor-pointer gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" /><span>Wishlist</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" /><span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/8"
          >
            <LogOut className="h-4 w-4" /><span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
