"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { InlineAuth } from "@/components/inline-auth"

export default function SignupPage() {
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
