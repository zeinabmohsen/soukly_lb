"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Save, Loader2, AlertCircle, ImageIcon, Upload, Plus, Trash2, X,
  Palette, Sparkles, GripVertical,
} from "lucide-react"
import { useGetMyStoreQuery, useGetStoreCategoriesQuery } from "@/store/api/storeApi"
import { useUploadProductImageMutation, type Product, type Customization } from "@/store/api/productApi"
import { useToast } from "@/hooks/use-toast"

export type ProductFormImage = { url: string; alt?: string }
export type ProductFormColor = { name: string; hex: string; image_url?: string }

export interface ProductFormValues {
  name: string
  description: string
  price: string
  compare_at_price: string
  stock: string
  sku: string
  store_category_id: string | null
  status: "active" | "draft"
  is_featured: boolean
  images: ProductFormImage[]
  colors: ProductFormColor[]
  customizations: Customization[]
}

export const emptyFormValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "",
  sku: "",
  store_category_id: null,
  status: "active",
  is_featured: false,
  images: [],
  colors: [],
  customizations: [],
}

export function valuesFromProduct(p: Product): ProductFormValues {
  return {
    name:              p.name,
    description:       p.description ?? "",
    price:             String(p.price),
    compare_at_price:  p.compare_at_price != null ? String(p.compare_at_price) : "",
    stock:             String(p.stock),
    sku:               p.sku ?? "",
    store_category_id: p.store_category_id,
    status:            p.status === "out_of_stock" ? "active" : p.status,
    is_featured:       p.is_featured,
    images:            p.images ?? [],
    colors:            p.colors ?? [],
    customizations:    p.customizations ?? [],
  }
}

interface SellerProductFormProps {
  initialValues?: ProductFormValues
  submitLabel: string
  onSubmit: (payload: SubmitPayload) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  /** Optional trailing card content — e.g. a Danger Zone delete card on the edit page. */
  rightSidebarExtra?: React.ReactNode
}

export type SubmitPayload = {
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  stock: number
  sku: string | null
  store_category_id: string | null
  status: "active" | "draft"
  is_featured: boolean
  images: ProductFormImage[]
  colors: ProductFormColor[]
  customizations: Customization[]
}

