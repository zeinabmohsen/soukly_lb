"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { InlineAuth } from "@/components/inline-auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Only honor relative paths to avoid open-redirect to external URLs
  const redirectParam = searchParams.get("redirect")
  const safeRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
    ? redirectParam
    : null

  return (
    <>
    <Navbar />
    <AuthLayout
      title="Welcome to Soukly"
      description="Sign in or create an account to continue."
    >
      <InlineAuth
        defaultMode="login"
        bare
        onSuccess={({ user }) => {
          if (user.is_admin) {
            router.push("/admin/dashboard")
          } else if (user.is_seller && user.seller_status === "approved") {
            router.push("/seller/dashboard")
          } else if (safeRedirect) {
            router.push(safeRedirect)
          } else {
            router.push("/marketplace")
          }
        }}
      />
    </AuthLayout>
    </>
  )
}
