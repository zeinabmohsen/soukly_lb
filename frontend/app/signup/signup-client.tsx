"use client"

import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { InlineAuth } from "@/components/inline-auth"

export default function SignupClient() {
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
          let dest = "/marketplace"
          if (user.is_admin) dest = "/admin/dashboard"
          else if (user.is_seller && user.seller_status === "approved") dest = "/seller/dashboard"
          else if (safeRedirect) dest = safeRedirect
          window.location.assign(dest)
        }}
      />
    </AuthLayout>
    </>
  )
}
