"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Monitor,
  Smartphone,
  ArrowLeft,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Check,
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  Youtube,
  Twitter,
  Music2,
  ExternalLink,
  Megaphone,
  Newspaper,
  Clock,
  CreditCard,
  Link2,
  Layout,
  Type,
  Paintbrush,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Squircle,
  Circle,
  ChevronDown,
  Store,
  Palette,
  Sparkles,
  Star,
  Search,
  Package,
} from "lucide-react"
import { useGetMyStoreQuery, useUpdateMyStoreMutation, useUploadStoreImageMutation } from "@/store/api/storeApi"
import { ProductCard } from "@/components/shared/product-card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  StorefrontHero,
  StorefrontFooter,
  StorefrontAnnouncementBar,
  StorefrontAbout,
  StorefrontNav,
  StorefrontTrustBadges,
  GoogleFontsLoader,
  storeToView,
  themeTokens,
  fontFamily,
  ALL_PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  FONT_PRESETS,
  TRUST_BADGE_PRESETS,
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_SECONDARY_CTA,
  DEFAULT_ABOUT,
  DEFAULT_PRODUCTS_SECTION,
  DEFAULT_NEWSLETTER,
  DEFAULT_NAV,
  DEFAULT_THEME,
  DEFAULT_FONTS,
  DEFAULT_BG_COLORS,
  DEFAULT_HERO_VARIANT,
  DEFAULT_TRUST_BADGES,
  DEFAULT_FOOTER_COLORS,
  type StorefrontView,
  type TemplateId,
  type FooterColumn,
  type PaymentMethod,
  type TrustBadgeKey,
  type TrustBadgeItem,
  type Theme,
  type Fonts,
  type BgColors,
  type HeroVariant,
  type AboutTemplate,
  type FooterStyle,
  type FooterColors,
  type FooterAlign,
} from "@/components/storefront/storefront-view"

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreData = StorefrontView

// ─── Static data ──────────────────────────────────────────────────────────────

type TemplateMeta = {
  id:         TemplateId
  name:       string
  description: string
  badge?:     string
  /** This template renders a hero background image when one is uploaded. */
  usesImage?: boolean
  /** This template renders a looping hero background video when one is uploaded. */
  usesVideo?: boolean
}

const TEMPLATES: TemplateMeta[] = [
  { id: "minimal",    name: "Minimal",    description: "Clean, airy, timeless" },
  { id: "bold",       name: "Bold",       description: "Full-gradient statement" },
  { id: "elegant",    name: "Elegant",    description: "Split layout with image",            usesImage: true, usesVideo: true },
  { id: "modern",     name: "Modern",     description: "Dark asymmetric bento" },
  { id: "cinematic",  name: "Cinematic",  description: "Full-bleed letterbox",               usesImage: true, usesVideo: true },
  { id: "glass",      name: "Glass",      description: "Frosted card over vivid gradient", badge: "New" },
  { id: "geometric",  name: "Geometric",  description: "Bold shapes, editorial text",        badge: "New" },
  { id: "luxury",     name: "Luxury",     description: "Ultra-premium dark aesthetic",        badge: "New" },
  { id: "wave",       name: "Wave",       description: "Organic wave, soft & modern",         badge: "New" },
  { id: "magazine",   name: "Magazine",   description: "Oversized typographic watermark",     badge: "New" },
  { id: "showcase",   name: "Showcase",   description: "Full-bleed image, photo-only",        badge: "New", usesImage: true },
  { id: "reel",       name: "Reel",       description: "Full-bleed video loop, video-only",   badge: "New", usesVideo: true },
]

