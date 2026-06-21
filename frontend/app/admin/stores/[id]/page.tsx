"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft, Check, X, DollarSign, Loader2, MapPin, Star, Mail, Phone, KeyRound,
  Package, ShoppingBag, Users, Receipt, ExternalLink, Calendar, TrendingUp,
  Instagram, Facebook, Ban, RotateCcw, FileText, Tag, CreditCard,
} from "lucide-react"
import { getPlan } from "@/lib/plans"
import {
  useGetAdminStoreDetailQuery,
  useApproveStoreMutation,
  useSetStoreSubscriptionMutation,
  type SubscriptionStatus,
} from "@/store/api/storeApi"
import { useResetUserPasswordMutation, useUpdateSellerStatusMutation } from "@/store/api/userApi"
import { useToast } from "@/hooks/use-toast"
import {
  SUBSCRIPTION_LABEL, SUBSCRIPTION_BADGE_CLASS, SUBSCRIPTION_STATUSES,
  PAYMENT_STATUS_CFG, SELLER_STATUS_CFG, initials,
} from "@/components/admin/admin-ui"

export default function AdminSellerDetailPage() {
  const params = useParams()
  const storeId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const { data, isLoading, isError } = useGetAdminStoreDetailQuery(storeId, { skip: !isAdmin || !storeId })
  const [approveStore, { isLoading: isApproving }] = useApproveStoreMutation()
  const [setSubscription, { isLoading: isSubUpdating }] = useSetStoreSubscriptionMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation()
  const [setSellerStatus, { isLoading: isStatusUpdating }] = useUpdateSellerStatusMutation()

  const handleApprove = async (approved: boolean) => {
    setBusy(true)
    try {
      await approveStore({ id: storeId, approved }).unwrap()
      toast({ title: approved ? "Store approved" : "Approval revoked", description: "The seller has been notified by email." })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const handleSetSubscription = async (status: SubscriptionStatus) => {
    setBusy(true)
    try {
      await setSubscription({ id: storeId, subscription_status: status }).unwrap()
      toast({ title: "Subscription updated", description: `Status set to ${SUBSCRIPTION_LABEL[status]}` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  // Stop (suspend) or reactivate the seller. Suspending hides the storefront and
  // logs the seller out; reactivating re-approves them. Both run through the
  // user-status endpoint, which keeps the User flags and the Store in sync.
  const handleSellerStatus = async (ownerId: string, ownerName: string, suspend: boolean) => {
    if (suspend && !window.confirm(
      `Stop ${ownerName}? Their storefront will be hidden from the marketplace and they'll be logged out immediately. Their data, store, and payment history are kept — you can reactivate anytime.`,
    )) return
    setBusy(true)
    try {
      await setSellerStatus({ id: ownerId, status: suspend ? "suspended" : "approved" }).unwrap()
      toast({
        title: suspend ? "Seller stopped" : "Seller reactivated",
        description: suspend
          ? `${ownerName}'s storefront is hidden and they've been signed out.`
          : `${ownerName}'s storefront is live again.`,
      })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const handleResetPassword = async (ownerId: string, ownerName: string) => {
    const pwd = window.prompt(`Set a new password for ${ownerName} (min 6 chars):`)
    if (pwd === null) return
    if (pwd.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    try {
      await resetPassword({ id: ownerId, password: pwd }).unwrap()
      toast({ title: "Password reset", description: `${ownerName} can now sign in with the new password.` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    }
  }

  const store = data?.store
  const stats = data?.stats
  const payments = data?.payments ?? []
  const subStatus: SubscriptionStatus = store?.subscription_status ?? "inactive"
  const ownerStatus = store?.owner?.seller_status
  const isSuspended = ownerStatus === "suspended"

  const statCards = [
    { label: "Products",     value: stats?.product_count ?? 0,                          icon: Package },
    { label: "Orders",       value: stats?.order_count ?? 0,                            icon: ShoppingBag },
    { label: "GMV",          value: `$${Number(stats?.gmv ?? 0).toFixed(0)}`,           icon: TrendingUp },
    { label: "Followers",    value: stats?.follower_count ?? 0,                         icon: Users },
    { label: "Rating",       value: stats?.rating ? Number(stats.rating).toFixed(1) : "—", icon: Star, hint: `${stats?.review_count ?? 0} reviews` },
    { label: "Sub. revenue", value: `$${Number(stats?.subscription_revenue ?? 0).toFixed(0)}`, icon: Receipt },
  ]

  return (
    <div>
      <Link href="/admin/sellers">
        <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to sellers
        </Button>
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !store ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold text-lg">Seller not found</p>
          <p className="text-muted-foreground text-sm mb-4">The store may have been deleted.</p>
          <Link href="/admin/sellers"><Button variant="outline">Back to sellers</Button></Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header + actions */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {initials(store.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{store.name}</h1>
                    <Badge variant={store.is_approved ? "default" : "secondary"}>
                      {store.is_approved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant="outline" className={SUBSCRIPTION_BADGE_CLASS[subStatus]}>
                      {SUBSCRIPTION_LABEL[subStatus]}
                    </Badge>
                    {store.plan_id && <Badge variant="outline" className="capitalize bg-muted/50">{store.plan_id}</Badge>}
                    {isSuspended && (
                      <Badge variant="outline" className={SELLER_STATUS_CFG.suspended.cls}>
                        {SELLER_STATUS_CFG.suspended.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 flex-wrap">
                    {store.owner?.name && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{store.owner.name}</span>}
                    {store.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{store.location}</span>}
                    {store.category && <span>{store.category.name}</span>}
                    {store.trial_ends_at && subStatus === "trialing" && (
                      <span className="text-blue-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />Trial ends {new Date(store.trial_ends_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-2 flex-wrap">
                {isSuspended ? (
                  store.owner?.id && (
                    <Button
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                      onClick={() => handleSellerStatus(store.owner!.id, store.owner!.name, false)}
                      disabled={busy || isStatusUpdating}
                    >
                      {busy && isStatusUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Reactivate seller
                    </Button>
                  )
                ) : (
                  <>
                    {!store.is_approved && (
                      <Button className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(true)} disabled={busy || isApproving}>
                        {busy && isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                      </Button>
                    )}
                    {store.is_approved ? (
                      <Button variant="outline" className="gap-1.5 bg-transparent text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleApprove(false)} disabled={busy || isApproving}>
                        <X className="w-4 h-4" /> Revoke approval
                      </Button>
                    ) : (
                      <Button variant="destructive" className="gap-1.5" onClick={() => handleApprove(false)} disabled={busy || isApproving}>
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    )}
                    {store.owner?.id && (
                      <Button
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => handleSellerStatus(store.owner!.id, store.owner!.name, true)}
                        disabled={busy || isStatusUpdating}
                      >
                        <Ban className="w-4 h-4" /> Stop seller
                      </Button>
                    )}
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent gap-1.5" disabled={busy || isSubUpdating}>
                      {busy && isSubUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />} Set subscription
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {SUBSCRIPTION_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleSetSubscription(status)}
                        className={`cursor-pointer ${status === subStatus ? "bg-muted font-medium" : ""}`}
                      >
                        {SUBSCRIPTION_LABEL[status]}
                        {status === subStatus && <Check className="w-3 h-3 ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {store.owner?.id && (
                  <Button
                    variant="outline" className="bg-transparent gap-1.5"
                    onClick={() => handleResetPassword(store.owner!.id, store.owner!.name)}
                    disabled={isResetting}
                  >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Reset password
                  </Button>
                )}

                <Link href={`/store/${store.slug}`} target="_blank">
                  <Button variant="ghost" className="gap-1.5"><ExternalLink className="w-4 h-4" /> View storefront</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Application details — what the seller submitted in "Become a seller" */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Application details
              </CardTitle>
              {store.created_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Applied {new Date(store.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
              )}
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Store name</dt>
                  <dd className="font-medium">{store.name}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category</dt>
                  <dd className="font-medium">{store.category?.name ?? "—"}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City</dt>
                  <dd className="font-medium">{store.location ?? "—"}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Selected plan</dt>
                  <dd className="font-medium">
                    {store.plan_id
                      ? `${getPlan(store.plan_id).name} · $${getPlan(store.plan_id).price}/mo`
                      : "—"}
                  </dd>
                </div>
                <div className="space-y-0.5 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Description</dt>
                  <dd className={store.description ? "whitespace-pre-line" : "text-muted-foreground italic"}>
                    {store.description || "No description provided."}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2"><Icon className="w-4 h-4 text-primary" /></div>
                    <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                    {s.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Owner / contact */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Seller &amp; contact</CardTitle></CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{store.owner?.name ?? "—"}</span>
                </p>
                {store.owner?.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${store.owner.email}`} className="text-primary hover:underline">{store.owner.email}</a>
                  </p>
                )}
                {store.owner?.phone && (
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{store.owner.phone}</p>
                )}
                {store.owner?.created_at && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />Member since {new Date(store.owner.created_at).toLocaleDateString()}
                  </p>
                )}
                {(store.whatsapp || store.instagram || store.facebook || store.tiktok) && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-3 flex-wrap text-muted-foreground">
                      {store.whatsapp && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{store.whatsapp}</span>}
                      {store.instagram && <span className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5" />{store.instagram}</span>}
                      {store.facebook && <span className="flex items-center gap-1"><Facebook className="w-3.5 h-3.5" />{store.facebook}</span>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {store.description ? (
                  <p className="text-muted-foreground whitespace-pre-line">{store.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing history */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Billing history ({payments.length})</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No subscription charges yet.</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => {
                    const cfg = PAYMENT_STATUS_CFG[p.status]
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                        <Receipt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.invoice_number}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {p.plan_id} · {new Date(p.period_start).toLocaleDateString()} – {new Date(p.period_end).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-semibold">${Number(p.amount).toFixed(2)}</span>
                        <Badge variant="outline" className={cfg?.cls ?? ""}>{cfg?.label ?? p.status}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  )
}
