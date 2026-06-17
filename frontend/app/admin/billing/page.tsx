"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, CreditCard, Clock, Receipt, MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  useGetAdminBillingQuery,
  useUpdateAdminPaymentMutation,
  type PaymentStatus,
} from "@/store/api/storeApi"
import { PAYMENT_STATUS_CFG, EmptyHint } from "@/components/admin/admin-ui"

// Status transitions admin can apply per current payment status.
const PAYMENT_ACTIONS: Record<PaymentStatus, { label: string; next: PaymentStatus }[]> = {
  paid:     [{ label: "Mark refunded", next: "refunded" }, { label: "Mark pending", next: "pending" }],
  pending:  [{ label: "Mark paid", next: "paid" }, { label: "Mark failed", next: "failed" }],
  failed:   [{ label: "Mark paid", next: "paid" }, { label: "Mark pending", next: "pending" }],
  refunded: [{ label: "Mark paid", next: "paid" }],
}

export default function AdminBillingPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const { data, isLoading } = useGetAdminBillingQuery({ limit: 100 }, { skip: !isAdmin })
  const [updatePayment, { isLoading: isUpdating }] = useUpdateAdminPaymentMutation()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const payments = useMemo(() => data?.data ?? [], [data])
  const summary = data?.summary

  const handleStatus = async (id: string, status: PaymentStatus) => {
    setProcessingId(id)
    try {
      await updatePayment({ id, status }).unwrap()
      toast({ title: "Payment updated", description: `Marked ${PAYMENT_STATUS_CFG[status]?.label ?? status}` })
    } catch (e) {
      const msg = (e as { data?: { message?: string } })?.data?.message
      toast({ title: "Update failed", description: msg, variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide subscription revenue and invoices.</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Wallet className="w-3.5 h-3.5 text-green-600" /> Collected revenue
            </div>
            <p className="text-2xl md:text-3xl font-bold">{isLoading ? "—" : `$${(summary?.total_revenue ?? 0).toFixed(0)}`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{summary?.paid_count ?? 0} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <CreditCard className="w-3.5 h-3.5 text-primary" /> MRR (active)
            </div>
            <p className="text-2xl md:text-3xl font-bold">{isLoading ? "—" : `$${(summary?.mrr ?? 0).toFixed(0)}`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{summary?.active_subscriptions ?? 0} active subs</p>
          </CardContent>
        </Card>
        <Card className={summary?.pending_count ? "border-amber-500/30" : ""}>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending / Failed
            </div>
            <p className="text-2xl md:text-3xl font-bold">{isLoading ? "—" : `${summary?.pending_count ?? 0} / ${summary?.failed_count ?? 0}`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">${(summary?.pending_amount ?? 0).toFixed(0)} awaiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" /> Refunded
            </div>
            <p className="text-2xl md:text-3xl font-bold">{isLoading ? "—" : `$${(summary?.refunded_amount ?? 0).toFixed(0)}`}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{summary?.refunded_count ?? 0} refunds</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Subscription payments ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : payments.length === 0 ? (
            <EmptyHint icon={Receipt} text="No subscription charges recorded yet. These appear once sellers are billed." />
          ) : (
            <div className="space-y-2">
              {payments.map((p) => {
                const cfg = PAYMENT_STATUS_CFG[p.status]
                return (
                  <div key={p.id} className="flex items-center gap-4 p-3 border rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.invoice_number}</p>
                        {p.store ? (
                          <Link href={`/admin/stores/${p.store.id}`} className="text-xs text-primary hover:underline truncate block">
                            {p.store.name}
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground">—</p>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium capitalize">{p.plan_id}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.payment_method}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm text-muted-foreground">
                          {new Date(p.period_start).toLocaleDateString()} – {new Date(p.period_end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.paid_at ? `Paid ${new Date(p.paid_at).toLocaleDateString()}` : "Not paid"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-semibold text-sm">${Number(p.amount).toFixed(2)}</span>
                      <Badge variant="outline" className={cfg?.cls ?? ""}>{cfg?.label ?? p.status}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isUpdating && processingId === p.id}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="sr-only">Payment actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(PAYMENT_ACTIONS[p.status] ?? []).map((a) => (
                            <DropdownMenuItem key={a.next} onClick={() => handleStatus(p.id, a.next)}>
                              {a.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
