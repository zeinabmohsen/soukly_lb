import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import VerifyEmailClient from "./verify-email-client"

export const dynamic = "force-dynamic"

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  )
}
