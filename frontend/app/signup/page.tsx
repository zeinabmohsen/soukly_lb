import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SignupClient from "./signup-client"

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  )
}
