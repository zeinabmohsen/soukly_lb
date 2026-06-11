"use client"

import type { LucideIcon } from "lucide-react"
import type { SubscriptionStatus, PaymentStatus } from "@/store/api/storeApi"

// ── Shared status config used across every admin screen ───────────────────────

export const SUBSCRIPTION_LABEL: Record<SubscriptionStatus, string> = {
  inactive: "Inactive",
  trialing: "Trialing",
  active: "Active",
  lapsed: "Lapsed",
  cancelled: "Cancelled",
}

export const SUBSCRIPTION_BADGE_CLASS: Record<SubscriptionStatus, string> = {
  inactive: "bg-muted text-muted-foreground border-border",
  trialing: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  lapsed: "bg-red-500/15 text-red-600 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground border-border line-through",
}

export const SUBSCRIPTION_BAR_CLASS: Record<SubscriptionStatus, string> = {
  inactive: "bg-muted-foreground/40",
  trialing: "bg-blue-500",
  active: "bg-green-500",
  lapsed: "bg-red-500",
  cancelled: "bg-muted-foreground/30",
}

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "inactive", "trialing", "active", "lapsed", "cancelled",
]

export const ORDER_STATUS_CFG: Record<string, { label: string; cls: string; bar: string }> = {
  pending:    { label: "Pending",    cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",     bar: "bg-amber-500" },
  confirmed:  { label: "Confirmed",  cls: "bg-purple-500/15 text-purple-600 border-purple-500/30",  bar: "bg-purple-500" },
  processing: { label: "Processing", cls: "bg-orange-500/15 text-orange-600 border-orange-500/30",  bar: "bg-orange-500" },
  shipped:    { label: "Shipped",    cls: "bg-blue-500/15 text-blue-600 border-blue-500/30",        bar: "bg-blue-500" },
  delivered:  { label: "Delivered",  cls: "bg-green-500/15 text-green-600 border-green-500/30",      bar: "bg-green-500" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-500/15 text-red-600 border-red-500/30 line-through", bar: "bg-red-500" },
}
export const ORDER_STATUSES = Object.keys(ORDER_STATUS_CFG)

export const PLAN_BAR_CLASS: Record<string, string> = {
  starter: "bg-sky-500",
  pro: "bg-primary",
  premium: "bg-amber-500",
}

export const PAYMENT_STATUS_CFG: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:     { label: "Paid",     cls: "bg-green-500/15 text-green-600 border-green-500/30" },
  pending:  { label: "Pending",  cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  failed:   { label: "Failed",   cls: "bg-red-500/15 text-red-600 border-red-500/30" },
  refunded: { label: "Refunded", cls: "bg-muted text-muted-foreground border-border" },
}

// ── Small shared presentational helpers ───────────────────────────────────────

/** Two-letter uppercase initials from a name (falls back to "?"). */
export function initials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Horizontal proportion bar used by the Overview distribution widgets. */
export function BarTrack({ value, total, className }: { value: number; total: number; className: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full transition-all ${className}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Centered empty-state used inside cards. */
export function EmptyHint({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
