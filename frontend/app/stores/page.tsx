import { Suspense } from "react"
import StoresRedirectClient from "./stores-client"

export default function StoresRedirect() {
  return (
    <Suspense fallback={null}>
      <StoresRedirectClient />
    </Suspense>
  )
}
