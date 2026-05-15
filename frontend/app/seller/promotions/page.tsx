"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Sparkles, Plus, Percent, Tag, Zap, Gift, Star, Copy, Eye, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"

interface Promotion {
  id: string
  type: "discount" | "flash-sale" | "bundle" | "featured"
  name: string
  code?: string
  discount?: number
  status: "active" | "scheduled" | "expired"
  startDate: string
  endDate: string
  usageCount: number
  usageLimit?: number
}

export default function PromotionsPage() {
  const { user, isSeller, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [promotionType, setPromotionType] = useState<"discount" | "flash-sale" | "bundle" | "featured">("discount")

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      type: "discount",
      name: "Summer Sale 2024",
      code: "SUMMER20",
      discount: 20,
      status: "active",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      usageCount: 45,
      usageLimit: 100,
    },
    {
      id: "2",
      type: "flash-sale",
      name: "Weekend Flash Deal",
      discount: 30,
      status: "scheduled",
      startDate: "2024-07-15",
      endDate: "2024-07-17",
      usageCount: 0,
    },
    {
      id: "3",
      type: "bundle",
      name: "Buy 2 Get 1 Free",
      status: "active",
      startDate: "2024-06-15",
      endDate: "2024-12-31",
      usageCount: 28,
    },
    {
      id: "4",
      type: "featured",
      name: "Featured Product Slot",
      status: "active",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      usageCount: 1520,
    },
  ])

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      router.push("/login")
    }
  }, [isAuthenticated, isSeller, router])

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "discount":
        return <Percent className="w-5 h-5" />
      case "flash-sale":
        return <Zap className="w-5 h-5" />
      case "bundle":
        return <Gift className="w-5 h-5" />
      case "featured":
        return <Star className="w-5 h-5" />
      default:
        return <Tag className="w-5 h-5" />
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Code "${code}" copied to clipboard!`)
  }

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
              <span className="text-xl font-bold">Promotions & Marketing</span>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Promotion</DialogTitle>
                <DialogDescription>Set up a new promotion to boost your sales</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Promotion Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: "discount", label: "Discount Code", icon: Percent },
                      { type: "flash-sale", label: "Flash Sale", icon: Zap },
                      { type: "bundle", label: "Bundle Deal", icon: Gift },
                      { type: "featured", label: "Featured Slot", icon: Star },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.type}
                          onClick={() => setPromotionType(item.type as any)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            promotionType === item.type ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <p className="font-medium text-sm">{item.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Promotion Name</Label>
                  <Input placeholder="e.g., Summer Sale 2024" />
                </div>

                {(promotionType === "discount" || promotionType === "flash-sale") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Discount Code</Label>
                        <Input placeholder="SUMMER20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount (%)</Label>
                        <Input type="number" placeholder="20" min="0" max="100" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Usage Limit (optional)</Label>
                      <Input type="number" placeholder="Unlimited" min="1" />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Activate Immediately</p>
                    <p className="text-sm text-muted-foreground">Start this promotion right away</p>
                  </div>
                  <Switch />
                </div>

                <Button className="w-full">Create Promotion</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-8 h-8 text-primary" />
                <Badge>{promotions.filter((p) => p.status === "active").length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Active Promotions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-orange-500" />
                <Badge className="bg-orange-100 text-orange-700">
                  {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Percent className="w-8 h-8 text-green-500" />
                <Badge className="bg-green-100 text-green-700">$2,340</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Revenue from Promos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-8 h-8 text-purple-500" />
                <Badge className="bg-purple-100 text-purple-700">
                  {promotions.filter((p) => p.status === "scheduled").length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Promotions List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Promotions</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {promotions.map((promo) => (
              <Card key={promo.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-xl">{getPromotionIcon(promo.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{promo.name}</h3>
                          <Badge
                            variant={
                              promo.status === "active"
                                ? "default"
                                : promo.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              promo.status === "active"
                                ? "bg-green-100 text-green-700"
                                : promo.status === "scheduled"
                                  ? "bg-blue-100 text-blue-700"
                                  : ""
                            }
                          >
                            {promo.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {promo.startDate} to {promo.endDate}
                          </span>
                          {promo.code && (
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-muted rounded font-mono">{promo.code}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyCode(promo.code!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          {promo.discount && <Badge variant="outline">{promo.discount}% OFF</Badge>}
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Uses</p>
                            <p className="font-semibold">
                              {promo.usageCount}
                              {promo.usageLimit && ` / ${promo.usageLimit}`}
                            </p>
                          </div>
                          {promo.usageLimit && (
                            <div className="flex-1 max-w-xs">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${(promo.usageCount / promo.usageLimit) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="bg-transparent">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="bg-transparent">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-500 hover:bg-red-50 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active">
            <p className="text-muted-foreground">Showing only active promotions...</p>
          </TabsContent>
          <TabsContent value="scheduled">
            <p className="text-muted-foreground">Showing only scheduled promotions...</p>
          </TabsContent>
          <TabsContent value="expired">
            <p className="text-muted-foreground">Showing only expired promotions...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
