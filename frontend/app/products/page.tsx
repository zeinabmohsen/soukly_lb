import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import ProductsClient from "./products-client"

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  )
}