export default function SellerProductForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  onCancel,
  rightSidebarExtra,
}: SellerProductFormProps) {
  const { toast } = useToast()
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? emptyFormValues)
  const [error, setError] = useState("")

  // Sync when initial values arrive late (edit page loads product async)
  useEffect(() => {
    if (initialValues) setValues(initialValues)
  }, [initialValues])

  const { data: myStore } = useGetMyStoreQuery()
  const { data: categories } = useGetStoreCategoriesQuery(myStore?.id ?? "", { skip: !myStore?.id })

  const update = <K extends keyof ProductFormValues>(field: K, v: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [field]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!values.name.trim() || !values.price || !values.stock) {
      setError("Please fill in name, price, and stock.")
      return
    }
    if (values.images.length === 0) {
      setError("Please add at least one product image.")
      return
    }
    // Reject incomplete colors / customizations to prevent backend 400s
    for (const c of values.colors) {
      if (!c.name.trim() || !/^#[0-9a-fA-F]{6}$/.test(c.hex)) {
        setError(`Colour "${c.name || "—"}" is incomplete (needs a name and a #rrggbb hex).`)
        return
      }
    }
    for (const x of values.customizations) {
      if (!x.label.trim()) {
        setError("Every customisation option needs a label.")
        return
      }
      if (x.type === "select" && x.options.length === 0) {
        setError(`Customisation "${x.label}" needs at least one option.`)
        return
      }
    }
    try {
      await onSubmit({
        name:              values.name.trim(),
        description:       values.description.trim() || null,
        price:             parseFloat(values.price),
        compare_at_price:  values.compare_at_price ? parseFloat(values.compare_at_price) : null,
        stock:             parseInt(values.stock, 10),
        sku:               values.sku.trim() || null,
        store_category_id: values.store_category_id,
        status:            values.status,
        is_featured:       values.is_featured,
        images:            values.images,
        colors:            values.colors,
        customizations:    values.customizations,
      })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Save failed. Please try again."
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ── Basics ── */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Name, description, price, and stock.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" placeholder="e.g. Hand-thrown ceramic mug"
                  value={values.name} onChange={(e) => update("name", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe what makes this product special…" rows={5}
                  value={values.description} onChange={(e) => update("description", e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input id="price" type="number" step="0.01" min="0"
                    value={values.price} onChange={(e) => update("price", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare">
                    Compare-at Price (USD)
                    <span className="text-xs text-muted-foreground ml-1 font-normal">(crossed out when lower than price)</span>
                  </Label>
                  <Input id="compare" type="number" step="0.01" min="0"
                    value={values.compare_at_price} onChange={(e) => update("compare_at_price", e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input id="stock" type="number" min="0"
                    value={values.stock} onChange={(e) => update("stock", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU <span className="text-xs text-muted-foreground font-normal">(internal)</span></Label>
                  <Input id="sku" placeholder="e.g. KC-MUG-001"
                    value={values.sku} onChange={(e) => update("sku", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={values.store_category_id ?? "__none__"}
                  onValueChange={(v) => update("store_category_id", v === "__none__" ? null : v)}
                >
                  <SelectTrigger id="category"><SelectValue placeholder="Uncategorised" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Uncategorised</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Manage categories on the <a href="/seller/products?tab=categories" className="underline">Categories tab</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Images ── */}
          <ImagesSection
            images={values.images}
            onChange={(imgs) => update("images", imgs)}
          />

          {/* ── Colors ── */}
          <ColorsSection
            colors={values.colors}
            onChange={(colors) => update("colors", colors)}
          />

          {/* ── Customizations ── */}
          <CustomizationsSection
            customizations={values.customizations}
            onChange={(cs) => update("customizations", cs)}
          />
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={values.status} onValueChange={(v) => update("status", v as "active" | "draft")}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active — visible in your store</SelectItem>
                    <SelectItem value="draft">Draft — hidden until you publish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-[11px] text-muted-foreground">Pin to the top of your store</p>
                </div>
                <Switch checked={values.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6 space-y-3">
              <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? "Saving…" : submitLabel}
              </Button>
              {onCancel && (
                <Button type="button" variant="ghost" className="w-full" size="lg" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          {rightSidebarExtra}
        </div>
      </div>
    </form>
  )
}

/* ─── Images ─────────────────────────────────────────────────────────────── */

function ImagesSection({
  images,
  onChange,
}: {
  images: ProductFormImage[]
  onChange: (next: ProductFormImage[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation()
  const [newUrl, setNewUrl] = useState("")
  const { toast } = useToast()

  const addByUrl = () => {
    if (!newUrl.trim()) return
    onChange([...images, { url: newUrl.trim() }])
    setNewUrl("")
  }

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    try {
      const result = await uploadImage(fd).unwrap()
      onChange([...images, { url: result.url }])
      toast({ title: "Image uploaded" })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Upload failed"
      toast({ title: msg, variant: "destructive" })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>The first image is the main one shown on cards and at the top of the product page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />
          <Button type="button" variant="outline" className="gap-2 bg-transparent"
            onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading…" : "Upload image"}
          </Button>
          <span className="text-xs text-muted-foreground">or</span>
          <Input
            placeholder="Paste an image URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
            className="flex-1 min-w-[200px]"
          />
          <Button type="button" variant="outline" onClick={addByUrl} disabled={!newUrl.trim()} className="bg-transparent gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {images.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/40 h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon className="w-10 h-10" />
            <p className="text-sm">No images yet — upload or paste a URL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                <img src={img.url} alt={img.alt ?? "Product image"} className="w-full h-full object-cover" />
                {i === 0 && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Main</Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between gap-1 p-1.5 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => move(i, i - 1)} disabled={i === 0} title="Move up">
                      <GripVertical className="w-3.5 h-3.5 rotate-90" />
                    </Button>
                  </div>
                  <Button type="button" size="icon" variant="destructive" className="h-7 w-7"
                    onClick={() => onChange(images.filter((_, j) => j !== i))} title="Remove">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Colors ─────────────────────────────────────────────────────────────── */

function ColorsSection({
  colors,
  onChange,
}: {
  colors: ProductFormColor[]
  onChange: (next: ProductFormColor[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation()
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const add = () => onChange([...colors, { name: "", hex: "#000000" }])
  const updateAt = (i: number, patch: Partial<ProductFormColor>) =>
    onChange(colors.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const removeAt = (i: number) => onChange(colors.filter((_, j) => j !== i))

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploadingIndex === null) return
    const fd = new FormData()
    fd.append("file", file)
    const i = uploadingIndex
    try {
      const result = await uploadImage(fd).unwrap()
      updateAt(i, { image_url: result.url })
      toast({ title: "Colour image uploaded" })
    } catch {
      toast({ title: "Upload failed", variant: "destructive" })
    } finally {
      setUploadingIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" />Colours</CardTitle>
        <CardDescription>Optional. Show buyers a swatch row on cards and a picker on the product page. Each colour can have its own photo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleColorImageUpload}
          className="hidden"
        />

        {colors.length === 0 && (
          <p className="text-sm text-muted-foreground">No colours yet.</p>
        )}

        {colors.map((c, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/20">
            <div className="relative w-9 h-9 rounded-md ring-1 ring-black/15 flex-shrink-0 overflow-hidden">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span className="block w-full h-full" style={{ backgroundColor: c.hex }} />
              )}
            </div>
            <Input
              placeholder="Colour name"
              value={c.name}
              onChange={(e) => updateAt(i, { name: e.target.value })}
              className="flex-1 min-w-[140px] h-9"
            />
            <Input
              type="color"
              value={c.hex}
              onChange={(e) => updateAt(i, { hex: e.target.value })}
              className="h-9 w-14 p-1 cursor-pointer"
              title="Hex colour"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent gap-1.5"
              onClick={() => { setUploadingIndex(i); fileInputRef.current?.click() }}
              disabled={isUploading}
            >
              {isUploading && uploadingIndex === i ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {c.image_url ? "Replace photo" : "Add photo"}
            </Button>
            {c.image_url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => updateAt(i, { image_url: undefined })}>
                Clear
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => removeAt(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" className="gap-2 bg-transparent" onClick={add}>
          <Plus className="w-4 h-4" /> Add colour
        </Button>
      </CardContent>
    </Card>
  )
}

/* ─── Customizations ─────────────────────────────────────────────────────── */

function CustomizationsSection({
  customizations,
  onChange,
}: {
  customizations: Customization[]
  onChange: (next: Customization[]) => void
}) {
  const addText = () =>
    onChange([...customizations, { type: "text", label: "", required: false, max_length: 50 }])
  const addSelect = () =>
    onChange([...customizations, { type: "select", label: "", required: false, options: [] }])

  const updateAt = (i: number, patch: Partial<Customization>) =>
    onChange(customizations.map((c, j) => (j === i ? { ...c, ...patch } as Customization : c)))
  const removeAt = (i: number) => onChange(customizations.filter((_, j) => j !== i))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-600" />Customisations</CardTitle>
        <CardDescription>Optional. Let buyers personalise this product — engraving text, wood type, scent, etc.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {customizations.length === 0 && (
          <p className="text-sm text-muted-foreground">No customisations yet.</p>
        )}

        {customizations.map((c, i) => (
          <div key={i} className="border rounded-lg bg-muted/20 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{c.type}</Badge>
              <Input
                placeholder={c.type === "text" ? "e.g. Engraving" : "e.g. Wood type"}
                value={c.label}
                onChange={(e) => updateAt(i, { label: e.target.value })}
                className="flex-1 h-9"
              />
              <div className="flex items-center gap-1.5 text-xs">
                <Switch checked={!!c.required} onCheckedChange={(v) => updateAt(i, { required: v })} />
                <span className="text-muted-foreground">Required</span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => removeAt(i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <Input
                placeholder="Help text (optional)"
                value={c.help ?? ""}
                onChange={(e) => updateAt(i, { help: e.target.value || undefined })}
                className="h-9"
              />
              {c.type === "text" ? (
                <Input
                  placeholder="Max length (e.g. 30)"
                  type="number"
                  min={1}
                  value={c.max_length ?? ""}
                  onChange={(e) => updateAt(i, { max_length: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="h-9"
                />
              ) : (
                <Input
                  placeholder="Options (comma-separated)"
                  value={c.options.join(", ")}
                  onChange={(e) => updateAt(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="h-9"
                />
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2 bg-transparent" onClick={addText}>
            <Plus className="w-4 h-4" /> Text field
          </Button>
          <Button type="button" variant="outline" className="gap-2 bg-transparent" onClick={addSelect}>
            <Plus className="w-4 h-4" /> Dropdown
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
