"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import {
  Store, Package, BarChart3, ShoppingBag, Boxes, Tag, Home,
  Settings, HelpCircle, Sparkles, LogOut, Star, ChevronRight, LayoutList,
  CreditCard, X,
} from "lucide-react"

const navItems = [
  { icon: Home,        label: "Overview",      href: "/seller/dashboard"     },
  { icon: Package,     label: "Products",      href: "/seller/products"      },
  { icon: ShoppingBag, label: "Orders",        href: "/seller/orders"        },
  { icon: BarChart3,   label: "Analytics",     href: "/seller/analytics"     },
  { icon: Boxes,       label: "Inventory",     href: "/seller/inventory"     },
  { icon: Tag,         label: "Promotions",    href: "/seller/promotions"    },
  { icon: Store,       label: "Store Builder", href: "/seller/store-builder" },
  { icon: LayoutList,  label: "Categories",    href: "/seller/categories"    },
  { icon: CreditCard,  label: "Subscription",  href: "/seller/subscription"  },
]

interface SellerSidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function SellerSidebar({ open = false, onClose }: SellerSidebarProps = {}) {
  const pathname = usePathname()
  const { user, logoutAsync } = useAuth()

  const initials = (user?.name ?? "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function isActive(href: string) {
    if (href === "/seller/dashboard") return pathname === "/seller/dashboard"
    return pathname.startsWith(href)
  }

  // Close drawer on navigation
  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

    <aside
      className={`w-64 fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-border transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Mobile-only close button (top-right) */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground z-10"
        aria-label="Close menu"
      >
        <X className="w-4 h-4" />
      </button>


      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Soukly
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Seller
          </span>
        </Link>
      </div>

      {/* Store card */}
      <div className="mx-3 mt-4 mb-2 rounded-2xl p-3 bg-primary/5 border border-primary/15">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-semibold truncate">
              {user?.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span className="text-muted-foreground text-[11px]">Active store</span>
            </div>
          </div>
          <div className="flex gap-0.5 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-2.5 h-2.5 ${s <= 4 ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-muted-foreground/60 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary/10 text-primary border-l-[3px] border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
              style={active ? { paddingLeft: "calc(0.75rem - 3px)" } : {}}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "group-hover:text-foreground"}`} />
              {item.label}
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-primary/50" />}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-border space-y-0.5">
          <p className="text-muted-foreground/60 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            Support
          </p>
          {[
            { icon: Settings,   label: "Settings"   },
            { icon: HelpCircle, label: "Help Center" },
          ].map(({ icon: Icon, label }) => (
            <Link
              key={label}
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all group"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-medium truncate">{user?.name}</p>
            <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={logoutAsync}
            title="Sign out"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10 flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
