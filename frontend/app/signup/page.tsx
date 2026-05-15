"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { InlineAuth } from "@/components/inline-auth"

function SignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectParam = searchParams.get("redirect")
  const safeRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
    ? redirectParam
    : null

  return (
    <>
    <Navbar />
    <AuthLayout
      title="Join Soukly"
      description="Create your account in 30 seconds."
    >
      <InlineAuth
        defaultMode="signup"
        bare
        onSuccess={({ user }) => {
          // Toggle lets them switch to sign-in — handle both auth paths here
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  )
}
