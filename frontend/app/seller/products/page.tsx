"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Eye, Package, Sparkles, ArrowLeft, DollarSign, Box, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useGetMyProductsQuery, useDeleteProductMutation } from "@/store/api/productApi"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/store/api/productApi"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active:       "default",
  draft:        "secondary",
  out_of_stock: "destructive",
}

const PAGE_SIZE = 20

export default function ProductsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const { data, isLoading, isFetching } = useGetMyProductsQuery({ limit: PAGE_SIZE, offset })
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const products: Product[] = data?.data ?? []
  const hasMore = data?.has_more ?? false
  const handleLoadMore = () => setOffset((o) => o + PAGE_SIZE)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id).unwrap()
      toast({ title: "Product deleted", description: `"${product.name}" has been removed.` })
    } catch {
      toast({ title: "Delete failed", description: "Could not delete product. Please try again.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount     = products.filter((p) => p.status === "active").length
  const totalSales      = products.reduce((sum, p) => sum + p.sales_count, 0)
  const outOfStockCount = products.filter((p) => p.status === "out_of_stock").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Product Management
              </span>
            </div>
          </div>
          <Link href="/seller/products/add">
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Product</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{isLoading ? "—" : products.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Box className="w-8 h-8 text-green-500" />
                <Badge className="bg-green-100 text-green-700">{isLoading ? "—" : activeCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <Badge className="bg-orange-100 text-orange-700">{isLoading ? "—" : totalSales}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ImageIcon className="w-8 h-8 text-red-500" />
                <Badge variant="destructive">{isLoading ? "—" : outOfStockCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage your product inventory and listings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try a different search term" : "Start adding products to your store"}
                </p>
                <Link href="/seller/products/add">
                  <Button><Plus className="w-4 h-4 mr-2" />Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const thumbnail = product.images?.[0]?.url ?? "/placeholder.svg"
                  const isThisDeleting = deletingId === product.id
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-all group"
                    >
                      <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={thumbnail} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {product.category && <Badge variant="outline">{product.category.name}</Badge>}
                              <Badge variant={STATUS_VARIANT[product.status] ?? "secondary"}>
                                {product.status.replace("_", " ")}
                              </Badge>
                              {product.is_featured && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Featured</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-semibold">${product.price}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock</p>
                            <p className="font-semibold">{product.stock} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sales</p>
                            <p className="font-semibold">{product.sales_count} sold</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Link href={`/product/${product.id}`} target="_blank" className="flex-1 md:flex-none">
                          <Button variant="outline" size="icon" className="w-full bg-transparent" title="Preview">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/seller/products/edit/${product.id}`} className="flex-1 md:flex-none">
                          <Button variant="outline" size="icon" className="w-full bg-transparent" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDelete(product)}
                          disabled={isThisDeleting}
                          title="Delete"
                        >
                          {isThisDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {hasMore && !searchQuery && filteredProducts.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isFetching ? "Loading…" : `Load more (${(data?.total ?? 0) - products.length} remaining)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
