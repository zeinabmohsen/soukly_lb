"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, Search, Edit, Trash2, Eye, Package, DollarSign, Box, ImageIcon, Loader2,
  Tag, Save, X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useGetMyProductsQuery, useDeleteProductMutation, type Product } from "@/store/api/productApi"
import {
  useGetMyStoreQuery,
  useGetStoreCategoriesQuery,
  useCreateStoreCategoryMutation,
  useUpdateStoreCategoryMutation,
  useDeleteStoreCategoryMutation,
} from "@/store/api/storeApi"
import { useToast } from "@/hooks/use-toast"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active:       "default",
  draft:        "secondary",
  out_of_stock: "destructive",
}

const PAGE_SIZE = 20

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  )
}

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") === "categories" ? "categories" : "products"
  const [tab, setTab] = useState<"products" | "categories">(initialTab)

  // Keep the URL in sync so refresh / share-link returns to the same tab.
  useEffect(() => {
    const current = searchParams.get("tab")
    const target = tab === "categories" ? "categories" : null
    if (current === target) return
    const params = new URLSearchParams(searchParams.toString())
    if (target) params.set("tab", target)
    else params.delete("tab")
    router.replace(`/seller/products${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your catalog and the categories you sort it into.</p>
        </div>
        {tab === "products" && (
          <Link href="/seller/products/add">
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Product</Button>
          </Link>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "products" | "categories")}>
        <TabsList>
          <TabsTrigger value="products" className="gap-2"><Package className="w-3.5 h-3.5" />Products</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><Tag className="w-3.5 h-3.5" />Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductsPanel />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ─── Products tab ──────────────────────────────────────────────────────── */

function ProductsPanel() {
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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <Card>
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
                      <Image src={thumbnail} alt={product.name} fill className="object-cover" unoptimized />
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
                            {(product.customizations?.length ?? 0) > 0 && (
                              <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">Customizable</Badge>
                            )}
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
  )
}

/* ─── Categories tab ────────────────────────────────────────────────────── */

function CategoriesPanel() {
  const { toast } = useToast()
  const { data: myStore, isLoading: storeLoading } = useGetMyStoreQuery()
  const storeId = myStore?.id ?? ""

  const { data: catData, isLoading: catsLoading } = useGetStoreCategoriesQuery(storeId, { skip: !storeId })
  const categories = catData ?? []

  const [createCategory, { isLoading: isCreating }] = useCreateStoreCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateStoreCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteStoreCategoryMutation()

  const [newName, setNewName]       = useState("")
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editName, setEditName]     = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await createCategory({ name: newName.trim() }).unwrap()
      setNewName("")
      toast({ title: "Category created", description: `"${newName}" added to your store.` })
    } catch {
      toast({ title: "Create failed", variant: "destructive" })
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateCategory({ id, name: editName.trim() }).unwrap()
      setEditingId(null)
      toast({ title: "Category updated" })
    } catch {
      toast({ title: "Update failed", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category won't be deleted.`)) return
    setDeletingId(id)
    try {
      await deleteCategory(id).unwrap()
      toast({ title: "Category deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const isLoading = storeLoading || catsLoading

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
          <CardDescription>Organise your products into categories for easier browsing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Category name (e.g. Summer Collection, New Arrivals)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={!newName.trim() || isCreating} className="gap-2 flex-shrink-0">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>{isLoading ? "Loading..." : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No categories yet. Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const isEditingThis = editingId === cat.id
                const isDeletingThis = deletingId === cat.id
                return (
                  <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                    {isEditingThis ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(cat.id)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                        />
                        <Button size="icon" onClick={() => handleUpdate(cat.id)} disabled={isUpdating} className="flex-shrink-0">
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="flex-shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">#{cat.sort_order + 1}</Badge>
                        <Button size="icon" variant="ghost" onClick={() => startEdit(cat.id, cat.name)} className="flex-shrink-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={isDeletingThis || isDeleting}
                        >
                          {isDeletingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
