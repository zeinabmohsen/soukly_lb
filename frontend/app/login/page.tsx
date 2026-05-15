import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import LoginClient from "./login-client"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
