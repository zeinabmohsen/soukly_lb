"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, ArrowLeft, Sparkles, Upload, Plus, TrendingDown, CheckCircle, X } from "lucide-react"
import Link from "next/link"

interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
  sku: string
}

interface InventoryProduct {
  id: string
  name: string
  variants: ProductVariant[]
  totalStock: number
  lowStockThreshold: number
  status: "in-stock" | "low-stock" | "out-of-stock"
}

export default function InventoryPage() {
  const { user, isSeller, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null)
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)

  const [products, setProducts] = useState<InventoryProduct[]>([
    {
      id: "1",
      name: "Leather Wallet",
      variants: [
        { id: "v1", color: "Brown", stock: 15, sku: "LW-BRN-001" },
        { id: "v2", color: "Black", stock: 3, sku: "LW-BLK-001" },
        { id: "v3", color: "Tan", stock: 6, sku: "LW-TAN-001" },
      ],
      totalStock: 24,
      lowStockThreshold: 10,
      status: "in-stock",
    },
    {
      id: "2",
      name: "Silk Scarf",
      variants: [
        { id: "v4", size: "Small", stock: 2, sku: "SS-SML-001" },
        { id: "v5", size: "Medium", stock: 8, sku: "SS-MED-001" },
        { id: "v6", size: "Large", stock: 8, sku: "SS-LRG-001" },
      ],
      totalStock: 18,
      lowStockThreshold: 5,
      status: "low-stock",
    },
    {
      id: "3",
      name: "Pottery Vase",
      variants: [{ id: "v7", stock: 0, sku: "PV-001" }],
      totalStock: 0,
      lowStockThreshold: 5,
      status: "out-of-stock",
    },
  ])

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      router.push("/login")
    }
  }, [isAuthenticated, isSeller, router])

  const updateVariantStock = (productId: string, variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.map((v) => (v.id === variantId ? { ...v, stock: newStock } : v))
          const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0)
          const status =
            totalStock === 0 ? "out-of-stock" : totalStock <= product.lowStockThreshold ? "low-stock" : "in-stock"
          return { ...product, variants: updatedVariants, totalStock, status }
        }
        return product
      }),
    )
  }

  const lowStockProducts = products.filter((p) => p.status === "low-stock")
  const outOfStockProducts = products.filter((p) => p.status === "out-of-stock")

  if (!isAuthenticated || !isSeller) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Inventory Management</span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Bulk Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Inventory</DialogTitle>
                <DialogDescription>Upload a CSV file to update multiple products at once</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-1">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">CSV Format Required:</p>
                  <code className="text-xs">SKU, Product Name, Variant, Stock</code>
                </div>
                <Button className="w-full">Upload and Process</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Low Stock Alert</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {lowStockProducts.length} products running low on inventory
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lowStockProducts.map((p) => (
                        <Badge key={p.id} variant="outline" className="bg-white">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Out of Stock</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {outOfStockProducts.length} products need restocking
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {outOfStockProducts.map((p) => (
                        <Badge key={p.id} variant="destructive" className="bg-red-600">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage stock levels and product variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            product.status === "in-stock"
                              ? "default"
                              : product.status === "low-stock"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            product.status === "low-stock"
                              ? "bg-orange-100 text-orange-700"
                              : product.status === "in-stock"
                                ? "bg-green-100 text-green-700"
                                : ""
                          }
                        >
                          {product.status === "in-stock"
                            ? "In Stock"
                            : product.status === "low-stock"
                              ? "Low Stock"
                              : "Out of Stock"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Total: <span className="font-semibold">{product.totalStock} units</span>
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => {
                        setSelectedProduct(product)
                        setIsVariantDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium mb-1">
                            {variant.size && `Size: ${variant.size}`}
                            {variant.color && `Color: ${variant.color}`}
                            {!variant.size && !variant.color && "Standard"}
                          </p>
                          <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Label className="text-sm text-muted-foreground">Stock:</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariantStock(product.id, variant.id, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-24"
                            min="0"
                          />
                          {variant.stock === 0 ? (
                            <X className="w-5 h-5 text-red-500" />
                          ) : variant.stock <= 5 ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Variant Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Variant</DialogTitle>
            <DialogDescription>Add a new variant for {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Size / Color</Label>
              <Input placeholder="e.g., Large, Red, XL" />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input placeholder="Product SKU" />
            </div>
            <div className="space-y-2">
              <Label>Initial Stock</Label>
              <Input type="number" placeholder="0" min="0" />
            </div>
            <Button className="w-full">Add Variant</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
