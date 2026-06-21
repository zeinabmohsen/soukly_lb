"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import SellerSidebar from "@/components/seller-sidebar"
import { Menu, Sparkles } from "lucide-react"

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isSeller, isHydrating } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Desktop collapsed rail — persisted so the choice sticks across visits.
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem("seller-sidebar-collapsed") === "1") setCollapsed(true)
    } catch { /* localStorage unavailable — fall back to expanded */ }
  }, [])

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c
      try { localStorage.setItem("seller-sidebar-collapsed", next ? "1" : "0") } catch {}
      return next
    })

  useEffect(() => {
    // Don't redirect while /auth/me is still verifying the stored user —
    // otherwise a reloaded seller is kicked to /login before hydration settles.
    if (mounted && !isHydrating && (!isAuthenticated || !isSeller)) {
      router.push("/login")
    }
  }, [mounted, isHydrating, isAuthenticated, isSeller, router])

  // Close the drawer on route changes (lock body scroll while open)
  useEffect(() => {
    if (typeof document === "undefined") return
    document.body.style.overflow = sidebarOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  if (!mounted || !isAuthenticated || !isSeller) return null

  return (
    <div className="min-h-screen flex font-sans bg-gradient-to-b from-background to-muted/30">
      <SellerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Mobile-only topbar with hamburger */}
        <div className="lg:hidden sticky top-0 z-20 h-14 flex items-center justify-between gap-3 px-4 bg-background/95 backdrop-blur-lg border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted/50 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Soukly
            </span>
          </Link>
          <div className="w-9" aria-hidden />
        </div>

        {children}
      </div>
    </div>
  )
}
