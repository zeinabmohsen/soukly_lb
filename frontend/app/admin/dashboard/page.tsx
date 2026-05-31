"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield, Users, Store, ShoppingBag, TrendingUp, LogOut, DollarSign, Package,
  Check, X, Search, MapPin, Star, Loader2, ChevronDown, User as UserIcon, Heart, ListOrdered,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  useGetAdminStoresQuery,
  useApproveStoreMutation,
  useSetStoreSubscriptionMutation,
  type SubscriptionStatus,
} from "@/store/api/storeApi"
import { useGetUsersQuery, useUpdateSellerStatusMutation, useResetUserPasswordMutation } from "@/store/api/userApi"
import { useGetAdminOrdersQuery } from "@/store/api/orderApi"
import { useToast } from "@/hooks/use-toast"

const SUBSCRIPTION_LABEL: Record<SubscriptionStatus, string> = {
  inactive: "Inactive",
  trialing: "Trialing",
  active: "Active",
  lapsed: "Lapsed",
  cancelled: "Cancelled",
}

const SUBSCRIPTION_BADGE_CLASS: Record<SubscriptionStatus, string> = {
  inactive: "bg-muted text-muted-foreground border-border",
  trialing: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  lapsed: "bg-red-500/15 text-red-600 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground border-border line-through",
}

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["inactive", "trialing", "active", "lapsed", "cancelled"]

