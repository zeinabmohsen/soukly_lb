"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Loader2, Trash2 } from "lucide-react"
import SellerProductForm, {
  valuesFromProduct,
  type SubmitPayload,
} from "@/components/seller-product-form"
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/store/api/productApi"
import { useToast } from "@/hooks/use-toast"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const { data: product, isLoading: isFetching } = useGetProductByIdQuery(id)
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const initialValues = useMemo(() => (product ? valuesFromProduct(product) : undefined), [product])

  const handleSubmit = async (payload: SubmitPayload) => {
    await updateProduct({ id, ...payload } as never).unwrap()
    toast({ title: "Product updated", description: `"${payload.name}" has been saved.` })
    router.push("/seller/products")
  }

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    try {
      await deleteProduct(id).unwrap()
      toast({ title: "Product deleted" })
      router.push("/seller/products")
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  if (isFetching) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href="/seller/products"><Button variant="outline" className="mt-4 bg-transparent">Back to products</Button></Link>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/seller/products" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[300px]">{product.name}</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Changes go live as soon as you save.</p>
        </div>
        <Button variant="outline" className="text-destructive bg-transparent gap-2" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </Button>
      </div>

      <SellerProductForm
        initialValues={initialValues}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        onCancel={() => router.push("/seller/products")}
        rightSidebarExtra={
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">Deleting a product is permanent and cannot be undone.</p>
              <Button variant="destructive" className="w-full gap-2" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Product
              </Button>
            </CardContent>
          </Card>
        }
      />
    </div>
  )
}
