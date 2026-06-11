"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Sparkles, Check, Loader2, AlertCircle, ArrowRight, Star, ShieldCheck, Save, MapPin, Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCreateStoreMutation, useGetStoresQuery } from "@/store/api/storeApi"
import { useGetCategoriesQuery } from "@/store/api/categoriesApi"
import { useGetMeQuery } from "@/store/api/authApi"
import {
  useGetMySellerDraftQuery,
  useUpdateMySellerDraftMutation,
  useDeleteMySellerDraftMutation,
} from "@/store/api/userApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { selectAccessToken, setCredentials } from "@/store/slices/authSlice"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { PLANS, getPlan, isValidPlanId, TRIAL_DAYS, type PlanId } from "@/lib/plans"
import { SellerFunnelSteps } from "@/components/seller-funnel-steps"
import { InlineAuth } from "@/components/inline-auth"

const CITIES = ["Beirut", "Tripoli", "Sidon", "Tyre", "Zahle", "Jounieh", "Byblos", "Baalbek"]
const DRAFT_SAVE_DEBOUNCE_MS = 800

type FormData = {
  businessName: string
  businessCategory: string  // global category UUID
  city: string
  businessDescription: string
  agreedToTerms: boolean
}

const EMPTY: FormData = {
  businessName: "",
  businessCategory: "",
  city: "",
  businessDescription: "",
  agreedToTerms: false,
}

// True if the user has entered at least one meaningful value. The terms
// checkbox doesn't count — we don't persist it anyway.
function hasDraftContent(d: FormData): boolean {
  return Boolean(
    d.businessName.trim() ||
    d.businessCategory ||
    d.city ||
    d.businessDescription.trim(),
  )
}

