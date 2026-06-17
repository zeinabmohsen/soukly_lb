"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Tag, Plus, Pencil, Trash2, Percent, DollarSign, Ticket, Loader2 } from "lucide-react"
import {
  useGetMyPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  type Promotion,
  type DiscountType,
} from "@/store/api/promotionApi"

type FormState = {
  code: string
  description: string
  discount_type: DiscountType
  discount_value: string
  min_order_amount: string
  max_discount: string
  usage_limit: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "",
  max_discount: "",
  usage_limit: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
}

// "2026-06-17T..." → "2026-06-17" for <input type="date">
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "")
const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s))

function promoStatus(p: Promotion): { label: string; cls: string } {
  if (!p.is_active) return { label: "Disabled", cls: "bg-muted text-muted-foreground border-border" }
  const now = Date.now()
  if (p.starts_at && new Date(p.starts_at).getTime() > now)
    return { label: "Scheduled", cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" }
  if (p.ends_at && new Date(p.ends_at).getTime() < now)
    return { label: "Expired", cls: "bg-red-500/15 text-red-600 border-red-500/30" }
  if (p.usage_limit != null && p.used_count >= p.usage_limit)
    return { label: "Used up", cls: "bg-red-500/15 text-red-600 border-red-500/30" }
  return { label: "Active", cls: "bg-green-500/15 text-green-600 border-green-500/30" }
}

function discountLabel(p: Pick<Promotion, "discount_type" | "discount_value">) {
  return p.discount_type === "percentage"
    ? `${p.discount_value}% off`
    : `$${Number(p.discount_value).toFixed(2)} off`
}

export default function SellerPromotionsPage() {
  const { isSeller } = useAuth()
  const { toast } = useToast()
  const { data: promotions = [], isLoading } = useGetMyPromotionsQuery(undefined, { skip: !isSeller })
  const [deletePromotion] = useDeletePromotionMutation()
  const [updatePromotion] = useUpdatePromotionMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [toDelete, setToDelete] = useState<Promotion | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const active = promotions.filter((p) => promoStatus(p).label === "Active").length
    const redemptions = promotions.reduce((sum, p) => sum + p.used_count, 0)
    return { total: promotions.length, active, redemptions }
  }, [promotions])

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (p: Promotion) => { setEditing(p); setDialogOpen(true) }

  const handleToggle = async (p: Promotion) => {
    setTogglingId(p.id)
    try {
      await updatePromotion({ id: p.id, is_active: !p.is_active }).unwrap()
    } catch (e) {
      toast({ title: "Couldn't update", description: errMsg(e), variant: "destructive" })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deletePromotion(toDelete.id).unwrap()
      toast({ title: "Code deleted" })
    } catch (e) {
      toast({ title: "Couldn't delete", description: errMsg(e), variant: "destructive" })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create discount codes buyers enter at checkout.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start">
          <Plus className="w-4 h-4" /> New code
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatTile icon={Ticket} label="Codes" value={isLoading ? "—" : String(stats.total)} />
        <StatTile icon={Tag} label="Active" value={isLoading ? "—" : String(stats.active)} />
        <StatTile icon={DollarSign} label="Redemptions" value={isLoading ? "—" : String(stats.redemptions)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Your codes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-semibold">No discount codes yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a code like <span className="font-mono font-semibold">WELCOME10</span> to reward your buyers.
              </p>
              <Button onClick={openCreate} variant="outline" className="gap-2 bg-transparent">
                <Plus className="w-4 h-4" /> Create your first code
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {promotions.map((p) => {
                const status = promoStatus(p)
                return (
                  <div key={p.id} className="flex items-center gap-4 p-3 border rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {p.discount_type === "percentage"
                        ? <Percent className="w-4 h-4 text-primary" />
                        : <DollarSign className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                      <div className="min-w-0">
                        <p className="font-mono font-semibold text-sm truncate">{p.code}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.description || discountLabel(p)}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">{discountLabel(p)}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.min_order_amount != null ? `Min $${p.min_order_amount.toFixed(2)}` : "No minimum"}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm">
                          {p.used_count}{p.usage_limit != null ? ` / ${p.usage_limit}` : ""} used
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.ends_at ? `Ends ${new Date(p.ends_at).toLocaleDateString()}` : "No expiry"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={status.cls}>{status.label}</Badge>
                      <Switch
                        checked={p.is_active}
                        disabled={togglingId === p.id}
                        onCheckedChange={() => handleToggle(p)}
                        aria-label="Toggle active"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setToDelete(p)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PromotionDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => { if (!o) setToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete code “{toDelete?.code}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Buyers will no longer be able to use this code. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function errMsg(e: unknown): string | undefined {
  return (e as { data?: { message?: string } })?.data?.message
}

function PromotionDialog({
  open,
  editing,
  onClose,
}: {
  open: boolean
  editing: Promotion | null
  onClose: () => void
}) {
  const { toast } = useToast()
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation()
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation()
  const saving = isCreating || isUpdating

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  // Re-seed the form whenever the dialog opens for a different promotion.
  const [seededFor, setSeededFor] = useState<string | null>(null)
  const key = editing?.id ?? "new"
  if (open && seededFor !== key) {
    setSeededFor(key)
    setForm(
      editing
        ? {
            code: editing.code,
            description: editing.description ?? "",
            discount_type: editing.discount_type,
            discount_value: String(editing.discount_value),
            min_order_amount: editing.min_order_amount != null ? String(editing.min_order_amount) : "",
            max_discount: editing.max_discount != null ? String(editing.max_discount) : "",
            usage_limit: editing.usage_limit != null ? String(editing.usage_limit) : "",
            starts_at: toDateInput(editing.starts_at),
            ends_at: toDateInput(editing.ends_at),
            is_active: editing.is_active,
          }
        : EMPTY_FORM,
    )
  }
  if (!open && seededFor !== null) setSeededFor(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) return toast({ title: "Enter a code", variant: "destructive" })
    const value = Number(form.discount_value)
    if (!form.discount_value || Number.isNaN(value) || value <= 0)
      return toast({ title: "Enter a discount value", variant: "destructive" })
    if (form.discount_type === "percentage" && value > 100)
      return toast({ title: "Percentage can't exceed 100", variant: "destructive" })

    const payload = {
      code: form.code.trim(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: value,
      min_order_amount: numOrNull(form.min_order_amount),
      max_discount: form.discount_type === "percentage" ? numOrNull(form.max_discount) : null,
      usage_limit: numOrNull(form.usage_limit),
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active,
    }

    try {
      if (editing) {
        await updatePromotion({ id: editing.id, ...payload }).unwrap()
        toast({ title: "Code updated" })
      } else {
        await createPromotion(payload).unwrap()
        toast({ title: "Code created" })
      }
      onClose()
    } catch (err) {
      toast({ title: "Couldn't save", description: errMsg(err), variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit code" : "New discount code"}</DialogTitle>
          <DialogDescription>
            Buyers enter this code at checkout to get the discount on your store&apos;s order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              placeholder="WELCOME10"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              className="font-mono uppercase"
              autoCapitalize="characters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. New customer welcome"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.discount_type} onValueChange={(v) => set("discount_type", v as DiscountType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                placeholder={form.discount_type === "percentage" ? "10" : "5.00"}
                value={form.discount_value}
                onChange={(e) => set("discount_value", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum order ($)</Label>
              <Input
                id="min"
                type="number"
                min="0"
                step="0.01"
                placeholder="None"
                value={form.min_order_amount}
                onChange={(e) => set("min_order_amount", e.target.value)}
              />
            </div>
            {form.discount_type === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="max">Max discount ($)</Label>
                <Input
                  id="max"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No cap"
                  value={form.max_discount}
                  onChange={(e) => set("max_discount", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="limit">Usage limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                step="1"
                placeholder="Unlimited"
                value={form.usage_limit}
                onChange={(e) => set("usage_limit", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Starts</Label>
              <Input id="start" type="date" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Ends</Label>
              <Input id="end" type="date" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
              <p className="text-xs text-muted-foreground">Buyers can use the code while it&apos;s active.</p>
            </div>
            <Switch id="active" checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Save changes" : "Create code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
