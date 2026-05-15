"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function StoresRedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const qs = searchParams.toString()
    router.replace(qs ? `/marketplace?${qs}#stores` : "/marketplace#stores")
  }, [router, searchParams])

  return null
}

export default function StoresRedirect() {
  return (
    <Suspense fallback={null}>
      <StoresRedirectInner />
    </Suspense>
  )
}