export default function SellerApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { isAuthenticated, isSeller, user } = useAuth()
  const accessToken = useAppSelector(selectAccessToken)

  const { data: categoriesData } = useGetCategoriesQuery()
  const categories = categoriesData?.data ?? []

  const { data: storesPage } = useGetStoresQuery({ limit: 1 })
  const totalStores = storesPage?.total ?? null

  const planParam = searchParams.get("plan")
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(
    planParam && isValidPlanId(planParam) ? planParam : "starter",
  )
  const selectedPlan = useMemo(() => getPlan(selectedPlanId), [selectedPlanId])

  const [createStore, { isLoading: isSubmitting }] = useCreateStoreMutation()
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState("")
  const [skipGetMe, setSkipGetMe] = useState(true)
  const { data: meData } = useGetMeQuery(undefined, { skip: skipGetMe })

  // DB-backed draft (replaces old localStorage approach). Only fetches when
  // authenticated — unauthenticated users see the inline auth card first.
  const { data: draftResp, isSuccess: draftLoaded } = useGetMySellerDraftQuery(undefined, {
    skip: !isAuthenticated,
  })
  const [saveDraft] = useUpdateMySellerDraftMutation()
  const [clearDraftRemote] = useDeleteMySellerDraftMutation()

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftHydrated, setDraftHydrated] = useState(false)
  const [formData, setFormData] = useState<FormData>(EMPTY)

  // Hydrate form from the server draft once it loads. Sets the "restored"
  // banner only if the draft actually contains user content.
  useEffect(() => {
    if (!draftLoaded || draftHydrated) return
    const incoming = draftResp?.draft
    if (incoming && typeof incoming === "object") {
      const merged = { ...EMPTY, ...incoming, agreedToTerms: false }
      setFormData(merged)
      if (hasDraftContent(merged)) setDraftRestored(true)
    }
    setDraftHydrated(true)
  }, [draftLoaded, draftResp, draftHydrated])

  // Debounced auto-save to DB. Skipped until hydration finishes (so we don't
  // clobber the server draft with the initial EMPTY state) and after submit.
  useEffect(() => {
    if (!isAuthenticated || !draftHydrated || submitted) return
    const handle = setTimeout(() => {
      const { agreedToTerms, ...rest } = formData
      if (hasDraftContent(formData)) {
        saveDraft(rest).unwrap().catch(() => { /* next change will retry */ })
      } else {
        // Form empty → reflect that on server. Fire-and-forget.
        clearDraftRemote().unwrap().catch(() => {})
      }
    }, DRAFT_SAVE_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [formData, isAuthenticated, draftHydrated, submitted, saveDraft, clearDraftRemote])

  // Refresh user data after submission so isSeller flips
  useEffect(() => {
    if (meData?.user && accessToken && submitted) {
      dispatch(setCredentials({ user: meData.user, accessToken }))
      setSkipGetMe(true)
    }
  }, [meData, accessToken, submitted, dispatch])

  // Already approved seller → straight to dashboard
  useEffect(() => {
    if (isSeller) router.push("/seller/dashboard")
  }, [isSeller, router])

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const markTouched = (field: keyof FormData) => setTouched((p) => ({ ...p, [field]: true }))

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.businessCategory),
    [categories, formData.businessCategory],
  )

  const formValid = Boolean(
    formData.businessName.trim() &&
    formData.businessCategory &&
    formData.city &&
    formData.agreedToTerms,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push("/login?redirect=/become-seller")
      return
    }
    // Touch everything so missing-field errors appear
    setTouched({ businessName: true, businessCategory: true, city: true })
    if (!formValid) return

    setApiError("")
    try {
      await createStore({
        name: formData.businessName.trim(),
        description: formData.businessDescription.trim() || null,
        location: formData.city || null,
        global_category_id: formData.businessCategory || null,
        plan_id: selectedPlanId,
      } as never).unwrap()

      // Backend auto-clears the server draft on createMyStore success — no
      // need to call DELETE here. Set submitted so the auto-save effect bails.
      setSubmitted(true)
      setSkipGetMe(false)
      toast({ title: "Application submitted!", description: "We'll review your store within 2-3 business days." })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Submission failed. Please try again."
      setApiError(msg)
    }
  }

  const clearDraft = () => {
    setFormData(EMPTY)
    setTouched({})
    setDraftRestored(false)
    // Auto-save effect will see empty form + fire clearDraftRemote.
    // But call it directly too for immediacy.
    clearDraftRemote().unwrap().catch(() => {})
  }

  // ── Post-submit screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-12 md:pt-40 md:pb-24">
        <div className="max-w-md mx-auto mb-8">
          <SellerFunnelSteps current={3} />
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-10">
            <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-6 ring-8 ring-green-500/5">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 mb-3">Status: Under Review</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">Application submitted</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md flex items-center gap-1.5 justify-center px-4">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>We'll email <span className="font-medium text-foreground">{user?.email}</span> within 2-3 business days.</span>
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-5 md:p-6">
              <h3 className="font-bold text-lg mb-4">What happens next</h3>
              <ol className="space-y-4">
                {[
                  { title: "Admin review", body: "We'll verify your store details. Usually within 2-3 business days." },
                  { title: "Approval email", body: "Once approved, you'll get a link to activate your store with a 30-day free trial." },
                  { title: "Go live", body: `Start your trial → store appears in the marketplace → first ${TRIAL_DAYS} days free, then $${selectedPlan.price}/month on the ${selectedPlan.name} plan.` },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/marketplace")} variant="outline" className="bg-transparent">
              Explore the marketplace
            </Button>
            <Button onClick={() => router.push("/pricing")} className="gap-2">
              See pricing details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Application page (inline auth + form, no redirects) ─────────────────
  const funnelStep: 1 | 2 = isAuthenticated ? 2 : 1

  return (
    <div className="container mx-auto px-4 pt-32 pb-8 md:pt-40 md:pb-16">
      <div className="max-w-md mx-auto mb-6 md:mb-10">
        <SellerFunnelSteps current={funnelStep} />
      </div>

      {/* Hero / value strip */}
      <div className="max-w-5xl mx-auto mb-8 md:mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[11px] md:text-xs font-semibold text-primary mb-3 md:mb-4">
          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
          {TRIAL_DAYS}-day free trial · Cancel anytime
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 md:mb-4 leading-[1.1]">
          Sell on{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Soukly</span>
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          {isAuthenticated
            ? "Just 4 fields + your plan — apply in under a minute."
            : "Create an account, then tell us about your store. All on this page."}
        </p>
      </div>

      {/* Unauthenticated → inline auth, form preview shown alongside */}
      {!isAuthenticated && (
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6 md:gap-8 mb-12">
          <InlineAuth />
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <StorePreview
              name={formData.businessName}
              description={formData.businessDescription}
              category={selectedCategory?.name ?? null}
              city={formData.city}
              initials="?"
            />
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              {totalStores ? `${totalStores}+ stores already on Soukly` : ""}
            </p>
          </aside>
        </div>
      )}

      {/* Draft-restored banner — only when authed, since form is gated */}
      {isAuthenticated && draftRestored && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 border border-border text-sm">
            <Save className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="flex-1 text-muted-foreground">We restored your saved draft.</p>
            <button onClick={clearDraft} className="text-foreground font-medium hover:underline">
              Start over
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && (
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6 md:gap-8">
        {/* Form column */}
        <div className="space-y-5 md:space-y-6">
          {/* Store details card */}
          <Card>
            <CardContent className="p-5 md:p-8 space-y-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Your store</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Tell us what you're selling.</p>
              </div>

              <FieldWrapper
                label="Store name"
                required
                error={touched.businessName && !formData.businessName.trim() ? "Required" : null}
              >
                <Input
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                  onBlur={() => markTouched("businessName")}
                  placeholder="Lina's Boutique"
                  maxLength={60}
                  className="h-11"
                />
              </FieldWrapper>

              <div className="grid sm:grid-cols-2 gap-4">
                <FieldWrapper
                  label="Category"
                  required
                  error={touched.businessCategory && !formData.businessCategory ? "Required" : null}
                >
                  <Select
                    value={formData.businessCategory}
                    onValueChange={(val) => {
                      updateFormData("businessCategory", val)
                      markTouched("businessCategory")
                    }}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="What do you sell?" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
                <FieldWrapper
                  label="City"
                  required
                  error={touched.city && !formData.city ? "Required" : null}
                >
                  <Select
                    value={formData.city}
                    onValueChange={(val) => {
                      updateFormData("city", val)
                      markTouched("city")
                    }}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Where are you based?" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              </div>

              <FieldWrapper label="Short description" hint="Optional · 1–2 sentences">
                <Textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData("businessDescription", e.target.value)}
                  placeholder="Curated Lebanese fashion — handpicked pieces from Beirut to Byblos."
                  rows={3}
                  maxLength={280}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {formData.businessDescription.length}/280
                </div>
              </FieldWrapper>

              <div className="rounded-lg bg-muted/30 border border-border/60 p-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                <span>Add logo, cover image, social links, and products once your store is approved.</span>
              </div>
            </CardContent>
          </Card>

          {/* Plan card */}
          <Card>
            <CardContent className="p-5 md:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Pick your plan</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{TRIAL_DAYS}-day free trial on any plan.</p>
                </div>
                <Link href="/pricing" className="text-xs md:text-sm text-primary hover:underline whitespace-nowrap">
                  Compare plans →
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 md:gap-3">
                {PLANS.map((plan) => {
                  const active = selectedPlanId === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "text-left p-3 md:p-4 rounded-lg border-2 transition-all",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{plan.name}</p>
                        {active && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">${plan.price}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{plan.tagline}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit card */}
          <Card>
            <CardContent className="p-5 md:p-8 space-y-4">
              {apiError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {apiError}
                </div>
              )}

              <label className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/60 cursor-pointer">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => updateFormData("agreedToTerms", Boolean(checked))}
                  className="mt-0.5"
                />
                <span className="text-sm leading-relaxed">
                  I agree to Soukly's <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>, and confirm the information is accurate.
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                disabled={!formValid || isSubmitting}
                className="w-full gap-2 h-12"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Submitting..." : `Submit application · Start with ${selectedPlan.name}`}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Free during admin review · No charge until you start your trial
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live preview column */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <StorePreview
            name={formData.businessName}
            description={formData.businessDescription}
            category={selectedCategory?.name ?? null}
            city={formData.city}
            initials={(formData.businessName || user?.name || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          />
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            {totalStores ? `${totalStores}+ stores already on Soukly` : ""}
          </p>
        </aside>
      </form>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function FieldWrapper({
  label, required, hint, error, children,
}: {
  label: string
  required?: boolean
  hint?: string | null
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  )
}

function StorePreview({
  name, description, category, city, initials,
}: {
  name: string
  description: string
  category: string | null
  city: string
  initials: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live preview</p>
      <Card className="overflow-hidden border-2">
        <div className="relative h-32 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary/40">{initials}</span>
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            New
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-base line-clamp-1">{name || "Your store name"}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
            {description || "Tell shoppers what makes your store special."}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}
              </span>
            )}
            {category && <span>{category}</span>}
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 text-muted-foreground/30" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">New</span>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent text-xs h-7 pointer-events-none">
              Visit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
