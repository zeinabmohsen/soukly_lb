"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { AdminShell } from "@/components/admin/admin-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAdmin, isHydrating } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    // Wait for hydration to settle before deciding — otherwise a freshly
    // reloaded admin gets bounced to /login while /auth/me is still in flight.
    if (mounted && !isHydrating && !isAdmin) router.push("/login")
  }, [mounted, isHydrating, isAdmin, router])

  // Don't flash the admin shell to a non-admin (or before we know).
  if (!mounted || !isAdmin) return null

  return <AdminShell>{children}</AdminShell>
}
