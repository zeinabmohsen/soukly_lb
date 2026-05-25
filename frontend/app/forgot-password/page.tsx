import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import ForgotPasswordClient from "./forgot-password-client"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  )
}
