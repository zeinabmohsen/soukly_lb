"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Store, Search, Star, Check, Loader2, DollarSign, Eye, ExternalLink, Mail, ChevronRight,
} from "lucide-react"
import {
  useGetAdminStoresQuery,
  useApproveStoreMutation,
  useSetStoreSubscriptionMutation,
  type SubscriptionStatus,
} from "@/store/api/storeApi"
import { useToast } from "@/hooks/use-toast"
import {
  SUBSCRIPTION_LABEL, SUBSCRIPTION_BADGE_CLASS, SUBSCRIPTION_STATUSES,
  EmptyHint, initials,
} from "@/components/admin/admin-ui"

type StatusFilter = "all" | "approved" | "pending"

function SellersInner() {
  const params = useSearchParams()
  const initialStatus = (params.get("status") as StatusFilter) || "all"
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    ["all", "approved", "pending"].includes(initialStatus) ? initialStatus : "all",
  )
  const [processingId, setProcessingId] = useState<string | null>(null)

  const { data, isLoading } = useGetAdminStoresQuery({ status: "all" }, { skip: !isAdmin })
  const [approveStore, { isLoading: isApproving }] = useApproveStoreMutation()
  const [setSubscription, { isLoading: isSubUpdating }] = useSetStoreSubscriptionMutation()

  const stores = useMemo(() => data?.data ?? [], [data])

  const filtered = stores
    .filter((s) =>
      statusFilter === "all" ? true : statusFilter === "approved" ? s.is_approved : !s.is_approved,
    )
    .filter((s) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        (s.location ?? "").toLowerCase().includes(q) ||
        (s.owner?.name ?? "").toLowerCase().includes(q) ||
        (s.owner?.email ?? "").toLowerCase().includes(q)
      )
    })

  const handleApprove = async (storeId: string, approved: boolean) => {
    setProcessingId(storeId)
    try {
      await approveStore({ id: storeId, approved }).unwrap()
      toast({ title: approved ? "Store approved" : "Approval revoked" })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Sellers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search a seller and open their profile for full info, payments &amp; orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>{filtered.length} seller{filtered.length !== 1 ? "s" : ""}</CardTitle>
            <div className="flex rounded-lg bg-muted/50 p-0.5 self-start">
              {(["all", "approved", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    statusFilter === f ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by seller name, store, email, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[68px] w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyHint icon={Store} text="No sellers match your filters." />
          ) : (
            <div className="space-y-2">
              {filtered.map((store) => {
                const subStatus = store.subscription_status ?? "inactive"
                const trialDate = store.trial_ends_at ? new Date(store.trial_ends_at) : null
                const busy = processingId === store.id
                return (
                  <div
                    key={store.id}
                    className="group flex items-center gap-4 p-3 border rounded-xl hover:bg-muted/40 hover:border-primary/30 transition-colors"
                  >
                    {/* Whole-row click target → detail */}
                    <Link href={`/admin/stores/${store.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {initials(store.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">{store.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                          <span className="truncate">{store.owner?.name ?? "—"}</span>
                          {store.owner?.email && (
                            <span className="hidden sm:flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />{store.owner.email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-0.5">
                          {store.location && <span>{store.location}</span>}
                          {store.rating > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{store.rating.toFixed(1)}
                            </span>
                          )}
                          {subStatus === "trialing" && trialDate && (
                            <span className="text-blue-600">Trial ends {trialDate.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Status badges */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <Badge variant={store.is_approved ? "default" : "secondary"}>
                        {store.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      <Badge variant="outline" className={SUBSCRIPTION_BADGE_CLASS[subStatus]}>
                        {SUBSCRIPTION_LABEL[subStatus]}
                      </Badge>
                      {store.plan_id && (
                        <Badge variant="outline" className="capitalize bg-muted/50">{store.plan_id}</Badge>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!store.is_approved && (
                        <Button
                          size="sm" className="gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(store.id, true)} disabled={busy || isApproving}
                        >
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="bg-transparent gap-1" disabled={busy || isSubUpdating}>
                            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                            <span className="hidden lg:inline">Subscription</span>
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

                      <Link href={`/store/${store.slug}`} target="_blank" className="hidden lg:block">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/admin/stores/${store.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
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

export default function AdminSellersPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>}>
      <SellersInner />
    </Suspense>
  )
}
