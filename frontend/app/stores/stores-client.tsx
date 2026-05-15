"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function StoresRedirectClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const qs = searchParams.toString()
    router.replace(qs ? `/marketplace?${qs}#stores` : "/marketplace#stores")
  }, [router, searchParams])

  return null
}
