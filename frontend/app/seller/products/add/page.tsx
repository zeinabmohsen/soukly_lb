"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import SellerProductForm, { type SubmitPayload } from "@/components/seller-product-form"
import { useCreateProductMutation } from "@/store/api/productApi"
import { useToast } from "@/hooks/use-toast"

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createProduct, { isLoading }] = useCreateProductMutation()

  const handleSubmit = async (payload: SubmitPayload) => {
    await createProduct(payload as never).unwrap()
    toast({ title: "Product created!", description: `"${payload.name}" has been added.` })
    router.push("/seller/products")
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/seller/products" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground">Add</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Add a new product</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Fill in the basics and add images. Colours and customisations are optional.
        </p>
      </div>

      <SellerProductForm
        submitLabel="Create product"
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        onCancel={() => router.push("/seller/products")}
      />
    </div>
  )
}