const ORDER_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  confirmed:  { label: "Confirmed",  cls: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
  processing: { label: "Processing", cls: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  shipped:    { label: "Shipped",    cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  delivered:  { label: "Delivered",  cls: "bg-green-500/15 text-green-600 border-green-500/30" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-500/15 text-red-600 border-red-500/30 line-through" },
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAdmin, isHydrating, logoutAsync } = useAuth()
  const { toast } = useToast()
  const [userSearch, setUserSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    // Wait for hydration to settle before deciding — otherwise a freshly
    // reloaded admin gets bounced to /login while /auth/me is still in flight.
    if (mounted && !isHydrating && !isAdmin) router.push("/login")
  }, [mounted, isHydrating, isAdmin, router])

  const { data: storesData, isLoading: storesLoading } = useGetAdminStoresQuery({ status: "all" }, { skip: !isAdmin })
  const { data: usersData,  isLoading: usersLoading  } = useGetUsersQuery(undefined,  { skip: !isAdmin })
  const { data: ordersData, isLoading: ordersLoading } = useGetAdminOrdersQuery({ limit: 100 }, { skip: !isAdmin })
  const [approveStore,         { isLoading: isApproving }]  = useApproveStoreMutation()
  const [updateSellerStatus,   { isLoading: isUpdating }]   = useUpdateSellerStatusMutation()
  const [setSubscription,      { isLoading: isSubUpdating }] = useSetStoreSubscriptionMutation()
  const [resetPassword,        { isLoading: isResetting }]   = useResetUserPasswordMutation()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const stores    = storesData?.data  ?? []
  const users     = usersData?.data   ?? []
  const orders    = ordersData?.data  ?? []
  const pending   = stores.filter((s) => !s.is_approved)
  const approved  = stores.filter((s) => s.is_approved)
  const paying    = stores.filter((s) => s.subscription_status === "active" || s.subscription_status === "trialing")
  const sellers   = users.filter((u) => u.is_seller)
  const ordersRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const handleApprove = async (storeId: string, approved: boolean) => {
    setProcessingId(storeId)
    try {
      await approveStore({ id: storeId, approved }).unwrap()
      toast({ title: approved ? "Store approved" : "Store rejected", description: approved ? "The seller can now access their dashboard." : "The seller has been notified." })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSetSubscription = async (storeId: string, status: SubscriptionStatus) => {
    setProcessingId(storeId)
    try {
      await setSubscription({ id: storeId, subscription_status: status }).unwrap()
      toast({ title: "Subscription updated", description: `Status set to ${SUBSCRIPTION_LABEL[status]}` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleResetPassword = async (userId: string, userName: string) => {
    const pwd = window.prompt(`Set a new password for ${userName} (min 6 chars):`)
    if (pwd === null) return
    if (pwd.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setProcessingId(userId)
    try {
      await resetPassword({ id: userId, password: pwd }).unwrap()
      toast({ title: "Password reset", description: `${userName} can now sign in with the new password.` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSellerStatus = async (userId: string, status: "approved" | "rejected") => {
    setProcessingId(userId)
    try {
      await updateSellerStatus({ id: userId, status }).unwrap()
      toast({ title: `Seller ${status}` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleLogout = () => {
    logoutAsync()
    router.push("/login")
  }

  if (!mounted || !isAdmin) return null

  const stats = [
    { label: "Total Stores",      value: storesLoading ? "—" : String(stores.length),                icon: Store },
    { label: "Pending Approval",  value: storesLoading ? "—" : String(pending.length),               icon: ShoppingBag, accent: pending.length > 0 },
    { label: "Paying / Trialing", value: storesLoading ? "—" : String(paying.length),                icon: DollarSign },
    { label: "Total Users",       value: usersLoading  ? "—" : String(users.length),                 icon: Users },
    { label: "Total Orders",      value: ordersLoading ? "—" : String(orders.length),                icon: Package },
    { label: "Platform GMV",      value: ordersLoading ? "—" : `$${ordersRevenue.toFixed(0)}`,       icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Soukly Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="sm">View Site</Button></Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-primary/8 transition-all group border border-transparent hover:border-border/60 outline-none">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                    {(user?.name ?? "A")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium truncate max-w-[100px]">{user?.name}</span>
                    <span className="text-[10px] text-primary/70 font-medium">Admin</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <div className="px-2 py-2.5 mb-1 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(user?.name ?? "A")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex-shrink-0">Admin</Badge>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer gap-2">
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/8"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your marketplace platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className={`animate-in fade-in slide-in-from-bottom duration-500 ${stat.accent ? "border-amber-500/40 bg-amber-500/5" : ""}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.accent ? "bg-amber-500/15" : "bg-primary/10"}`}>
                      <Icon className={`w-4 h-4 ${stat.accent ? "text-amber-600" : "text-primary"}`} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="pending" className="gap-2">
              <Store className="w-4 h-4" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              All Stores
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Seller Applications Awaiting Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {storesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : pending.length === 0 ? (
                  <div className="text-center py-12">
                    <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="font-semibold text-lg">All caught up!</p>
                    <p className="text-muted-foreground text-sm">No pending seller applications.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((store) => {
                      const isThis = processingId === store.id
                      return (
                        <div key={store.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {store.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{store.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {store.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.location}</span>}
                              {store.category && <span>{store.category.name}</span>}
                              {store.description && <span className="truncate max-w-48">{store.description}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              className="gap-1.5 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(store.id, true)}
                              disabled={isThis || isApproving}
                            >
                              {isThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1.5"
                              onClick={() => handleApprove(store.id, false)}
                              disabled={isThis || isApproving}
                            >
                              {isThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                              Reject
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Stores */}
          <TabsContent value="stores">
            <Card>
              <CardHeader><CardTitle>All Stores ({stores.length})</CardTitle></CardHeader>
              <CardContent>
                {storesLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {stores.map((store) => {
                      const subStatus = store.subscription_status ?? "inactive"
                      const trialDate = store.trial_ends_at ? new Date(store.trial_ends_at) : null
                      return (
                        <div key={store.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {store.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{store.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {store.location && <span>{store.location}</span>}
                              {store.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{store.rating.toFixed(1)}</span>}
                              {subStatus === "trialing" && trialDate && (
                                <span className="text-blue-600">Trial ends {trialDate.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <Badge variant={store.is_approved ? "default" : "secondary"}>
                              {store.is_approved ? "Approved" : "Pending"}
                            </Badge>
                            <Badge variant="outline" className={SUBSCRIPTION_BADGE_CLASS[subStatus]}>
                              {SUBSCRIPTION_LABEL[subStatus]}
                            </Badge>
                            {store.plan_id && (
                              <Badge variant="outline" className="capitalize bg-muted/50">
                                {store.plan_id}
                              </Badge>
                            )}

                            {!store.is_approved && (
                              <Button size="sm" className="gap-1" onClick={() => handleApprove(store.id, true)} disabled={processingId === store.id}>
                                {processingId === store.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Approve
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="bg-transparent gap-1" disabled={processingId === store.id || isSubUpdating}>
                                  {processingId === store.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                                  Subscription
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {SUBSCRIPTION_STATUSES.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleSetSubscription(store.id, status)}
                                    className={`cursor-pointer ${status === subStatus ? "bg-muted font-medium" : ""}`}
                                  >
                                    {SUBSCRIPTION_LABEL[status]}
                                    {status === subStatus && <Check className="w-3 h-3 ml-auto" />}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href={`/store/${store.slug}`} target="_blank">
                              <Button size="sm" variant="outline" className="bg-transparent">View</Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Platform Users ({users.length})</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                          {user.is_admin && <Badge variant="destructive" className="text-xs">Admin</Badge>}
                          {user.is_seller && (
                            <Badge
                              variant={user.seller_status === "approved" ? "default" : user.seller_status === "pending" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {user.seller_status}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs h-7 bg-transparent"
                            onClick={() => handleResetPassword(user.id, user.name)}
                            disabled={processingId === user.id || isResetting}
                          >
                            {processingId === user.id && isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Reset password
                          </Button>
                          {user.is_seller && user.seller_status === "pending" && (
                            <>
                              <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-xs h-7"
                                onClick={() => handleSellerStatus(user.id, "approved")}
                                disabled={processingId === user.id || isUpdating}
                              >
                                {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="gap-1 text-xs h-7"
                                onClick={() => handleSellerStatus(user.id, "rejected")}
                                disabled={processingId === user.id || isUpdating}
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total revenue (excluding cancelled): <span className="font-semibold text-foreground">${ordersRevenue.toFixed(2)}</span>
                </p>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-semibold">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Orders will appear here as buyers check out across stores.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => {
                      const statusCfg = ORDER_STATUS_CFG[order.status]
                      return (
                        <div key={order.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                            <div>
                              <p className="font-medium text-sm truncate">#{order.id.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {order.shipping_address?.name ?? "Unknown buyer"}
                              </p>
                            </div>
                            <div className="hidden md:block min-w-0">
                              <p className="text-sm font-medium truncate">
                                {order.store?.name ?? "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-sm font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.OrderItems?.length ?? 0} item{(order.OrderItems?.length ?? 0) !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className={statusCfg?.cls ?? ""}>
                              {statusCfg?.label ?? order.status}
                            </Badge>
                            <span className="md:hidden font-semibold text-sm">
                              ${Number(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