const COLOR_PRESETS = [
  { name: "Purple Dream",  primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Ocean Blue",    primary: "#0EA5E9", secondary: "#06B6D4" },
  { name: "Sunset",        primary: "#F97316", secondary: "#EF4444" },
  { name: "Forest",        primary: "#059669", secondary: "#0D9488" },
  { name: "Rose Gold",     primary: "#E11D74", secondary: "#FB923C" },
  { name: "Deep Indigo",   primary: "#4F46E5", secondary: "#7C3AED" },
  { name: "Coral Bliss",   primary: "#F43F5E", secondary: "#FB923C" },
  { name: "Golden Luxe",   primary: "#D97706", secondary: "#B45309" },
]

const DEFAULT_DATA: StoreData = {
  storeName: "Lina's Boutique",
  tagline: "Handcrafted with love, made for you",
  description:
    "Discover our curated collection of handcrafted Lebanese goods — from hand-embroidered textiles to artisanal ceramics.",
  logoUrl: "",
  heroImage: "",
  ctaText: "Shop Now",
  ctaLink: "#products",
  secondaryCta: { ...DEFAULT_SECONDARY_CTA },
  template: "minimal",
  primaryColor: "#8B5CF6",
  secondaryColor: "#EC4899",
  fontFamily: "modern",
  rtl: false,
  heroVariant:  { ...DEFAULT_HERO_VARIANT },
  nav:          { ...DEFAULT_NAV, links: [...DEFAULT_NAV.links] },
  theme:        { ...DEFAULT_THEME },
  fonts:        { ...DEFAULT_FONTS },
  bgColors:     { ...DEFAULT_BG_COLORS },
  announcement: { ...DEFAULT_ANNOUNCEMENT },
  aboutSection:    { ...DEFAULT_ABOUT },
  productsSection: { ...DEFAULT_PRODUCTS_SECTION },
  trustBadges:     { ...DEFAULT_TRUST_BADGES, items: [...DEFAULT_TRUST_BADGES.items] },
  showFooter: true,
  footerStyle: "dark" as FooterStyle,
  footerColors: { ...DEFAULT_FOOTER_COLORS },
  footerAlign: "left" as FooterAlign,
  footerCopyright: "",
  footerAbout: "A Lebanese boutique bringing handcrafted beauty to your home.",
  footerEmail: "hello@linasboutique.com",
  footerPhone: "+961 1 234 567",
  footerWhatsapp: "+96171234567",
  footerAddress: "Mar Mikhael, Beirut, Lebanon",
  businessHours: "",
  showSocial: true,
  socialFacebook: "",
  socialInstagram: "",
  socialTiktok: "",
  socialYoutube: "",
  socialTwitter: "",
  footerColumns: [],
  newsletter: { ...DEFAULT_NEWSLETTER },
  paymentMethods: [],
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreBuilder() {
  const { toast } = useToast()
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  // Mobile-only pane toggle: which panel is visible below the lg breakpoint.
  // On lg+ both panels show side-by-side regardless.
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")
  const [storeData, setStoreData] = useState<StoreData>(DEFAULT_DATA)
  // Template filter — narrows the hero template grid by media requirement.
  const [templateFilter, setTemplateFilter] = useState<"all" | "none" | "photo" | "video" | "both">("all")
  const { data: storeApiData } = useGetMyStoreQuery()
  const [updateMyStore, { isLoading: isSaving }] = useUpdateMyStoreMutation()

  // Snapshot of the last saved state — used to detect unsaved changes.
  // JSON-serialized so deep equality is a single string compare.
  const savedSnapshotRef = useRef<string>("")
  // Re-render trigger for the dirty status pill — updates whenever storeData changes.
  const dirtyKey = JSON.stringify(storeData)
  const isDirty = !!savedSnapshotRef.current && dirtyKey !== savedSnapshotRef.current

  // Ref to the scrollable preview body. Used by `focusPreview` to scroll the
  // preview to a specific section + briefly pulse it, so sellers can see
  // exactly what a layout option changed (otherwise the visual diff can be too
  // subtle to catch on a 1200px preview pane).
  const previewBodyRef = useRef<HTMLDivElement>(null)
  const focusPreview = (anchor: string) => {
    const container = previewBodyRef.current
    if (!container) return
    const el = container.querySelector<HTMLElement>(`#${anchor}, [data-sb-anchor="${anchor}"]`)
    if (!el) return
    // Container-scoped scroll (scrollIntoView would scroll the whole page).
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const offset = elRect.top - containerRect.top + container.scrollTop - 24
    container.scrollTo({ top: offset, behavior: "smooth" })
    el.setAttribute("data-sb-pulse", "")
    setTimeout(() => el.removeAttribute("data-sb-pulse"), 1500)
  }

  useEffect(() => {
    if (!storeApiData) return
    // storeToView already handles all the JSONB unpacking with safe defaults.
    // We strip ctaHref so the builder preview's primary button stays click-inert.
    const next = { ...storeToView(storeApiData), ctaHref: undefined }
    setStoreData(next)
    savedSnapshotRef.current = JSON.stringify(next)
  }, [storeApiData])

  const update = <K extends keyof StoreData>(field: K, value: StoreData[K]) =>
    setStoreData((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    try {
      await updateMyStore({
        name:        storeData.storeName,
        description: storeData.description || null,
        logo_url:    storeData.logoUrl     || null,
        cover_url:   storeData.heroImage   || null,
        instagram:   storeData.socialInstagram || null,
        facebook:    storeData.socialFacebook  || null,
        tiktok:      storeData.socialTiktok    || null,
        whatsapp:    storeData.footerWhatsapp  || null,
        hero: {
          tagline:        storeData.tagline,
          ctaText:        storeData.ctaText,
          ctaLink:        storeData.ctaLink,
          secondaryCta:   storeData.secondaryCta,
          template:       storeData.template,
          primaryColor:   storeData.primaryColor,
          secondaryColor: storeData.secondaryColor,
          fontFamily:     storeData.fontFamily,
          rtl:            storeData.rtl,
          heroVariant:    storeData.heroVariant,
          nav:            storeData.nav,
          theme:          storeData.theme,
          fonts:          storeData.fonts,
          bgColors:       storeData.bgColors,
          announcement:   storeData.announcement,
          aboutSection:    storeData.aboutSection,
          productsSection: storeData.productsSection,
          trustBadges:     storeData.trustBadges,
        },
        footer: {
          showFooter:      storeData.showFooter,
          footerStyle:     storeData.footerStyle,
          footerColors:    storeData.footerColors,
          footerAlign:     storeData.footerAlign,
          footerCopyright: storeData.footerCopyright,
          footerAbout:    storeData.footerAbout,
          footerEmail:    storeData.footerEmail,
          footerPhone:    storeData.footerPhone,
          footerAddress:  storeData.footerAddress,
          businessHours:  storeData.businessHours,
          showSocial:     storeData.showSocial,
          socialYoutube:  storeData.socialYoutube,
          socialTwitter:  storeData.socialTwitter,
          footerColumns:  storeData.footerColumns,
          newsletter:     storeData.newsletter,
          paymentMethods: storeData.paymentMethods,
        },
      } as never).unwrap()
      // Mark current state as the saved snapshot so the dirty pill flips back to "Saved".
      savedSnapshotRef.current = JSON.stringify(storeData)
      toast({ title: "Store saved!", description: "Your storefront has been updated." })
    } catch {
      toast({ title: "Save failed", description: "Could not save store. Please try again.", variant: "destructive" })
    }
  }

  // Cmd/Ctrl+S to save — only when there are unsaved changes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!isSaving && isDirty) handleSave()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // We intentionally re-bind when isDirty/isSaving change so the closure captures the latest values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, isSaving, dirtyKey])

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  return (
    <div className="h-screen bg-muted/30 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="border-b bg-background z-50 shadow-sm shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-sm">Store Builder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Customize your storefront</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save status pill — visible on md+ to avoid header crowding */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Saving…</span>
                </>
              ) : isDirty ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-amber-700">Unsaved</span>
                </>
              ) : savedSnapshotRef.current ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Saved</span>
                </>
              ) : null}
            </div>

            {/* Mobile-only Edit / Preview pane toggle (hidden on lg+ where both panes show side-by-side) */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 lg:hidden">
              <Button
                variant={mobileView === "edit" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setMobileView("edit")}
              >
                Edit
              </Button>
              <Button
                variant={mobileView === "preview" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setMobileView("preview")}
              >
                Preview
              </Button>
            </div>

            {/* Desktop-only preview frame switcher (Desktop / Mobile preview width). */}
            <div className="hidden lg:flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </Button>
            </div>

            {storeApiData?.slug && (
              <Link href={`/store/${storeApiData.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 px-3 hidden md:inline-flex">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View public page
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" aria-label="View public page">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel ── */}
        <aside
          className={cn(
            "w-full lg:w-[360px] shrink-0 border-r bg-background overflow-y-auto",
            mobileView === "preview" && "hidden lg:block",
          )}
        >
          <div className="p-4 space-y-3">
            {/* ─── STORE ─── */}
            <GroupHeader label="Store" />

            <SectionCard
              icon={Store}
              title="Store Identity"
              hint="Name, tagline, description, logo & store media"
              defaultOpen
            >
              <Field label="Store Name">
                <Input
                  value={storeData.storeName}
                  onChange={(e) => update("storeName", e.target.value)}
                  placeholder="e.g. Lina's Boutique"
                />
              </Field>

              <Field label="Tagline">
                <Input
                  value={storeData.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="A short memorable phrase"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={storeData.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Tell visitors about your store"
                  rows={3}
                />
              </Field>

              <ImageUploadField
                label="Store Image"
                value={storeData.heroImage}
                aspect="wide"
                hint="Shown on your store card in the marketplace listing"
                onUploaded={(url) => update("heroImage", url)}
              />
            </SectionCard>


            <SectionCard
              icon={Type}
              title="Typography"
              hint="Pick fonts for your headings and body text"
            >
              <Field label="Heading Font">
                <Select
                  value={storeData.fonts.headingFont}
                  onValueChange={(v) => update("fonts", { ...storeData.fonts, headingFont: v })}
                >
                  <SelectTrigger>
                    <span style={{ fontFamily: fontFamily(storeData.fonts.headingFont) }}>
                      {FONT_PRESETS.find((f) => f.id === storeData.fonts.headingFont)?.label ?? "System"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_PRESETS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        <span style={{ fontFamily: f.family }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Body Font">
                <Select
                  value={storeData.fonts.bodyFont}
                  onValueChange={(v) => update("fonts", { ...storeData.fonts, bodyFont: v })}
                >
                  <SelectTrigger>
                    <span style={{ fontFamily: fontFamily(storeData.fonts.bodyFont) }}>
                      {FONT_PRESETS.find((f) => f.id === storeData.fonts.bodyFont)?.label ?? "System"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_PRESETS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        <span style={{ fontFamily: f.family }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Live preview — heading + body sample using the chosen fonts */}
              <div className="rounded-xl border bg-gradient-to-br from-muted/40 to-background p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Preview
                </p>
                <h3
                  className="text-2xl font-bold leading-tight tracking-tight"
                  style={{ fontFamily: fontFamily(storeData.fonts.headingFont) }}
                >
                  {storeData.storeName || "Your Store Name"}
                </h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: fontFamily(storeData.fonts.bodyFont) }}
                >
                  The quick brown fox jumps over the lazy dog. 0123456789.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              icon={Layout}
              title="Layout & Theme"
              hint="Border radius, container width, spacing, card style, RTL"
            >
              <Field label="Border Radius">
                <div className="grid grid-cols-3 gap-1.5 rounded-lg border bg-muted/30 p-1">
                  {([
                    { v: "sharp",   label: "Sharp",   Icon: Square },
                    { v: "rounded", label: "Rounded", Icon: Squircle },
                    { v: "pill",    label: "Pill",    Icon: Circle },
                  ] as const).map(({ v, label, Icon }) => {
                    const active = storeData.theme.borderRadius === v
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => update("theme", { ...storeData.theme, borderRadius: v })}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
                          active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Page Width">
                <p className="text-[11px] text-muted-foreground mb-2 -mt-1 leading-snug">
                  How wide your content sits on big screens. Narrow keeps things focused; wide fits more products per row.
                </p>
                <ContainerWidthPicker
                  value={storeData.theme.containerWidth}
                  onChange={(v) => {
                    update("theme", { ...storeData.theme, containerWidth: v })
                    focusPreview("products")
                  }}
                />
              </Field>

              <Field label="Space Between Sections">
                <p className="text-[11px] text-muted-foreground mb-2 -mt-1 leading-snug">
                  How much breathing room between Hero / About / Products / Footer. More space = more scrolling but a calmer feel.
                </p>
                <SectionSpacingPicker
                  value={storeData.theme.sectionSpacing}
                  onChange={(v) => {
                    update("theme", { ...storeData.theme, sectionSpacing: v })
                    focusPreview("products")
                  }}
                />
              </Field>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Arabic / RTL Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Right-to-left layout for Arabic</p>
                  </div>
                  <Switch checked={storeData.rtl} onCheckedChange={(v) => update("rtl", v)} />
                </div>
              </div>
            </SectionCard>

            {/* ─── PAGE SECTIONS ─── */}
            <GroupHeader label="Page Sections" />

            <SectionCard
              icon={Megaphone}
              title="Announcement Bar"
              hint="A thin strip at the very top — great for promos, free shipping, or new collection alerts."
              enabled={storeData.announcement.enabled}
              onToggle={(v) => update("announcement", { ...storeData.announcement, enabled: v })}
              onReset={() => update("announcement", { ...DEFAULT_ANNOUNCEMENT, enabled: true })}
            >
              <Field label="Message">
                <Input
                  value={storeData.announcement.text}
                  onChange={(e) => update("announcement", { ...storeData.announcement, text: e.target.value })}
                  placeholder="Free shipping on orders over $50"
                />
              </Field>
              <Field label="Link (optional)">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    value={storeData.announcement.link}
                    onChange={(e) => update("announcement", { ...storeData.announcement, link: e.target.value })}
                    placeholder="#products or https://…"
                  />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Background">
                  <Input
                    type="color"
                    value={storeData.announcement.bgColor}
                    onChange={(e) => update("announcement", { ...storeData.announcement, bgColor: e.target.value })}
                    className="h-10 w-full cursor-pointer p-1"
                  />
                </Field>
                <Field label="Text">
                  <Input
                    type="color"
                    value={storeData.announcement.textColor}
                    onChange={(e) => update("announcement", { ...storeData.announcement, textColor: e.target.value })}
                    className="h-10 w-full cursor-pointer p-1"
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="Hero"
              hint="Template, media, buttons, text alignment & overlay — everything for your top-of-page block"
            >
              {/* ── Sub-section: Template & Media ── */}
              {(() => {
                const filters = [
                  { id: "all"   as const, label: "All",      match: () =>  true },
                  { id: "none"  as const, label: "No media", match: (t: TemplateMeta) => !t.usesImage && !t.usesVideo },
                  { id: "photo" as const, label: "Photo",    match: (t: TemplateMeta) =>  !!t.usesImage && !t.usesVideo },
                  { id: "video" as const, label: "Video",    match: (t: TemplateMeta) =>  !t.usesImage && !!t.usesVideo },
                  { id: "both"  as const, label: "Both",     match: (t: TemplateMeta) =>  !!t.usesImage && !!t.usesVideo },
                ]
                const visible = TEMPLATES.filter((t) => filters.find((f) => f.id === templateFilter)?.match(t) ?? true)
                const active  = TEMPLATES.find((t) => t.id === storeData.template)

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Template</p>
                    </div>

                    {/* Filter chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {filters.map((f) => {
                        const count = TEMPLATES.filter(f.match).length
                        const isActive = templateFilter === f.id
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setTemplateFilter(f.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors",
                              isActive
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:bg-muted/70",
                            )}
                          >
                            {f.label}
                            <span className={cn("ml-1 font-normal", isActive ? "opacity-70" : "opacity-60")}>
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Templates grid — internal scroll so the media upload below stays visible */}
                    <div className="max-h-[360px] overflow-y-auto rounded-lg border bg-muted/20 p-2">
                      {visible.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic text-center py-4">
                          No templates match this filter.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {visible.map((t) => (
                            <TemplateCard
                              key={t.id}
                              template={t}
                              selected={storeData.template === t.id}
                              primaryColor={storeData.primaryColor}
                              secondaryColor={storeData.secondaryColor}
                              onClick={() => update("template", t.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Conditional media upload for the active template */}
                    {!active || (!active.usesImage && !active.usesVideo) ? (
                      <p className="text-[11px] text-muted-foreground italic text-center pt-1">
                        {active?.name ?? "Selected template"} uses a generated background — no media needed.
                      </p>
                    ) : (
                      <div className="space-y-3 rounded-lg border bg-primary/5 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                          Media for {active.name}
                        </p>
                        {active.usesImage && (
                          <ImageUploadField
                            label="Hero Image"
                            value={storeData.heroVariant.imageUrl}
                            aspect="wide"
                            hint={
                              active.usesVideo
                                ? "Shown unless a video is uploaded below."
                                : "Used as the full-bleed background."
                            }
                            onUploaded={(url) =>
                              update("heroVariant", { ...storeData.heroVariant, imageUrl: url })
                            }
                          />
                        )}
                        {active.usesVideo && (
                          <HeroVideoField
                            videoUrl={storeData.heroVariant.videoUrl}
                            onChange={(url) =>
                              update("heroVariant", { ...storeData.heroVariant, videoUrl: url })
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── Sub-section: Buttons & Text ── */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Buttons & Text</p>
                </div>

                <Field label="Primary Button">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                      <span className="text-xs font-medium">Show primary button</span>
                      <Switch
                        checked={storeData.heroVariant.showPrimaryCta}
                        onCheckedChange={(v) =>
                          update("heroVariant", { ...storeData.heroVariant, showPrimaryCta: v })
                        }
                      />
                    </div>
                    {storeData.heroVariant.showPrimaryCta && (
                      <>
                        <Input
                          value={storeData.ctaText}
                          onChange={(e) => update("ctaText", e.target.value)}
                          placeholder="Shop Now"
                        />
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Input
                            value={storeData.ctaLink}
                            onChange={(e) => update("ctaLink", e.target.value)}
                            placeholder="#products  ·  /category/jewelry  ·  https://…"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Where the button links. Default <code className="px-1 py-0.5 rounded bg-muted">#products</code> scrolls to the products grid.
                        </p>
                      </>
                    )}
                  </div>
                </Field>

                <Field label="Secondary Button">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                      <span className="text-xs font-medium">Show secondary button</span>
                      <Switch
                        checked={storeData.secondaryCta.enabled}
                        onCheckedChange={(v) =>
                          update("secondaryCta", { ...storeData.secondaryCta, enabled: v })
                        }
                      />
                    </div>
                    {storeData.secondaryCta.enabled && (
                      <>
                        <Input
                          value={storeData.secondaryCta.label}
                          onChange={(e) =>
                            update("secondaryCta", { ...storeData.secondaryCta, label: e.target.value })
                          }
                          placeholder="Learn More"
                        />
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Input
                            value={storeData.secondaryCta.link}
                            onChange={(e) =>
                              update("secondaryCta", { ...storeData.secondaryCta, link: e.target.value })
                            }
                            placeholder="Optional link"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Field>

                <Field label="Text Alignment">
                  <div className="grid grid-cols-3 gap-1.5 rounded-lg border bg-muted/30 p-1">
                    {(["left", "center", "right"] as const).map((align) => {
                      const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
                      const active = storeData.heroVariant.align === align
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => update("heroVariant", { ...storeData.heroVariant, align })}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
                            active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="capitalize">{align}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Affects Bold, Cinematic, Wave & Magazine templates.
                  </p>
                </Field>

                <Field label="What to Show">
                  <div className="rounded-lg border bg-muted/20 divide-y">
                    {(
                      [
                        { key: "showStoreName",   label: "Store name",   hint: "The big title in the hero" },
                        { key: "showTagline",     label: "Tagline",      hint: "Short line under the name" },
                        { key: "showDescription", label: "Description",  hint: "Longer paragraph below" },
                      ] as const
                    ).map(({ key, label, hint }) => (
                      <div key={key} className="flex items-center justify-between px-3 py-2 gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-tight">{label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{hint}</p>
                        </div>
                        <Switch
                          checked={storeData.heroVariant[key]}
                          onCheckedChange={(v) =>
                            update("heroVariant", { ...storeData.heroVariant, [key]: v })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Hide anything you don't want in the hero — works across all templates.
                  </p>
                </Field>
              </div>

              {/* ── Sub-section: Brand Colors ── */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Brand Colors</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  These cascade to every other section that doesn't set its own. Pick a preset or define your own.
                </p>
                <Field label="Color Presets">
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset) => {
                      const heroPrimary = storeData.heroVariant.primaryColor || storeData.primaryColor
                      const active = heroPrimary === preset.primary
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            update("heroVariant", {
                              ...storeData.heroVariant,
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                            })
                          }
                          title={preset.name}
                          className="group relative h-10 rounded-xl overflow-hidden border-2 hover:border-foreground/50 transition-all"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                            borderColor: active ? preset.primary : "transparent",
                          }}
                        >
                          {active && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                          <span className="sr-only">{preset.name}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {COLOR_PRESETS.map((p) => (
                      <p key={p.name} className="text-[10px] text-center text-muted-foreground truncate px-0.5">
                        {p.name}
                      </p>
                    ))}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Primary">
                    <Input
                      type="color"
                      value={storeData.heroVariant.primaryColor || storeData.primaryColor}
                      onChange={(e) =>
                        update("heroVariant", { ...storeData.heroVariant, primaryColor: e.target.value })
                      }
                      className="h-10 w-full cursor-pointer p-1"
                    />
                  </Field>
                  <Field label="Secondary">
                    <Input
                      type="color"
                      value={storeData.heroVariant.secondaryColor || storeData.secondaryColor}
                      onChange={(e) =>
                        update("heroVariant", { ...storeData.heroVariant, secondaryColor: e.target.value })
                      }
                      className="h-10 w-full cursor-pointer p-1"
                    />
                  </Field>
                </div>
              </div>

              {/* ── Sub-section: Overlay ── */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Overlay Tint</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tints your hero image with a color. Works on templates with image or video backgrounds.
                </p>

                {(() => {
                  const brandColor = storeData.heroVariant.primaryColor || storeData.primaryColor
                  const currentColor = storeData.heroVariant.overlayColor || "#000000"
                  const opacity = storeData.heroVariant.overlayOpacity
                  // The actual hex+alpha that gets blended on top of the image
                  const previewTint = `${currentColor}${Math.round((opacity / 100) * 255).toString(16).padStart(2, "0").toUpperCase()}`
                  // Sample inline-SVG "photo" so the preview works without an
                  // uploaded image — gives the seller something to see tint over.
                  const samplePhoto = `data:image/svg+xml;utf8,${encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><defs><linearGradient id='s' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='#fb923c'/><stop offset='0.5' stop-color='#f97316'/><stop offset='1' stop-color='#7c2d12'/></linearGradient></defs><rect width='400' height='200' fill='url(#s)'/><circle cx='80' cy='160' r='40' fill='#fde68a' opacity='0.55'/><circle cx='320' cy='50' r='60' fill='#fef3c7' opacity='0.35'/><path d='M0 130 Q100 90 200 130 T400 130 V200 H0 Z' fill='#451a03' opacity='0.5'/></svg>`,
                  )}`
                  const heroImg = storeData.heroVariant.imageUrl || samplePhoto

                  return (
                    <>
                      {/* Live preview — sample photo with tint applied. The seller sees the EXACT result here. */}
                      <div className="relative overflow-hidden rounded-lg border bg-muted aspect-[2/1] shadow-inner">
                        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div
                          className="absolute inset-0 transition-colors"
                          style={{ backgroundColor: previewTint, mixBlendMode: "multiply" }}
                        />
                        {/* Faux hero text to show contrast */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80">Preview</span>
                          <span className="text-xl font-bold tracking-tight drop-shadow">Your Store</span>
                        </div>
                        {/* Mini hex badge in the corner */}
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                          <span className="text-[10px] font-mono font-semibold text-white">
                            {currentColor.toUpperCase()} · {opacity}%
                          </span>
                        </div>
                        {!storeData.heroVariant.imageUrl && (
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                            <span className="text-[9px] text-white/80">Sample image</span>
                          </div>
                        )}
                      </div>

                      {/* Color picker — single, prominent control */}
                      <div>
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                          Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={currentColor}
                            onChange={(e) =>
                              update("heroVariant", { ...storeData.heroVariant, overlayColor: e.target.value })
                            }
                            className="h-10 w-14 p-1 cursor-pointer shrink-0"
                            aria-label="Overlay color"
                          />
                          <Input
                            type="text"
                            value={currentColor}
                            onChange={(e) =>
                              update("heroVariant", { ...storeData.heroVariant, overlayColor: e.target.value })
                            }
                            className="font-mono text-xs flex-1"
                            placeholder="#000000"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              update("heroVariant", { ...storeData.heroVariant, overlayColor: brandColor })
                            }
                            className="h-9 px-2.5 rounded-md border bg-background hover:bg-muted/40 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center gap-1.5"
                            title="Use the brand color"
                          >
                            <span
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: brandColor }}
                            />
                            Brand
                          </button>
                        </div>
                      </div>

                      {/* Opacity */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Strength
                          </Label>
                          <span className="text-xs font-mono font-bold text-foreground">{opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={opacity}
                          onChange={(e) =>
                            update("heroVariant", { ...storeData.heroVariant, overlayOpacity: Number(e.target.value) })
                          }
                          className="w-full accent-primary"
                        />
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>No tint</span>
                          <span>Subtle</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </SectionCard>

            <SectionCard
              icon={Newspaper}
              title="About Section"
              hint="A storytelling block between your hero and your products. Image optional."
              enabled={storeData.aboutSection.enabled}
              onToggle={(v) => update("aboutSection", { ...storeData.aboutSection, enabled: v })}
              onReset={() => update("aboutSection", { ...DEFAULT_ABOUT, enabled: true })}
            >
              <Field label="Layout">
                <AboutTemplatePicker
                  value={storeData.aboutSection.template}
                  onChange={(t) =>
                    update("aboutSection", { ...storeData.aboutSection, template: t })
                  }
                  accentColor={storeData.primaryColor}
                />
              </Field>
              {storeData.aboutSection.template === "split" && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">Image on the right</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      Flip the split — text on the left, image on the right.
                    </p>
                  </div>
                  <Switch
                    checked={storeData.aboutSection.flip}
                    onCheckedChange={(v) =>
                      update("aboutSection", { ...storeData.aboutSection, flip: v })
                    }
                  />
                </div>
              )}
              <Field label="Heading">
                <Input
                  value={storeData.aboutSection.heading}
                  onChange={(e) => update("aboutSection", { ...storeData.aboutSection, heading: e.target.value })}
                  placeholder="Our Story"
                />
              </Field>
              <Field label="Body">
                <Textarea
                  value={storeData.aboutSection.body}
                  onChange={(e) => update("aboutSection", { ...storeData.aboutSection, body: e.target.value })}
                  placeholder="Tell visitors about your brand, your craft, and what makes you different."
                  rows={4}
                />
              </Field>
              <ImageUploadField
                label="About Image"
                value={storeData.aboutSection.imageUrl}
                aspect="wide"
                hint="Optional — shown next to the text. Leaving it empty centers the text."
                onUploaded={(url) => update("aboutSection", { ...storeData.aboutSection, imageUrl: url })}
              />
              <SectionAccentPicker
                value={storeData.aboutSection.accentColor}
                onChange={(c) => update("aboutSection", { ...storeData.aboutSection, accentColor: c })}
                inheritFrom={storeData.heroVariant.primaryColor || storeData.primaryColor}
                hint="Used for the About kicker, accent underline, and decorative dividers."
              />
              <SectionBgPicker
                value={storeData.bgColors.about}
                onChange={(c) => update("bgColors", { ...storeData.bgColors, about: c })}
                hint="Override the default. Leave blank to use the theme background."
              />
            </SectionCard>

            <SectionCard
              icon={Package}
              title="Products Section"
              hint="The grid of your products — title, card style, ratings, color & background."
            >
              <Field label="Heading">
                <Input
                  value={storeData.productsSection.heading}
                  onChange={(e) =>
                    update("productsSection", { ...storeData.productsSection, heading: e.target.value })
                  }
                  placeholder="Products"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Leave blank to keep the default "Products" title.
                </p>
              </Field>
              <Field label="Subheading">
                <Textarea
                  value={storeData.productsSection.subheading}
                  onChange={(e) =>
                    update("productsSection", { ...storeData.productsSection, subheading: e.target.value })
                  }
                  placeholder="Browse our handpicked selection…"
                  rows={2}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Leave blank to show the live product count instead.
                </p>
              </Field>

              <Field label="Product Card Style">
                <ProductCardStylePicker
                  value={storeData.theme.productCardStyle}
                  onChange={(v) => update("theme", { ...storeData.theme, productCardStyle: v })}
                  accentColor={storeData.heroVariant.primaryColor || storeData.primaryColor}
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">Show ratings on cards</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Hide if you don't have reviews yet</p>
                  </div>
                </div>
                <Switch
                  checked={storeData.theme.showProductRating}
                  onCheckedChange={(v) => update("theme", { ...storeData.theme, showProductRating: v })}
                />
              </div>

              <SectionAccentPicker
                value={storeData.productsSection.accentColor}
                onChange={(c) =>
                  update("productsSection", { ...storeData.productsSection, accentColor: c })
                }
                inheritFrom={storeData.heroVariant.primaryColor || storeData.primaryColor}
                hint="Used for product prices and the active category chip."
              />
              <SectionBgPicker
                value={storeData.bgColors.products}
                onChange={(c) => update("bgColors", { ...storeData.bgColors, products: c })}
                hint="Override the default. Leave blank to use the theme background."
              />
            </SectionCard>

            <SectionCard
              icon={ShieldCheck}
              title="Trust Badges"
              hint="Reassurance row between products and footer. Up to 4 badges."
              enabled={storeData.trustBadges.enabled}
              onToggle={(v) => update("trustBadges", { ...storeData.trustBadges, enabled: v })}
            >
              <TrustBadgesEditor
                trustBadges={storeData.trustBadges}
                onChange={(t) => update("trustBadges", t)}
              />
              <SectionAccentPicker
                value={storeData.trustBadges.accentColor}
                onChange={(c) => update("trustBadges", { ...storeData.trustBadges, accentColor: c })}
                inheritFrom={storeData.heroVariant.primaryColor || storeData.primaryColor}
                hint="Tints the badge icons."
              />
            </SectionCard>

            <SectionCard
              icon={Layout}
              title="Footer"
              hint="Bottom-of-page section — style, content, social, columns, newsletter, payment"
              enabled={storeData.showFooter}
              onToggle={(v) => update("showFooter", v)}
            >
              {storeData.showFooter ? (
              <>
                <SectionCard
                  icon={Paintbrush}
                  title="Footer Style"
                  hint="Preset, color overrides, alignment & copyright"
                >
                  {/* Preset chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "dark",    label: "Dark",    swatch: ["#0f172a", "#94a3b8", "#ffffff"] },
                      { id: "light",   label: "Light",   swatch: ["#ffffff", "#475569", "#0f172a"] },
                      { id: "branded", label: "Branded", swatch: [storeData.primaryColor, "rgba(255,255,255,0.85)", "#ffffff"] },
                      { id: "minimal", label: "Minimal", swatch: ["#fafafa", "#525252", "#171717"] },
                    ] as const).map(({ id, label, swatch }) => {
                      const active = storeData.footerStyle === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => update("footerStyle", id as FooterStyle)}
                          className={cn(
                            "rounded-lg border-2 p-2.5 text-left transition-all hover:border-foreground/30",
                            active ? "border-primary bg-primary/5" : "border-border",
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {swatch.map((c, i) => (
                              <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <p className="text-xs font-semibold">{label}</p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom override colors */}
                  <div className="space-y-2 pt-3 border-t">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Color Overrides
                      <span className="ml-1 normal-case font-normal text-muted-foreground/70">— blank = use preset</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: "footer",  label: "Background", source: "bgColors" as const },
                        { key: "heading", label: "Heading",    source: "footerColors" as const },
                        { key: "text",    label: "Body Text",  source: "footerColors" as const },
                        { key: "accent",  label: "Accent",     source: "footerColors" as const },
                        { key: "border",  label: "Borders",    source: "footerColors" as const },
                      ] as const).map(({ key, label, source }) => {
                        const value = source === "bgColors"
                          ? storeData.bgColors.footer
                          : storeData.footerColors[key as keyof FooterColors]
                        const setValue = (v: string) => {
                          if (source === "bgColors") {
                            update("bgColors", { ...storeData.bgColors, footer: v })
                          } else {
                            update("footerColors", { ...storeData.footerColors, [key]: v })
                          }
                        }
                        return (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
                            <div className="flex items-center gap-1">
                              <Input
                                type="color"
                                value={value || "#0f172a"}
                                onChange={(e) => setValue(e.target.value)}
                                className="h-9 w-9 p-1 cursor-pointer shrink-0"
                              />
                              {value && (
                                <button
                                  type="button"
                                  onClick={() => setValue("")}
                                  className="h-9 w-9 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                  aria-label="Reset"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-1.5 pt-3 border-t">
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Alignment</Label>
                    <div className="grid grid-cols-2 gap-1.5 rounded-lg border bg-muted/30 p-1">
                      {(["left", "center"] as const).map((align) => {
                        const Icon = align === "left" ? AlignLeft : AlignCenter
                        const active = storeData.footerAlign === align
                        return (
                          <button
                            key={align}
                            type="button"
                            onClick={() => update("footerAlign", align)}
                            className={cn(
                              "flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
                              active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="capitalize">{align}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom copyright */}
                  <Field label="Custom Copyright (optional)">
                    <Input
                      value={storeData.footerCopyright}
                      onChange={(e) => update("footerCopyright", e.target.value)}
                      placeholder="© {year} {store}. All rights reserved."
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Use <code className="px-1 py-0.5 rounded bg-muted">{`{year}`}</code> and <code className="px-1 py-0.5 rounded bg-muted">{`{store}`}</code> placeholders. Leave blank for the default.
                    </p>
                  </Field>
                </SectionCard>

                <SectionCard
                  icon={Newspaper}
                  title="Footer Content"
                  hint="About text, contact info, business hours"
                >
                  <Field label="About">
                    <Textarea
                      value={storeData.footerAbout}
                      onChange={(e) => update("footerAbout", e.target.value)}
                      rows={2}
                    />
                  </Field>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Contact Info
                    </Label>
                    <div className="space-y-2">
                      {[
                        { icon: Mail, field: "footerEmail" as const, placeholder: "email@store.com", type: "email" },
                        { icon: Phone, field: "footerPhone" as const, placeholder: "+961 1 234 567" },
                        { icon: MessageCircle, field: "footerWhatsapp" as const, placeholder: "+96171234567 (WhatsApp)" },
                        { icon: MapPin, field: "footerAddress" as const, placeholder: "City, Lebanon" },
                      ].map(({ icon: Icon, field, placeholder, type }) => (
                        <div key={field} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Input
                            type={type}
                            value={storeData[field]}
                            onChange={(e) => update(field, e.target.value)}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-2.5" />
                        <Textarea
                          value={storeData.businessHours}
                          onChange={(e) => update("businessHours", e.target.value)}
                          placeholder={"Mon–Sat: 10am–7pm\nSun: closed"}
                          rows={2}
                          className="min-h-0"
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={Facebook}
                  title="Social Links"
                  hint="Show social profile icons in the footer"
                  enabled={storeData.showSocial}
                  onToggle={(v) => update("showSocial", v)}
                >
                  <div className="space-y-2">
                    {[
                      { icon: Facebook,  field: "socialFacebook"  as const, placeholder: "facebook.com/yourstore" },
                      { icon: Instagram, field: "socialInstagram" as const, placeholder: "instagram.com/yourstore" },
                      { icon: Music2,    field: "socialTiktok"    as const, placeholder: "yourstore (TikTok handle)" },
                      { icon: Youtube,   field: "socialYoutube"   as const, placeholder: "youtube.com/@yourstore" },
                      { icon: Twitter,   field: "socialTwitter"   as const, placeholder: "yourstore (X handle)" },
                    ].map(({ icon: Icon, field, placeholder }) => (
                      <div key={field} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                          value={storeData[field]}
                          onChange={(e) => update(field, e.target.value)}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  icon={Layout}
                  title="Footer Columns"
                  hint="Custom link columns — up to 3"
                >
                  <FooterColumnsEditor
                    columns={storeData.footerColumns}
                    onChange={(cols) => update("footerColumns", cols)}
                  />
                </SectionCard>

                <SectionCard
                  icon={Mail}
                  title="Newsletter"
                  hint="Show an email signup in your footer. Email collection isn't wired to a backend yet — UI only."
                  enabled={storeData.newsletter.enabled}
                  onToggle={(v) => update("newsletter", { ...storeData.newsletter, enabled: v })}
                  onReset={() => update("newsletter", { ...DEFAULT_NEWSLETTER, enabled: true })}
                >
                  <Field label="Heading">
                    <Input
                      value={storeData.newsletter.heading}
                      onChange={(e) => update("newsletter", { ...storeData.newsletter, heading: e.target.value })}
                      placeholder="Stay in the loop"
                    />
                  </Field>
                  <Field label="Subheading">
                    <Input
                      value={storeData.newsletter.subheading}
                      onChange={(e) => update("newsletter", { ...storeData.newsletter, subheading: e.target.value })}
                      placeholder="Get new arrivals and exclusive offers in your inbox."
                    />
                  </Field>
                </SectionCard>

                <SectionCard
                  icon={CreditCard}
                  title="Payment Methods"
                  hint="Show buyers what you accept"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PAYMENT_METHODS.map((method) => {
                      const checked = storeData.paymentMethods.includes(method)
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? storeData.paymentMethods.filter((m) => m !== method)
                              : [...storeData.paymentMethods, method]
                            update("paymentMethods", next)
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors text-left",
                            checked
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                              checked ? "bg-primary border-primary" : "border-muted-foreground/40",
                            )}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="truncate">{PAYMENT_METHOD_LABEL[method]}</span>
                        </button>
                      )
                    })}
                  </div>
                </SectionCard>
              </>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-2">
                  Footer is hidden. Toggle on to configure.
                </p>
              )}
            </SectionCard>
          </div>
        </aside>

        {/* ── Preview area ── */}
        <main
          className={cn(
            "flex-1 min-w-0 overflow-hidden bg-muted/40 p-3 sm:p-6 flex flex-col items-center",
            mobileView === "edit" && "hidden lg:flex",
          )}
        >
          {storeData.rtl && (
            <div className="mb-2 self-start shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium text-xs">
                RTL
              </span>
            </div>
          )}

          <div
            className={cn(
              "flex flex-col flex-1 min-h-0 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-full max-w-full",
              previewMode === "desktop" ? "lg:max-w-4xl" : "sm:max-w-[390px]",
            )}
          >
            {/* Device chrome — browser-style for desktop, slim notch for mobile */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-gradient-to-b from-gray-50 to-gray-100">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
              </div>
              <div className="flex-1 mx-1 px-2.5 py-1 rounded-md text-[10px] text-muted-foreground bg-white border truncate text-center font-mono">
                {storeApiData?.slug ? `soukly.com/store/${storeApiData.slug}` : "soukly.com/store/preview"}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                {previewMode === "desktop" ? "Desktop" : "Mobile"}
              </span>
            </div>

            {/* Scrollable preview body */}
            <div
              ref={previewBodyRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white"
            >
              <StorePreview data={storeData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Per-section accent color picker. Same UI shape as SectionBgPicker but the
 * empty-value semantic is different: empty = inherit from the brand color
 * (Hero's primary or, before any hero override, the legacy view.primaryColor).
 * Optionally accepts an `inheritFrom` color that we show next to the picker as
 * the live "inherited" swatch so the seller knows what they'll get if they
 * leave it blank.
 */
function SectionAccentPicker({
  value,
  onChange,
  inheritFrom,
  label = "Accent Color",
  hint,
}: {
  value: string
  onChange: (v: string) => void
  inheritFrom?: string
  label?: string
  hint?: string
}) {
  const effective = value || inheritFrom || "#888888"
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={effective}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 p-1 cursor-pointer shrink-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={inheritFrom ? `Inherits ${inheritFrom}` : "Inherits brand"}
          className="font-mono text-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="h-9 w-9 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Reset to brand"
            title="Reset to brand"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        {hint ?? "Leave blank to inherit from the brand color (set in the Hero section)."}
      </p>
    </Field>
  )
}

/**
 * Per-section background color picker. Pulls and writes a single key in
 * `storeData.bgColors` so each section can own its own bg picker UI while the
 * underlying data stays consolidated. Empty value = use the theme default.
 */
function SectionBgPicker({
  value,
  onChange,
  hint,
}: {
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <Field label="Background Color">
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 p-1 cursor-pointer shrink-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Default (transparent)"
          className="font-mono text-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="h-9 w-9 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Reset to default"
            title="Reset"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </Field>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  )
}

/**
 * Generic visual button group — replaces a plain `<Select>` with a row of
 * radio-style buttons, each combining a small graphic and a label. Used in
 * Layout & Theme so the seller can see-and-pick instead of read-and-decide.
 */
function VisualOptionGroup<T extends string>({
  value,
  onChange,
  options,
  cols,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string; preview: React.ReactNode }>
  /** Override grid columns; defaults to options.length (one row). */
  cols?: number
}) {
  const columns = cols ?? options.length
  return (
    <div
      className="grid gap-1.5 rounded-lg border bg-muted/30 p-1"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 rounded text-[10px] font-medium transition-colors",
              active
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("text-current transition-opacity", active ? "opacity-100" : "opacity-70")}>
              {opt.preview}
            </span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Visual picker for product card style. Each option is a realistic mini-mockup
 * (faux image + name + price) rather than an abstract SVG, plus a one-line hint
 * explaining when to use it — so sellers can pick on sight, not by guessing.
 */
/**
 * Visual picker for the page max-width. Replaces an abstract 4-button row with
 * realistic page mockups + plain-language hints — sellers see "this is how my
 * store would look on a desktop monitor at each width" rather than guessing
 * what "Narrow" vs "Wide" actually means.
 */
/**
 * Visual picker for the vertical spacing between page sections. Replaces the
 * generic VisualOptionGroup with a dedicated mock that shows three stacked
 * "sections" at the chosen gap — sellers can see how compressed or airy the
 * page feels without having to scroll the preview pane.
 */
function SectionSpacingPicker({
  value,
  onChange,
}: {
  value: Theme["sectionSpacing"]
  onChange: (v: Theme["sectionSpacing"]) => void
}) {
  const options: Array<{ value: Theme["sectionSpacing"]; label: string; hint: string; gapPx: number }> = [
    { value: "compact",     label: "Tight",    hint: "Less scrolling, dense", gapPx: 2 },
    { value: "comfortable", label: "Balanced", hint: "Most stores",           gapPx: 6 },
    { value: "airy",        label: "Spacious", hint: "Premium, lots of room", gapPx: 12 },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-stretch gap-2 rounded-lg border bg-muted/20 p-2 text-left transition-all",
              "hover:bg-muted/40 hover:border-foreground/30",
              active
                ? "border-foreground/80 bg-background shadow-sm ring-2 ring-foreground/10"
                : "border-border text-muted-foreground",
            )}
            aria-pressed={active}
          >
            {/* Three stacked section bars with the chosen gap */}
            <div className={cn(
              "rounded-md bg-background/80 border p-1.5 flex flex-col",
              active ? "border-foreground/30" : "border-border/60",
            )}
            style={{ gap: `${opt.gapPx}px` }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 rounded-sm",
                    active ? "bg-foreground/30" : "bg-muted-foreground/30",
                  )}
                />
              ))}
            </div>
            <div className="space-y-0.5 px-0.5">
              <div className={cn("text-xs font-semibold", active ? "text-foreground" : "text-foreground/80")}>
                {opt.label}
              </div>
              <div className="text-[10px] leading-tight text-muted-foreground line-clamp-1">
                {opt.hint}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ContainerWidthPicker({
  value,
  onChange,
}: {
  value: Theme["containerWidth"]
  onChange: (v: Theme["containerWidth"]) => void
}) {
  // Each mock shows a faux desktop viewport (light gray) with the inner
  // content area highlighted at the percentage that template would render.
  const options: Array<{ value: Theme["containerWidth"]; label: string; hint: string; widthPct: number }> = [
    { value: "narrow",   label: "Narrow",   hint: "≈ 2 products per row",   widthPct: 42 },
    { value: "standard", label: "Standard", hint: "≈ 3 products per row",   widthPct: 64 },
    { value: "wide",     label: "Wide",     hint: "≈ 4 products per row",   widthPct: 84 },
    { value: "full",     label: "Full",     hint: "Fills the whole screen", widthPct: 100 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-stretch gap-2 rounded-lg border bg-muted/20 p-2 text-left transition-all",
              "hover:bg-muted/40 hover:border-foreground/30",
              active
                ? "border-foreground/80 bg-background shadow-sm ring-2 ring-foreground/10"
                : "border-border text-muted-foreground",
            )}
            aria-pressed={active}
          >
            {/* Desktop viewport mock */}
            <div className={cn(
              "rounded-md bg-background/80 border p-1.5",
              active ? "border-foreground/30" : "border-border/60",
            )}>
              {/* Browser chrome dots */}
              <div className="flex gap-0.5 mb-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              </div>
              {/* Content area at the chosen width, centered */}
              <div className="flex justify-center">
                <div
                  className={cn(
                    "h-8 rounded-sm space-y-0.5 p-0.5",
                    active ? "bg-foreground/15" : "bg-muted-foreground/15",
                  )}
                  style={{ width: `${opt.widthPct}%` }}
                >
                  <div className={cn(
                    "h-1 rounded-sm w-3/4",
                    active ? "bg-foreground/40" : "bg-muted-foreground/35",
                  )} />
                  <div className={cn(
                    "h-1 rounded-sm",
                    active ? "bg-foreground/25" : "bg-muted-foreground/25",
                  )} />
                  <div className={cn(
                    "h-1 rounded-sm w-2/3",
                    active ? "bg-foreground/25" : "bg-muted-foreground/25",
                  )} />
                </div>
              </div>
            </div>
            <div className="space-y-0.5 px-0.5">
              <div className={cn("text-xs font-semibold", active ? "text-foreground" : "text-foreground/80")}>
                {opt.label}
              </div>
              <div className="text-[10px] leading-tight text-muted-foreground line-clamp-1">
                {opt.hint}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ProductCardStylePicker({
  value,
  onChange,
  accentColor,
}: {
  value: Theme["productCardStyle"]
  onChange: (v: Theme["productCardStyle"]) => void
  accentColor?: string
}) {
  const options: Array<{
    value: Theme["productCardStyle"]
    label: string
    hint: string
    mock: React.ReactNode
  }> = [
    {
      value: "compact",
      label: "Compact",
      hint: "Dense grid, more per row",
      mock: (
        <div className="flex gap-1 w-full">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 space-y-1">
              <div className="aspect-square rounded-sm bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
              <div className="h-0.5 rounded-sm bg-muted-foreground/40" />
              <div className="h-1 rounded-sm w-1/2" style={{ background: accentColor ?? "currentColor" }} />
            </div>
          ))}
        </div>
      ),
    },
    {
      value: "standard",
      label: "Standard",
      hint: "Balanced — name, price, button",
      mock: (
        <div className="flex gap-1.5 w-full">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 space-y-1 rounded-sm border border-muted-foreground/20 p-1">
              <div className="aspect-square rounded-sm bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
              <div className="h-1 rounded-sm bg-muted-foreground/40" />
              <div className="h-1 rounded-sm w-3/4" style={{ background: accentColor ?? "currentColor" }} />
            </div>
          ))}
        </div>
      ),
    },
    {
      value: "cinematic",
      label: "Cinematic",
      hint: "Big image, overlay text",
      mock: (
        <div className="w-full">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/20">
            <div className="absolute inset-x-1 bottom-1 space-y-0.5">
              <div className="h-1 rounded-sm bg-white/80" />
              <div className="h-1 rounded-sm w-1/3" style={{ background: accentColor ?? "white" }} />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-stretch gap-2 rounded-lg border bg-muted/20 p-2 text-left transition-all",
              "hover:bg-muted/40 hover:border-foreground/30",
              active
                ? "border-foreground/80 bg-background shadow-sm ring-2 ring-foreground/10"
                : "border-border text-muted-foreground",
            )}
            aria-pressed={active}
          >
            <div className={cn(
              "flex items-center justify-center rounded-md bg-background/80 p-2 min-h-[60px]",
              active ? "text-foreground" : "text-muted-foreground/80",
            )}>
              {opt.mock}
            </div>
            <div className="space-y-0.5 px-0.5">
              <div className={cn("text-xs font-semibold", active ? "text-foreground" : "text-foreground/80")}>
                {opt.label}
              </div>
              <div className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
                {opt.hint}
              </div>
            </div>
            {active && (
              <div
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow"
                style={{ background: accentColor ?? "var(--primary)" }}
                aria-hidden
              >
                ✓
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Visual picker for the About section layout template. Same pattern as the
 * product-card-style picker — realistic mini-mockups + a short hint, so the
 * seller can pick on sight rather than guess from an abstract label.
 */
function AboutTemplatePicker({
  value,
  onChange,
  accentColor,
}: {
  value: AboutTemplate
  onChange: (v: AboutTemplate) => void
  accentColor?: string
}) {
  const accent = accentColor ?? "currentColor"
  const options: Array<{ value: AboutTemplate; label: string; hint: string; mock: React.ReactNode }> = [
    {
      value: "split",
      label: "Split",
      hint: "Image + text side by side",
      mock: (
        <div className="flex gap-1.5 w-full">
          <div className="aspect-square w-1/2 rounded-sm bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
          <div className="w-1/2 space-y-1 flex flex-col justify-center">
            <div className="h-1 rounded-sm w-3/4" style={{ background: accent }} />
            <div className="h-0.5 rounded-sm bg-muted-foreground/40" />
            <div className="h-0.5 rounded-sm w-5/6 bg-muted-foreground/40" />
            <div className="h-0.5 rounded-sm w-2/3 bg-muted-foreground/40" />
          </div>
        </div>
      ),
    },
    {
      value: "centered",
      label: "Centered",
      hint: "Narrow column, text centered",
      mock: (
        <div className="w-full space-y-1 flex flex-col items-center">
          <div className="aspect-[4/3] w-1/2 rounded-sm bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
          <div className="h-1 rounded-sm w-1/2" style={{ background: accent }} />
          <div className="h-0.5 rounded-sm w-3/4 bg-muted-foreground/40" />
          <div className="h-0.5 rounded-sm w-2/3 bg-muted-foreground/40" />
        </div>
      ),
    },
    {
      value: "editorial",
      label: "Editorial",
      hint: "Big italic quote, wide image",
      mock: (
        <div className="w-full space-y-1">
          <div className="aspect-[3/1] rounded-sm bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
          <div className="flex flex-col items-center pt-0.5">
            <div className="h-0.5 rounded-sm w-1/3" style={{ background: accent }} />
            <div className="italic text-[6px] leading-none mt-0.5 text-muted-foreground">"…"</div>
          </div>
        </div>
      ),
    },
    {
      value: "image-overlay",
      label: "Overlay",
      hint: "Full-bleed image, text on top",
      mock: (
        <div className="relative w-full aspect-[5/3] rounded-sm overflow-hidden bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/25">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <div className="h-1 rounded-sm w-1/2 bg-white/90" />
            <div className="h-0.5 rounded-sm w-2/3 bg-white/70" />
            <div className="h-0.5 rounded-sm w-1/3" style={{ background: accent }} />
          </div>
        </div>
      ),
    },
    {
      value: "card",
      label: "Card",
      hint: "Boxed content over a tinted bg",
      mock: (
        <div className="w-full p-1 rounded-sm bg-gradient-to-br from-muted-foreground/15 to-muted-foreground/5">
          <div className="bg-background rounded-sm shadow-sm p-1 flex gap-1">
            <div className="w-1/2 aspect-square rounded-[2px] bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/15" />
            <div className="flex-1 space-y-0.5 flex flex-col justify-center">
              <div className="h-0.5 rounded-sm w-1/2" style={{ background: accent }} />
              <div className="h-0.5 rounded-sm bg-muted-foreground/40" />
              <div className="h-0.5 rounded-sm w-3/4 bg-muted-foreground/40" />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "polaroid",
      label: "Polaroid",
      hint: "Tilted photo, handcrafted feel",
      mock: (
        <div className="flex gap-1.5 items-center w-full">
          <div className="bg-white p-0.5 pb-1.5 shadow-md rotate-[-6deg] shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/20" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="h-1 rounded-sm w-3/4" style={{ background: accent }} />
            <div className="h-0.5 rounded-sm bg-muted-foreground/40" />
            <div className="h-0.5 rounded-sm w-2/3 bg-muted-foreground/40" />
          </div>
        </div>
      ),
    },
    {
      value: "minimal",
      label: "Minimal",
      hint: "Text-only, big display type",
      mock: (
        <div className="w-full space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-1 w-full">
            <span className="h-px flex-1 bg-muted-foreground/40" />
            <span className="text-[5px] font-bold tracking-widest text-muted-foreground/60">ABOUT</span>
            <span className="h-px flex-1 bg-muted-foreground/40" />
          </div>
          <div className="h-1.5 rounded-sm w-2/3 bg-foreground/80" />
          <div className="h-0.5 rounded-sm w-1/2 bg-muted-foreground/40" />
        </div>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-stretch gap-2 rounded-lg border bg-muted/20 p-2 text-left transition-all",
              "hover:bg-muted/40 hover:border-foreground/30",
              active
                ? "border-foreground/80 bg-background shadow-sm ring-2 ring-foreground/10"
                : "border-border text-muted-foreground",
            )}
            aria-pressed={active}
          >
            <div className={cn(
              "flex items-center justify-center rounded-md bg-background/80 p-2 min-h-[60px]",
              active ? "text-foreground" : "text-muted-foreground/80",
            )}>
              {opt.mock}
            </div>
            <div className="space-y-0.5 px-0.5">
              <div className={cn("text-xs font-semibold", active ? "text-foreground" : "text-foreground/80")}>
                {opt.label}
              </div>
              <div className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
                {opt.hint}
              </div>
            </div>
            {active && (
              <div
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow"
                style={{ background: accentColor ?? "var(--primary)" }}
                aria-hidden
              >
                ✓
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Hero Video field ────────────────────────────────────────────────────────
// Optional looping background video for templates that support it (Cinematic,
// Reel, and as a fallback in Elegant). The store's primary image lives on
// Store Identity as `heroImage` — the two fields can co-exist; templates
// decide which to use.

function HeroVideoField({
  videoUrl,
  onChange,
}: {
  videoUrl: string
  onChange: (url: string) => void
}) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Film className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-semibold">Hero Video</p>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Optional looping video for Cinematic & Reel templates.
      </p>

      <VideoUploadField value={videoUrl} onUploaded={onChange} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-background px-2 text-muted-foreground">Or paste a URL</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Film className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          value={videoUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/your-video.mp4"
        />
        {videoUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="h-9 w-9 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Clear video"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function ImageUploadField({
  label,
  value,
  hint,
  aspect = "wide",
  onUploaded,
}: {
  label: string
  value: string
  hint?: string
  aspect?: "square" | "wide"
  onUploaded: (url: string) => void
}) {
  const { toast } = useToast()
  const [uploadImage] = useUploadStoreImageMutation()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const { url } = await uploadImage(fd).unwrap()
      onUploaded(url)
    } catch (e: unknown) {
      // Surface the server's error message (e.g., "File too large. Max size is 50MB.")
      // when present, instead of a generic catch-all.
      const data = (e as { data?: { error?: string } })?.data
      toast({
        title: "Upload failed",
        description: data?.error ?? "Could not upload image. Try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border bg-muted/40">
          <img
            src={value}
            alt=""
            className={cn("w-full object-cover", aspect === "square" ? "h-24" : "h-32")}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Change
            </button>
            <button
              onClick={() => onUploaded("")}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary/70 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-xs font-medium">{uploading ? "Uploading..." : "Click to upload"}</span>
          <span className="text-[10px]">PNG, JPG, WebP · max 5 MB</span>
        </button>
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

// ─── Video upload field (mirrors ImageUploadField, .mp4/.webm/.mov) ──────────
// Reuses the same /stores/me/store/upload-image S3 endpoint, which now accepts
// video MIME types up to 50MB.

function VideoUploadField({
  value,
  hint,
  onUploaded,
}: {
  value: string
  hint?: string
  onUploaded: (url: string) => void
}) {
  const { toast } = useToast()
  const [uploadFile] = useUploadStoreImageMutation()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const { url } = await uploadFile(fd).unwrap()
      onUploaded(url)
    } catch (e: unknown) {
      const data = (e as { data?: { error?: string } })?.data
      toast({
        title: "Upload failed",
        description: data?.error ?? "Could not upload video. Try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border bg-muted/40">
          <video
            key={value}
            src={value}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-32 object-cover bg-black"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onUploaded("")}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Remove video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary/70 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
          <span className="text-xs font-medium">{uploading ? "Uploading…" : "Upload a video"}</span>
          <span className="text-[10px]">MP4, WebM, MOV · max 50 MB · auto-loops on the page</span>
        </button>
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

// ─── Toggleable section card (used by Sections tab + Newsletter) ─────────────

function SectionCard({
  icon: Icon,
  title,
  hint,
  enabled,
  onToggle,
  onReset,
  defaultOpen = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint?: string
  /**
   * Optional enable/disable toggle. When `enabled` and `onToggle` are both
   * provided, a Switch is shown in the header — toggling it on/off controls
   * whether the section is rendered in the storefront preview. The accordion
   * body still expands/collapses independently.
   */
  enabled?: boolean
  onToggle?: (v: boolean) => void
  /**
   * Optional "reset to defaults" handler. When provided, a small Reset
   * link appears at the bottom of the expanded section — handy when a
   * seller wants to undo all their edits in one place.
   */
  onReset?: () => void
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const hasToggle = typeof enabled === "boolean" && !!onToggle
  const isMuted = hasToggle && !enabled

  return (
    <div className={cn("rounded-xl border bg-background overflow-hidden transition-colors", isMuted && "opacity-70")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        className="w-full flex items-center gap-2.5 p-4 text-left hover:bg-muted/40 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        aria-expanded={open}
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
        </div>
        {hasToggle && (
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </div>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </div>
      {open && (
        <div className="border-t bg-muted/20 p-4 space-y-4">
          {children}
          {onReset && (
            <div className="pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Slim divider that splits the aside into logical zones (BRAND / PAGE SECTIONS /
 * FOOTER / SETTINGS). When `enabled` + `onToggle` are provided, a switch on the
 * right controls visibility of the entire group — e.g. the FOOTER group's
 * Show Footer toggle.
 */
function GroupHeader({
  label,
  enabled,
  onToggle,
}: {
  label: string
  enabled?: boolean
  onToggle?: (v: boolean) => void
}) {
  const hasToggle = typeof enabled === "boolean" && !!onToggle
  return (
    <div className="flex items-center gap-2.5 pt-4 pb-1 first:pt-0 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
      <div className="w-1 h-3 rounded-full bg-primary" />
      <span className="text-[11px] font-bold tracking-[0.14em] text-foreground/80 uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
      {hasToggle && <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Show ${label}`} />}
    </div>
  )
}

// ─── Custom footer columns editor ────────────────────────────────────────────

function FooterColumnsEditor({
  columns,
  onChange,
}: {
  columns: FooterColumn[]
  onChange: (columns: FooterColumn[]) => void
}) {
  const addColumn = () => {
    if (columns.length >= 3) return
    onChange([...columns, { title: "Quick Links", links: [{ label: "", url: "" }] }])
  }
  const updateColumn = (i: number, patch: Partial<FooterColumn>) => {
    onChange(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }
  const removeColumn = (i: number) => onChange(columns.filter((_, idx) => idx !== i))
  const addLink = (colIdx: number) => {
    const col = columns[colIdx]
    updateColumn(colIdx, { links: [...col.links, { label: "", url: "" }] })
  }
  const updateLink = (colIdx: number, linkIdx: number, patch: Partial<{ label: string; url: string }>) => {
    const col = columns[colIdx]
    const links = col.links.map((l, j) => (j === linkIdx ? { ...l, ...patch } : l))
    updateColumn(colIdx, { links })
  }
  const removeLink = (colIdx: number, linkIdx: number) => {
    const col = columns[colIdx]
    updateColumn(colIdx, { links: col.links.filter((_, j) => j !== linkIdx) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">Group your own links — up to 3 columns.</p>
        {columns.length < 3 && (
          <Button size="sm" variant="outline" onClick={addColumn} className="h-7 px-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add column
          </Button>
        )}
      </div>

      {columns.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">
          No custom columns yet. Click <strong>Add column</strong> to create one.
        </p>
      )}

      <div className="space-y-3">
        {columns.map((col, ci) => (
          <div key={ci} className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={col.title}
                onChange={(e) => updateColumn(ci, { title: e.target.value })}
                placeholder="Column title (e.g. Shop)"
                className="h-8 text-sm font-semibold"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeColumn(ci)}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove column"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-1.5 pl-2 border-l-2 border-border">
              {col.links.map((link, li) => (
                <div key={li} className="flex items-center gap-1.5">
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(ci, li, { label: e.target.value })}
                    placeholder="Label"
                    className="h-7 text-xs flex-1"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(ci, li, { url: e.target.value })}
                    placeholder="#products or https://…"
                    className="h-7 text-xs flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeLink(ci, li)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remove link"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addLink(ci)}
                className="h-7 px-2 text-xs text-muted-foreground"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add link
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Trust badges editor ─────────────────────────────────────────────────────

function TrustBadgesEditor({
  trustBadges,
  onChange,
}: {
  trustBadges: { enabled: boolean; items: TrustBadgeItem[] }
  onChange: (t: { enabled: boolean; items: TrustBadgeItem[] }) => void
}) {
  const allKeys = Object.keys(TRUST_BADGE_PRESETS) as TrustBadgeKey[]
  const usedKeys = new Set(trustBadges.items.map((i) => i.key))
  const availableKeys = allKeys.filter((k) => !usedKeys.has(k))

  const addBadge = (key: TrustBadgeKey) => {
    if (trustBadges.items.length >= 4) return
    const preset = TRUST_BADGE_PRESETS[key]
    onChange({
      ...trustBadges,
      items: [
        ...trustBadges.items,
        { key, label: preset.defaultLabel, sublabel: preset.defaultSublabel },
      ],
    })
  }
  const updateBadge = (i: number, patch: Partial<TrustBadgeItem>) =>
    onChange({ ...trustBadges, items: trustBadges.items.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) })
  const removeBadge = (i: number) =>
    onChange({ ...trustBadges, items: trustBadges.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-3">
      {trustBadges.items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Pick a badge below to get started.
        </p>
      )}

      <div className="space-y-2">
        {trustBadges.items.map((badge, i) => (
          <div key={badge.key} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex-1">
                {badge.key.replace(/-/g, " ")}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeBadge(i)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Input
              value={badge.label}
              onChange={(e) => updateBadge(i, { label: e.target.value })}
              placeholder="Label"
              className="h-8 text-xs"
            />
            <Input
              value={badge.sublabel}
              onChange={(e) => updateBadge(i, { sublabel: e.target.value })}
              placeholder="Sublabel (optional)"
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>

      {trustBadges.items.length < 4 && availableKeys.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Add a badge
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {availableKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => addBadge(key)}
                className="px-2.5 py-1 rounded-full border bg-background text-[11px] font-medium hover:bg-muted transition-colors"
              >
                + {TRUST_BADGE_PRESETS[key].defaultLabel}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  selected,
  primaryColor,
  secondaryColor,
  onClick,
}: {
  template: TemplateMeta
  selected: boolean
  primaryColor: string
  secondaryColor: string
  onClick: () => void
}) {
  const thumb = () => {
    const p = primaryColor
    const s = secondaryColor

    switch (template.id) {
      case "minimal":
        return (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-1 p-2">
            <div className="w-5 h-5 rounded-md" style={{ background: `linear-gradient(135deg,${p},${s})` }} />
            <div className="w-10 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: p }} />
            <div className="w-14 h-1 rounded-full bg-gray-200" />
            <div className="mt-1.5 flex gap-1">
              <div className="w-7 h-2 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-7 h-2 rounded-full border" style={{ borderColor: p }} />
            </div>
          </div>
        )

      case "bold":
        return (
          <div className="w-full h-full flex flex-col justify-center p-2 gap-1" style={{ background: `linear-gradient(135deg,${p},${s})` }}>
            <div className="w-9 h-1.5 rounded-full bg-white/30" />
            <div className="w-14 h-2 rounded-full bg-white mt-0.5" />
            <div className="w-10 h-1 rounded-full bg-white/60" />
            <div className="mt-1 w-8 h-2.5 rounded-full bg-white" />
          </div>
        )

      case "elegant":
        return (
          <div className="w-full h-full grid grid-cols-2 bg-stone-50">
            <div className="p-1.5 flex flex-col justify-center gap-1">
              <div className="h-px w-4 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-8 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: p }} />
              <div className="w-6 h-1 rounded-full bg-gray-300" />
              <div className="mt-1 w-6 h-2 rounded" style={{ backgroundColor: p }} />
            </div>
            <div className="rounded-r-sm" style={{ background: `linear-gradient(135deg,${p}35,${s}35)` }} />
          </div>
        )

      case "modern":
        return (
          <div className="w-full h-full bg-slate-900 grid grid-cols-[1fr_auto] gap-1 p-1.5 items-center">
            <div className="flex flex-col gap-1">
              <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-10 h-1.5 rounded-full bg-white" />
              <div className="w-6 h-0.5 rounded-full bg-slate-600" />
              <div className="mt-0.5 w-6 h-2 rounded" style={{ backgroundColor: p }} />
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-9">
              {[`${p}50`, `${s}50`, `${s}30`, `${p}30`].map((bg, i) => (
                <div key={i} className={cn("h-5 rounded-sm", i % 2 === 1 && "mt-1")} style={{ backgroundColor: bg }} />
              ))}
            </div>
          </div>
        )

      case "cinematic":
        return (
          <div className="w-full h-full relative flex flex-col items-center justify-center gap-1" style={{ background: `linear-gradient(to bottom,rgba(0,0,0,.7),${p}55,rgba(0,0,0,.8)),#0f172a` }}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-black" />
            <div className="w-10 h-1.5 rounded-full bg-white" />
            <div className="w-7 h-1 rounded-full bg-white/50" />
            <div className="mt-0.5 w-7 h-2 rounded-full" style={{ backgroundColor: `${p}90` }} />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black" />
          </div>
        )

      case "glass":
        return (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg,${p},${s})` }}>
            <div className="absolute w-10 h-10 rounded-full blur-md opacity-60" style={{ backgroundColor: s, top: "-4px", right: "-4px" }} />
            <div className="absolute w-8 h-8 rounded-full blur-md opacity-60" style={{ backgroundColor: p, bottom: "-4px", left: "-4px" }} />
            <div className="relative rounded-lg border border-white/30 px-2 py-1.5 space-y-1" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
              <div className="w-8 h-1.5 rounded-full bg-white" />
              <div className="w-6 h-1 rounded-full bg-white/70" />
              <div className="w-5 h-1.5 rounded-full bg-white/90 mt-0.5" />
            </div>
          </div>
        )

      case "geometric":
        return (
          <div className="w-full h-full bg-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full" style={{ backgroundColor: `${p}25` }} />
            <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-md rotate-45" style={{ backgroundColor: `${s}20` }} />
            <div className="absolute bottom-1 right-2 w-6 h-6 rounded-full" style={{ backgroundColor: `${p}15` }} />
            <div className="relative p-2 flex flex-col justify-center h-full gap-1">
              <div className="flex items-center gap-1">
                <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: p }} />
                <div className="space-y-0.5">
                  <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: p }} />
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
              </div>
              <div className="ml-1.5 w-6 h-2 rounded" style={{ backgroundColor: p }} />
            </div>
          </div>
        )

      case "luxury":
        return (
          <div className="w-full h-full flex flex-col justify-center p-2 gap-1" style={{ background: `linear-gradient(135deg,#0a0a0a,#1a0a20)` }}>
            <div className="w-full h-px mb-1" style={{ backgroundColor: p }} />
            <div className="w-10 h-0.5 rounded-full bg-white/30 mb-0.5" />
            <div className="w-12 h-2 rounded-full bg-white" />
            <div className="w-8 h-1 rounded-full mt-0.5" style={{ backgroundColor: s }} />
            <div className="mt-1.5 w-7 h-2 rounded border" style={{ borderColor: p, color: p }} />
          </div>
        )

      case "wave":
        return (
          <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center gap-1 pb-2">
              <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-14 h-1 rounded-full bg-gray-200" />
              <div className="mt-1 w-7 h-2 rounded-full" style={{ backgroundColor: p }} />
            </div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-6 shrink-0">
              <path d={`M0,12 C25,24 75,0 100,12 L100,24 L0,24 Z`} fill={p} />
            </svg>
          </div>
        )

      case "magazine":
        return (
          <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
            <span className="absolute text-[40px] font-black leading-none select-none whitespace-nowrap" style={{ color: `${p}12`, letterSpacing: "-0.03em" }}>
              STORE
            </span>
            <div className="relative flex flex-col items-center gap-1">
              <div className="w-px h-5 mb-0.5" style={{ backgroundColor: p }} />
              <div className="w-10 h-2 rounded-full" style={{ backgroundColor: p }} />
              <div className="w-8 h-1 rounded-full bg-gray-200" />
              <div className="mt-1 w-6 h-1.5 rounded-full" style={{ backgroundColor: s }} />
            </div>
          </div>
        )

      case "showcase":
        // Image-only: simulate full-bleed photo with a gradient and a tiny "image" hint (mountain + sun)
        return (
          <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(135deg,${p}55,${s}55)` }}>
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white/90" />
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2/3">
              <polygon points="0,60 25,28 45,42 70,18 100,38 100,60" fill="rgba(255,255,255,0.55)" />
              <polygon points="0,60 35,40 60,52 85,32 100,44 100,60" fill="rgba(255,255,255,0.85)" />
            </svg>
            <div className="absolute bottom-1 left-1.5 right-1.5 space-y-0.5">
              <div className="w-10 h-1.5 rounded-full bg-white" />
              <div className="w-7 h-1 rounded-full bg-white/70" />
            </div>
          </div>
        )

      case "reel":
        // Video-only: simulate a video frame with a play triangle + "REC" dot
        return (
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 40%, ${p}40, transparent 60%), radial-gradient(circle at 70% 70%, ${s}40, transparent 60%)` }} />
            <div className="relative w-6 h-6 rounded-full bg-white/95 flex items-center justify-center shadow">
              <div className="w-0 h-0" style={{ borderLeft: "6px solid black", borderTop: "4px solid transparent", borderBottom: "4px solid transparent", marginLeft: "2px" }} />
            </div>
            <div className="absolute top-1 left-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[7px] font-bold text-white tracking-widest">REC</span>
            </div>
          </div>
        )
    }
  }

  // Media-need indicator — sellers should know upfront whether picking this
  // template means they'll need a photo, a video, or nothing.
  const mediaNeed: { label: string; Icon: React.ComponentType<{ className?: string }>; tone: "muted" | "accent" } =
    template.usesImage && template.usesVideo
      ? { label: "Photo or video", Icon: ImageIcon, tone: "accent" }
      : template.usesImage
        ? { label: "Photo",         Icon: ImageIcon, tone: "accent" }
        : template.usesVideo
          ? { label: "Video",        Icon: Film,      tone: "accent" }
          : { label: "No media",     Icon: Sparkles,  tone: "muted"  }

  return (
    <button
      onClick={onClick}
      title={template.description}
      className={cn(
        "group relative flex flex-col rounded-xl border-2 text-left overflow-hidden transition-all",
        selected ? "border-primary shadow-sm" : "border-border hover:border-foreground/30",
      )}
    >
      {/* Thumb — abstract preview with primary/secondary colors applied */}
      <div className="relative aspect-[3/2] bg-gray-50">
        {thumb()}
        {/* Selected check overlay */}
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow ring-2 ring-white">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
        )}
        {/* "New" pill */}
        {template.badge && !selected && (
          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/95 text-primary shadow-sm tracking-wide">
            {template.badge}
          </span>
        )}
      </div>

      {/* Footer: name + media chip */}
      <div className="px-2 py-1.5 bg-background flex items-center gap-1 border-t">
        <p className="text-xs font-semibold truncate flex-1">{template.name}</p>
        <span
          className={cn(
            "flex items-center gap-0.5 text-[9px] font-medium shrink-0 px-1.5 py-0.5 rounded-full",
            mediaNeed.tone === "accent"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
          title={mediaNeed.label}
        >
          <mediaNeed.Icon className="w-2.5 h-2.5" />
        </span>
      </div>
    </button>
  )
}

// ─── Store Preview wrapper ────────────────────────────────────────────────────
// Uses the shared storefront components so the seller's preview matches the
// real public store page exactly. No `ctaHref` is passed in preview, so the
// hero CTA renders as a non-navigating <button>.

function StorePreview({ data: rawData }: { data: StoreData }) {
  // Mirror storeToView's derivation so the preview reflects per-section brand
  // overrides immediately — without this, view.primaryColor would stay frozen
  // at the legacy seed and section accents that "inherit" would show the wrong
  // color the moment the seller picks a hero color.
  const data: StoreData = {
    ...rawData,
    primaryColor:   rawData.heroVariant.primaryColor   || rawData.primaryColor,
    secondaryColor: rawData.heroVariant.secondaryColor || rawData.secondaryColor,
  }
  // Strip ctaHref to keep the preview click-inert
  const previewView: StorefrontView = { ...data, ctaHref: undefined }
  // Body font wrapper (matches the public page treatment)
  const rootStyle: React.CSSProperties = {
    fontFamily: previewView.fonts.bodyFont !== "system" ? fontFamily(previewView.fonts.bodyFont) : undefined,
  }
  return (
    <div style={rootStyle}>
      <GoogleFontsLoader view={previewView} />
      <StorefrontAnnouncementBar view={previewView} />
      <StorefrontNav view={previewView} cartCount={0} onCartClick={() => {}} />
      <StorefrontHero view={previewView} />
      <StorefrontAbout view={previewView} />
      <PreviewProducts view={previewView} />
      <StorefrontTrustBadges view={previewView} />
      <StorefrontFooter view={previewView} />
    </div>
  )
}

// ─── Preview-only products grid ───────────────────────────────────────────────
// Sample products so sellers can see how their chosen card style, accent color,
// border radius, fonts, and section background look together — before they've
// added any real inventory. Mirrors the public storefront's products section
// (see store-page-content.tsx) but skips the search and category filters.

const PREVIEW_PRODUCTS = [
  { id: "preview-1", name: "Handwoven Ceramic Vase",   price: 45, hue: 18,  rating: 4.8 },
  { id: "preview-2", name: "Olive Wood Serving Board", price: 32, hue: 75,  rating: 4.9 },
  { id: "preview-3", name: "Cedar Soap Trio",          price: 18, hue: 200, rating: 4.7 },
  { id: "preview-4", name: "Linen Table Runner",       price: 28, hue: 340, rating: 4.6 },
  { id: "preview-5", name: "Brass Coffee Pot",         price: 55, hue: 35,  rating: 5.0 },
  { id: "preview-6", name: "Hand-Painted Tile Set",    price: 38, hue: 260, rating: 4.8 },
] as const

const PREVIEW_CATEGORIES = ["All", "Pottery", "Textiles", "Wood", "Bath"] as const

// Generate a colorful gradient SVG placeholder per product so the builder
// preview shows variety — a grey /placeholder.svg makes every card look
// identical and hides what the chosen card style actually does with imagery.
function previewProductImage(hue: number, accent: string): string {
  const safeAccent = accent || "#888888"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue}, 55%, 78%)" />
        <stop offset="100%" stop-color="hsl(${(hue + 35) % 360}, 50%, 58%)" />
      </linearGradient>
      <radialGradient id="r" cx="35%" cy="30%" r="60%">
        <stop offset="0%" stop-color="white" stop-opacity="0.45" />
        <stop offset="100%" stop-color="white" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)" />
    <rect width="400" height="400" fill="url(#r)" />
    <circle cx="200" cy="220" r="90" fill="${safeAccent}" opacity="0.25" />
    <circle cx="200" cy="220" r="55" fill="${safeAccent}" opacity="0.35" />
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function PreviewProducts({ view }: { view: StorefrontView }) {
  const tokens = themeTokens(view.theme)
  const productsBgStyle = view.bgColors.products ? { backgroundColor: view.bgColors.products } : undefined
  const productsAccent = view.productsSection.accentColor || view.primaryColor
  const headingStyle: React.CSSProperties | undefined =
    view.fonts.headingFont !== "system" ? { fontFamily: fontFamily(view.fonts.headingFont) } : undefined
  const bodyStyle: React.CSSProperties | undefined =
    view.fonts.bodyFont !== "system" ? { fontFamily: fontFamily(view.fonts.bodyFont) } : undefined

  const gridCols =
    view.theme.productCardStyle === "compact"
      ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
      : view.theme.productCardStyle === "cinematic"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

  return (
    <div
      id="products"
      className={cn("scroll-mt-20", !productsBgStyle && "bg-background")}
      style={productsBgStyle}
    >
      <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
        {/* Header — matches live storefront layout (title + search) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight" style={headingStyle}>
              {view.productsSection.heading || "Products"}
            </h2>
            <p className="text-muted-foreground text-sm" style={bodyStyle}>
              {view.productsSection.subheading
                || `${PREVIEW_PRODUCTS.length} products · sample preview — replace with your real inventory`}
            </p>
          </div>
          <div className="relative w-full sm:w-72 shrink-0 opacity-70 pointer-events-none select-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <div
              className="pl-9 pr-3 h-10 rounded-full bg-background border flex items-center text-sm text-muted-foreground"
              aria-hidden
            >
              Search {view.storeName || "store"}…
            </div>
          </div>
        </div>

        {/* Category filter chips — decorative preview */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto">
          <div className="inline-flex gap-2 whitespace-nowrap">
            {PREVIEW_CATEGORIES.map((label, i) => {
              const active = i === 0
              return (
                <span
                  key={label}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors select-none",
                    active ? "border-transparent text-white" : "bg-background text-foreground",
                  )}
                  style={active ? { backgroundColor: productsAccent } : undefined}
                >
                  {label}
                </span>
              )
            })}
          </div>
        </div>

        <div className={cn("grid gap-4 md:gap-6", gridCols)}>
          {PREVIEW_PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              variant={view.theme.productCardStyle}
              borderRadius={view.theme.borderRadius}
              accentColor={productsAccent}
              showRating={view.theme.showProductRating}
              showAddToCart={false}
              product={{
                id: p.id,
                name: p.name,
                price: p.price,
                image: previewProductImage(p.hue, productsAccent),
                rating: p.rating,
                inStock: true,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
