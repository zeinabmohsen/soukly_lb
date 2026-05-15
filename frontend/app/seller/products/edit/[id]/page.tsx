"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Save, Loader2, Trash2, AlertCircle, ImageIcon, Upload } from "lucide-react"
import Link from "next/link"
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
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
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name:             "",
    description:      "",
    price:            "",
    compare_at_price: "",
    stock:            "",
    status:           "active",
    imageUrl:         "",
  })

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name:             product.name,
        description:      product.description ?? "",
        price:            String(product.price),
        compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
        stock:            String(product.stock),
        status:           product.status === "out_of_stock" ? "active" : product.status,
        imageUrl:         product.images?.[0]?.url ?? "",
      })
    }
  }, [product])

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    try {
      const result = await uploadImage(fd).unwrap()
      update("imageUrl", result.url)
      toast({ title: "Image uploaded" })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Upload failed"
      toast({ title: msg, variant: "destructive" })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await updateProduct({
        id,
        name:             formData.name,
        description:      formData.description || null,
        price:            parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        stock:            parseInt(formData.stock),
        status:           formData.status as "active" | "draft",
        images:           formData.imageUrl ? [{ url: formData.imageUrl }] : [],
      } as never).unwrap()
      toast({ title: "Product updated!", description: `${formData.name} has been saved.` })
      router.push("/seller/products")
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update product."
      setError(msg)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/products">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Edit Product
              </span>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Update the details of your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" placeholder="Product name" value={formData.name} onChange={(e) => update("name", e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your product..." rows={6} value={formData.description} onChange={(e) => update("description", e.target.value)} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => update("price", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compare_at_price">Compare-at Price (USD)</Label>
                      <Input id="compare_at_price" type="number" step="0.01" min="0" value={formData.compare_at_price} onChange={(e) => update("compare_at_price", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input id="stock" type="number" min="0" value={formData.stock} onChange={(e) => update("stock", e.target.value)} required />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription>Upload a file or paste an image URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFilePick}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {isUploading ? "Uploading…" : "Upload image"}
                    </Button>
                    {formData.imageUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => update("imageUrl", "")}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">…or paste a URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => update("imageUrl", e.target.value)}
                    />
                  </div>
                  {formData.imageUrl ? (
                    <div className="rounded-lg overflow-hidden border bg-muted h-48">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed bg-muted/40 h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <p className="text-sm">No image set</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Product Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => update("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <Button type="submit" className="w-full gap-2" size="lg" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Link href="/seller/products" className="block">
                    <Button type="button" variant="ghost" className="w-full" size="lg">Cancel</Button>
                  </Link>
                </CardContent>
              </Card>

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
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
