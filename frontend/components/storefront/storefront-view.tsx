"use client"

import { useState } from "react"
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle, Youtube, Twitter, Clock, ArrowLeft, Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Store } from "@/store/api/storeApi"

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateId =
  | "minimal"
  | "bold"
  | "elegant"
  | "modern"
  | "cinematic"
  | "glass"
  | "geometric"
  | "luxury"
  | "wave"
  | "magazine"
  | "showcase"
  | "reel"

export type FontFamily = "modern" | "classic" | "elegant" | "bold"

export type PaymentMethod = "visa" | "mastercard" | "amex" | "whish" | "omt" | "cod"

export const ALL_PAYMENT_METHODS: PaymentMethod[] = ["visa", "mastercard", "amex", "whish", "omt", "cod"]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  visa:       "VISA",
  mastercard: "Mastercard",
  amex:       "AMEX",
  whish:      "Whish",
  omt:        "OMT",
  cod:        "Cash on Delivery",
}

export type CtaConfig = { enabled: boolean; label: string; link: string }

export type AnnouncementBar = {
  enabled: boolean
  text: string
  bgColor: string
  textColor: string
  link: string
}

export type AboutTemplate =
  | "split"
  | "centered"
  | "image-overlay"
  | "card"
  | "polaroid"
  | "minimal"

export type AboutAlign = "left" | "center" | "right"

export type AboutBodySize = "sm" | "md" | "lg"

export type AboutSection = {
  enabled: boolean
  heading: string
  body: string
  imageUrl: string
  template: AboutTemplate
  /** When true, the Split template renders text on the left and image on the right. Ignored by other templates. */
  flip: boolean
  /** Text alignment of the heading + body. Applied to Split, Card & Polaroid; the
   *  Centered / Minimal / Overlay templates are center-aligned by design. */
  align: AboutAlign
  /** Small kicker label above the heading (e.g. "About", "Our Craft"). Empty = hidden.
   *  Shown by the Split, Card & Minimal templates. */
  eyebrow: string
  /** Body paragraph size. */
  bodySize: AboutBodySize
  /** Empty string = inherit from view.primaryColor. Used for kicker, underline, divider, etc. */
  accentColor: string
}

// Lightweight customization for the Products grid section. Both fields are
// optional — empty values fall back to the renderer's defaults (heading
// "Products", subheading shows the dynamic count line).
export type ProductsSection = {
  heading: string
  subheading: string
  /** Empty = inherit from view.primaryColor. Used for product card prices, category chips, etc. */
  accentColor: string
}

export type FooterColumn = {
  title: string
  links: { label: string; url: string }[]
}

// ─── Custom navigation ────────────────────────────────────────────────────────

export type NavLink = { label: string; url: string }

export type StoreNav = {
  links: NavLink[]
  showCart: boolean
}

export const DEFAULT_NAV: StoreNav = {
  links: [
    { label: "Shop",    url: "#products" },
    { label: "About",   url: "#about" },
    { label: "Contact", url: "#contact" },
  ],
  showCart: true,
}

// ─── Theme controls ───────────────────────────────────────────────────────────

export type BorderRadius   = "sharp" | "rounded" | "pill"
export type ContainerWidth = "narrow" | "standard" | "wide" | "full"
export type SectionSpacing = "compact" | "comfortable" | "airy"
export type ProductCardStyle = "compact" | "standard" | "cinematic"

export type Theme = {
  borderRadius:       BorderRadius
  containerWidth:     ContainerWidth
  sectionSpacing:     SectionSpacing
  productCardStyle:   ProductCardStyle
  showProductRating:  boolean
}

export const DEFAULT_THEME: Theme = {
  borderRadius:      "rounded",
  containerWidth:    "standard",
  sectionSpacing:    "comfortable",
  productCardStyle:  "standard",
  showProductRating: true,
}

// Token classes derived from a theme — kept here so callers stay in sync.
export function themeTokens(t: Theme) {
  const container = (
    { narrow: "max-w-3xl", standard: "max-w-6xl", wide: "max-w-7xl", full: "max-w-none" } as const
  )[t.containerWidth]
  const sectionPad = (
    { compact: "py-8", comfortable: "py-12", airy: "py-20" } as const
  )[t.sectionSpacing]
  const radius = (
    { sharp: "rounded-none", rounded: "rounded-xl", pill: "rounded-3xl" } as const
  )[t.borderRadius]
  const radiusInput = (
    { sharp: "rounded-none", rounded: "rounded-lg", pill: "rounded-full" } as const
  )[t.borderRadius]
  return { container, sectionPad, radius, radiusInput }
}

// ─── Per-section background colors (overrides defaults; "" = use default) ────

export type BgColors = {
  about:    string
  products: string
  footer:   string
}

export const DEFAULT_BG_COLORS: BgColors = {
  about:    "",
  products: "",
  footer:   "",
}

// ─── Footer customization (colors, alignment, copyright text) ────────────────

export type FooterStyle = "dark" | "light" | "branded" | "minimal" | "custom"

export type FooterColors = {
  // Empty string = use the default for the chosen footerStyle.
  text:    string  // body text + contact rows
  heading: string  // column titles ("Contact", custom column titles)
  accent:  string  // "Powered by Soukly" link + social icon hover
  border:  string  // dividers between footer sections
}

export type FooterAlign = "left" | "center"

export const DEFAULT_FOOTER_COLORS: FooterColors = {
  text: "", heading: "", accent: "", border: "",
}

// Resolved color values per preset. Custom uses the seller's overrides directly.
type ResolvedFooterTheme = { bg: string; text: string; heading: string; accent: string; border: string }

export function resolveFooterTheme(
  style: FooterStyle,
  primaryColor: string,
  override: { bg: string; colors: FooterColors },
): ResolvedFooterTheme {
  const presets: Record<Exclude<FooterStyle, "custom">, ResolvedFooterTheme> = {
    dark:    { bg: "#0f172a", text: "#94a3b8", heading: "#94a3b8", accent: primaryColor, border: "rgba(255,255,255,0.1)"  },
    light:   { bg: "#ffffff", text: "#475569", heading: "#0f172a", accent: primaryColor, border: "rgba(15,23,42,0.1)"     },
    branded: { bg: primaryColor, text: "rgba(255,255,255,0.85)", heading: "#ffffff", accent: "#ffffff", border: "rgba(255,255,255,0.18)" },
    minimal: { bg: "#fafafa", text: "#525252", heading: "#171717", accent: primaryColor, border: "rgba(0,0,0,0.08)"       },
  }
  // Start from preset (or dark for "custom"), then apply seller's overrides on top.
  const base = style === "custom" ? presets.dark : presets[style]
  return {
    bg:      override.bg          || base.bg,
    text:    override.colors.text    || base.text,
    heading: override.colors.heading || base.heading,
    accent:  override.colors.accent  || base.accent,
    border:  override.colors.border  || base.border,
  }
}

// ─── Fonts (Google Fonts subset + system) ────────────────────────────────────

export type FontPreset = {
  id:     string                 // builder picker id, also used as Google Fonts query
  label:  string                 // display label
  family: string                 // CSS font-family value
  google: string | null          // Google Fonts family query (null = system)
}

export const FONT_PRESETS: FontPreset[] = [
  { id: "system",        label: "System",                  family: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", google: null },
  { id: "inter",         label: "Inter",                   family: "'Inter', sans-serif",                  google: "Inter:wght@400;500;600;700;800" },
  { id: "poppins",       label: "Poppins",                 family: "'Poppins', sans-serif",                google: "Poppins:wght@400;500;600;700;800" },
  { id: "montserrat",    label: "Montserrat",              family: "'Montserrat', sans-serif",             google: "Montserrat:wght@400;500;600;700;800" },
  { id: "raleway",       label: "Raleway",                 family: "'Raleway', sans-serif",                google: "Raleway:wght@400;500;600;700;800" },
  { id: "space-grotesk", label: "Space Grotesk",           family: "'Space Grotesk', sans-serif",          google: "Space+Grotesk:wght@400;500;600;700" },
  { id: "playfair",      label: "Playfair Display",        family: "'Playfair Display', serif",            google: "Playfair+Display:wght@400;600;700;800" },
  { id: "lora",          label: "Lora",                    family: "'Lora', serif",                        google: "Lora:wght@400;500;600;700" },
  { id: "merriweather",  label: "Merriweather",            family: "'Merriweather', serif",                google: "Merriweather:wght@400;700;900" },
  { id: "cormorant",     label: "Cormorant Garamond",      family: "'Cormorant Garamond', serif",          google: "Cormorant+Garamond:wght@400;500;600;700" },
  { id: "dm-serif",      label: "DM Serif Display",        family: "'DM Serif Display', serif",            google: "DM+Serif+Display:opsz@36" },
]

const FONT_BY_ID: Record<string, FontPreset> = Object.fromEntries(FONT_PRESETS.map((f) => [f.id, f]))

export function fontFamily(id: string | undefined): string {
  if (!id) return FONT_BY_ID.system.family
  return (FONT_BY_ID[id] ?? FONT_BY_ID.system).family
}

export type Fonts = {
  headingFont: string
  bodyFont:    string
}

export const DEFAULT_FONTS: Fonts = {
  headingFont: "system",
  bodyFont:    "system",
}

// ─── Hero variant + video ─────────────────────────────────────────────────────

export type HeroAlign = "left" | "center" | "right"

export type HeroHeight = "short" | "medium" | "tall" | "full"

export type HeroBgPosition = "top" | "center" | "bottom"

export type HeroVariant = {
  align:          HeroAlign
  /** Hero block height. Applies to every template. */
  height:         HeroHeight
  /** Vertical focal point for hero background images. Applies to image templates. */
  bgPosition:     HeroBgPosition
  /** Small kicker label above the title. Empty = use the template's built-in default. */
  eyebrow:        string
  /** When false, the eyebrow kicker is hidden on every template. */
  showEyebrow:    boolean
  overlayOpacity: number   // 0–100; only honored on templates with bg images/gradients
  overlayColor:   string   // hex color for the dark/tinted wash over hero media
  videoUrl:       string   // optional — looping video bg for templates that show one
  imageUrl:       string   // optional — still image bg for templates that show one (separate from store-card cover)
  // Visibility toggles — let sellers hide hero text/buttons per their preference.
  // Defaults are all true so existing stores look unchanged.
  showStoreName:    boolean
  showTagline:      boolean
  showDescription:  boolean
  showPrimaryCta:   boolean
  showLogo:         boolean
  // Per-section brand colors. Empty string means "inherit from view.primaryColor"
  // (the legacy field still seeded on every store). When set, these override the
  // hero's accent and cascade to all other sections that don't define their own.
  primaryColor:     string
  secondaryColor:   string
}

export const DEFAULT_HERO_VARIANT: HeroVariant = {
  align:           "left",
  height:          "medium",
  bgPosition:      "center",
  eyebrow:         "",
  showEyebrow:     true,
  overlayOpacity:  55,
  overlayColor:    "#000000",
  videoUrl:        "",
  imageUrl:        "",
  showStoreName:   true,
  showTagline:     true,
  showDescription: true,
  showPrimaryCta:  true,
  showLogo:        true,
  primaryColor:    "",
  secondaryColor:  "",
}

// Hex (#RRGGBB) → rgba(r,g,b,alpha). Tolerant: returns black if the hex is malformed.
function hexToRgba(hex: string, alpha: number): string {
  const m = (hex || "#000000").replace("#", "")
  if (m.length !== 6 || /[^0-9a-f]/i.test(m)) return `rgba(0,0,0,${alpha})`
  const r = parseInt(m.substring(0, 2), 16)
  const g = parseInt(m.substring(2, 4), 16)
  const b = parseInt(m.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

export type TrustBadgeKey =
  | "free-shipping" | "returns" | "secure" | "support" | "quality" | "authentic" | "made-in-lebanon" | "fast-delivery"

export type TrustBadgeItem = {
  key:      TrustBadgeKey
  label:    string
  sublabel: string
}

export type TrustBadges = {
  enabled:     boolean
  items:       TrustBadgeItem[]
  /** Empty = inherit from view.primaryColor. Used for badge icon tint. */
  accentColor: string
}

export const TRUST_BADGE_PRESETS: Record<TrustBadgeKey, { defaultLabel: string; defaultSublabel: string }> = {
  "free-shipping":   { defaultLabel: "Free Shipping",   defaultSublabel: "On orders over $50"            },
  "returns":         { defaultLabel: "7-Day Returns",   defaultSublabel: "Easy & hassle-free"            },
  "secure":          { defaultLabel: "Secure Checkout", defaultSublabel: "Your data is protected"        },
  "support":         { defaultLabel: "24/7 Support",    defaultSublabel: "We're here to help"            },
  "quality":         { defaultLabel: "Quality Assured", defaultSublabel: "Hand-checked before shipping"  },
  "authentic":       { defaultLabel: "100% Authentic",  defaultSublabel: "Direct from the maker"         },
  "made-in-lebanon": { defaultLabel: "Made in Lebanon", defaultSublabel: "Crafted with local pride"      },
  "fast-delivery":   { defaultLabel: "Fast Delivery",   defaultSublabel: "Ships within 24 hours"         },
}

export const DEFAULT_TRUST_BADGES: TrustBadges = {
  enabled:     false,
  items: [
    { key: "free-shipping", label: TRUST_BADGE_PRESETS["free-shipping"].defaultLabel, sublabel: TRUST_BADGE_PRESETS["free-shipping"].defaultSublabel },
    { key: "returns",       label: TRUST_BADGE_PRESETS["returns"].defaultLabel,       sublabel: TRUST_BADGE_PRESETS["returns"].defaultSublabel       },
    { key: "secure",        label: TRUST_BADGE_PRESETS["secure"].defaultLabel,        sublabel: TRUST_BADGE_PRESETS["secure"].defaultSublabel        },
  ],
  accentColor: "",
}

export type StorefrontView = {
  // identity
  storeName: string
  tagline: string
  description: string
  logoUrl: string
  heroImage: string

  // hero
  ctaText: string
  ctaLink: string
  ctaHref?: string                 // render-time override; if absent, hero renders as <button>
  secondaryCta: CtaConfig
  template: TemplateId
  primaryColor: string
  secondaryColor: string
  fontFamily: FontFamily            // legacy; kept for backwards compat — fonts.headingFont takes precedence
  rtl: boolean

  // hero variant (alignment, overlay, video bg)
  heroVariant: HeroVariant

  // navigation (replaces Soukly nav on the public page)
  nav: StoreNav

  // theme + fonts + section bgs
  theme: Theme
  fonts: Fonts
  bgColors: BgColors

  // sections
  announcement:    AnnouncementBar
  aboutSection:    AboutSection
  productsSection: ProductsSection
  trustBadges:     TrustBadges

  // footer
  showFooter: boolean
  footerStyle: FooterStyle
  footerColors: FooterColors
  footerAlign: FooterAlign
  footerCopyright: string                   // empty = use default "© YEAR Store. All rights reserved."
  footerAbout: string
  footerEmail: string
  footerPhone: string
  footerWhatsapp: string
  footerAddress: string
  businessHours: string
  showSocial: boolean
  socialFacebook: string
  socialInstagram: string
  socialTiktok: string
  socialYoutube: string
  socialTwitter: string
  footerColumns: FooterColumn[]
  paymentMethods: PaymentMethod[]
}

export const DEFAULT_ANNOUNCEMENT: AnnouncementBar = {
  enabled: false,
  text: "Free shipping on orders over $50",
  bgColor: "#1f2937",
  textColor: "#ffffff",
  link: "",
}

export const DEFAULT_SECONDARY_CTA: CtaConfig = {
  enabled: true,
  label: "Learn More",
  link: "",
}

export const DEFAULT_ABOUT: AboutSection = {
  enabled:     false,
  heading:     "Our Story",
  body:        "",
  imageUrl:    "",
  template:    "split",
  flip:        false,
  align:       "left",
  eyebrow:     "About",
  bodySize:    "md",
  accentColor: "",
}

export const DEFAULT_PRODUCTS_SECTION: ProductsSection = {
  heading:     "",
  subheading:  "",
  accentColor: "",
}

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", url: "#products" },
      { label: "New Arrivals", url: "#products" },
    ],
  },
]

export const STOREFRONT_DEFAULTS = {
  ctaText: "Shop Now",
  ctaLink: "#products",
  template: "minimal" as TemplateId,
  primaryColor: "#8B5CF6",
  secondaryColor: "#EC4899",
  fontFamily: "modern" as FontFamily,
  rtl: false,
  showFooter: true,
  showSocial: true,
}

// ─── Normalize ────────────────────────────────────────────────────────────────

const str = (obj: Record<string, unknown> | null | undefined, k: string): string | undefined =>
  obj && typeof obj[k] === "string" ? (obj[k] as string) : undefined
const bool = (obj: Record<string, unknown> | null | undefined, k: string): boolean | undefined =>
  obj && typeof obj[k] === "boolean" ? (obj[k] as boolean) : undefined
const obj = (root: Record<string, unknown> | null | undefined, k: string): Record<string, unknown> | undefined => {
  const v = root?.[k]
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined
}
const arr = <T,>(root: Record<string, unknown> | null | undefined, k: string): T[] | undefined => {
  const v = root?.[k]
  return Array.isArray(v) ? (v as T[]) : undefined
}

function readAnnouncement(hero: Record<string, unknown> | null | undefined): AnnouncementBar {
  const a = obj(hero, "announcement") ?? {}
  return {
    enabled:   bool(a, "enabled")  ?? DEFAULT_ANNOUNCEMENT.enabled,
    text:      str(a, "text")      ?? DEFAULT_ANNOUNCEMENT.text,
    bgColor:   str(a, "bgColor")   ?? DEFAULT_ANNOUNCEMENT.bgColor,
    textColor: str(a, "textColor") ?? DEFAULT_ANNOUNCEMENT.textColor,
    link:      str(a, "link")      ?? DEFAULT_ANNOUNCEMENT.link,
  }
}

function readSecondaryCta(hero: Record<string, unknown> | null | undefined): CtaConfig {
  const c = obj(hero, "secondaryCta") ?? {}
  return {
    enabled: bool(c, "enabled") ?? DEFAULT_SECONDARY_CTA.enabled,
    label:   str(c, "label")    ?? DEFAULT_SECONDARY_CTA.label,
    link:    str(c, "link")     ?? DEFAULT_SECONDARY_CTA.link,
  }
}

function readAbout(hero: Record<string, unknown> | null | undefined): AboutSection {
  const a = obj(hero, "aboutSection") ?? {}
  const tplRaw = str(a, "template")
  const allowed: AboutTemplate[] = ["split", "centered", "image-overlay", "card", "polaroid", "minimal"]
  const template: AboutTemplate =
    typeof tplRaw === "string" && (allowed as string[]).includes(tplRaw)
      ? (tplRaw as AboutTemplate)
      : DEFAULT_ABOUT.template
  const alignRaw = str(a, "align")
  const align: AboutAlign =
    alignRaw === "center" || alignRaw === "right" || alignRaw === "left"
      ? alignRaw
      : DEFAULT_ABOUT.align
  const sizeRaw = str(a, "bodySize")
  const bodySize: AboutBodySize =
    sizeRaw === "sm" || sizeRaw === "lg" || sizeRaw === "md"
      ? sizeRaw
      : DEFAULT_ABOUT.bodySize
  return {
    enabled:     bool(a, "enabled")     ?? DEFAULT_ABOUT.enabled,
    heading:     str(a, "heading")      ?? DEFAULT_ABOUT.heading,
    body:        str(a, "body")         ?? DEFAULT_ABOUT.body,
    imageUrl:    str(a, "imageUrl")     ?? DEFAULT_ABOUT.imageUrl,
    template,
    flip:        bool(a, "flip")        ?? DEFAULT_ABOUT.flip,
    align,
    // Distinguish "field absent in old save" (→ default "About") from
    // "seller cleared it" (→ "" hides the kicker): only fall back when undefined.
    eyebrow:     str(a, "eyebrow")      ?? DEFAULT_ABOUT.eyebrow,
    bodySize,
    accentColor: str(a, "accentColor")  ?? "",
  }
}

function readProductsSection(hero: Record<string, unknown> | null | undefined): ProductsSection {
  const p = obj(hero, "productsSection") ?? {}
  return {
    heading:     str(p, "heading")     ?? DEFAULT_PRODUCTS_SECTION.heading,
    subheading:  str(p, "subheading")  ?? DEFAULT_PRODUCTS_SECTION.subheading,
    accentColor: str(p, "accentColor") ?? "",
  }
}

function readFooterColumns(footer: Record<string, unknown> | null | undefined): FooterColumn[] {
  const cols = arr<unknown>(footer, "footerColumns")
  if (!cols) return []
  return cols
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      title: typeof c.title === "string" ? c.title : "",
      links: Array.isArray(c.links)
        ? (c.links as unknown[])
            .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
            .map((l) => ({
              label: typeof l.label === "string" ? l.label : "",
              url:   typeof l.url   === "string" ? l.url   : "",
            }))
            .filter((l) => l.label && l.url)
        : [],
    }))
    .filter((c) => c.title || c.links.length > 0)
}

function readPaymentMethods(footer: Record<string, unknown> | null | undefined): PaymentMethod[] {
  const list = arr<unknown>(footer, "paymentMethods")
  if (!list) return []
  return list.filter((m): m is PaymentMethod =>
    typeof m === "string" && (ALL_PAYMENT_METHODS as readonly string[]).includes(m)
  )
}

function readFooterColors(footer: Record<string, unknown> | null | undefined): FooterColors {
  const c = obj(footer, "footerColors") ?? {}
  return {
    text:    str(c, "text")    ?? "",
    heading: str(c, "heading") ?? "",
    accent:  str(c, "accent")  ?? "",
    border:  str(c, "border")  ?? "",
  }
}

function readNav(hero: Record<string, unknown> | null | undefined): StoreNav {
  const n = obj(hero, "nav")
  if (!n) return DEFAULT_NAV
  const links = Array.isArray(n.links)
    ? (n.links as unknown[])
        .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
        .map((l) => ({
          label: typeof l.label === "string" ? l.label : "",
          url:   typeof l.url   === "string" ? l.url   : "",
        }))
        .filter((l) => l.label && l.url)
    : DEFAULT_NAV.links
  return {
    links,
    showCart: bool(n, "showCart") ?? DEFAULT_NAV.showCart,
  }
}

function readTheme(hero: Record<string, unknown> | null | undefined): Theme {
  const t = obj(hero, "theme") ?? {}
  const radii  = ["sharp", "rounded", "pill"] as const
  const widths = ["narrow", "standard", "wide", "full"] as const
  const space  = ["compact", "comfortable", "airy"] as const
  const cards  = ["compact", "standard", "cinematic"] as const
  const pick = <V extends string>(val: unknown, allowed: readonly V[], fallback: V): V =>
    typeof val === "string" && (allowed as readonly string[]).includes(val) ? (val as V) : fallback
  return {
    borderRadius:      pick(t.borderRadius,     radii,  DEFAULT_THEME.borderRadius),
    containerWidth:    pick(t.containerWidth,   widths, DEFAULT_THEME.containerWidth),
    sectionSpacing:    pick(t.sectionSpacing,   space,  DEFAULT_THEME.sectionSpacing),
    productCardStyle:  pick(t.productCardStyle, cards,  DEFAULT_THEME.productCardStyle),
    showProductRating: typeof t.showProductRating === "boolean" ? t.showProductRating : DEFAULT_THEME.showProductRating,
  }
}

function readFonts(hero: Record<string, unknown> | null | undefined): Fonts {
  const f = obj(hero, "fonts") ?? {}
  const valid = (id: unknown, fallback: string) =>
    typeof id === "string" && FONT_BY_ID[id] ? id : fallback
  return {
    headingFont: valid(f.headingFont, DEFAULT_FONTS.headingFont),
    bodyFont:    valid(f.bodyFont,    DEFAULT_FONTS.bodyFont),
  }
}

function readBgColors(hero: Record<string, unknown> | null | undefined): BgColors {
  const b = obj(hero, "bgColors") ?? {}
  return {
    about:    str(b, "about")    ?? "",
    products: str(b, "products") ?? "",
    footer:   str(b, "footer")   ?? "",
  }
}

function readHeroVariant(hero: Record<string, unknown> | null | undefined): HeroVariant {
  const h = obj(hero, "heroVariant") ?? {}
  const align: HeroAlign = h.align === "center" || h.align === "right" || h.align === "left"
    ? h.align
    : DEFAULT_HERO_VARIANT.align
  const op = typeof h.overlayOpacity === "number" ? h.overlayOpacity : DEFAULT_HERO_VARIANT.overlayOpacity
  const bool = (key: string, fallback: boolean) =>
    typeof h[key] === "boolean" ? (h[key] as boolean) : fallback
  const heightRaw = str(h, "height")
  const height: HeroHeight =
    heightRaw === "short" || heightRaw === "tall" || heightRaw === "full" || heightRaw === "medium"
      ? heightRaw
      : DEFAULT_HERO_VARIANT.height
  const bgPosRaw = str(h, "bgPosition")
  const bgPosition: HeroBgPosition =
    bgPosRaw === "top" || bgPosRaw === "bottom" || bgPosRaw === "center"
      ? bgPosRaw
      : DEFAULT_HERO_VARIANT.bgPosition
  return {
    align,
    height,
    bgPosition,
    eyebrow:         str(h, "eyebrow") ?? DEFAULT_HERO_VARIANT.eyebrow,
    showEyebrow:     bool("showEyebrow", DEFAULT_HERO_VARIANT.showEyebrow),
    overlayOpacity:  Math.max(0, Math.min(100, op)),
    overlayColor:    str(h, "overlayColor") ?? DEFAULT_HERO_VARIANT.overlayColor,
    videoUrl:        str(h, "videoUrl")     ?? "",
    imageUrl:        str(h, "imageUrl")     ?? "",
    showStoreName:   bool("showStoreName",   DEFAULT_HERO_VARIANT.showStoreName),
    showTagline:     bool("showTagline",     DEFAULT_HERO_VARIANT.showTagline),
    showDescription: bool("showDescription", DEFAULT_HERO_VARIANT.showDescription),
    showPrimaryCta:  bool("showPrimaryCta",  DEFAULT_HERO_VARIANT.showPrimaryCta),
    showLogo:        bool("showLogo",        DEFAULT_HERO_VARIANT.showLogo),
    primaryColor:    str(h, "primaryColor")   ?? "",
    secondaryColor:  str(h, "secondaryColor") ?? "",
  }
}

function readTrustBadges(hero: Record<string, unknown> | null | undefined): TrustBadges {
  const t = obj(hero, "trustBadges")
  if (!t) return DEFAULT_TRUST_BADGES
  const items = Array.isArray(t.items)
    ? (t.items as unknown[])
        .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
        .map((i) => {
          const key = typeof i.key === "string" && i.key in TRUST_BADGE_PRESETS
            ? (i.key as TrustBadgeKey)
            : null
          if (!key) return null
          const preset = TRUST_BADGE_PRESETS[key]
          return {
            key,
            label:    typeof i.label    === "string" && i.label    ? i.label    : preset.defaultLabel,
            sublabel: typeof i.sublabel === "string"               ? i.sublabel : preset.defaultSublabel,
          } as TrustBadgeItem
        })
        .filter((i): i is TrustBadgeItem => i !== null)
    : DEFAULT_TRUST_BADGES.items
  return {
    enabled:     bool(t, "enabled") ?? DEFAULT_TRUST_BADGES.enabled,
    items,
    accentColor: str(t, "accentColor") ?? "",
  }
}

export function storeToView(store: Store, opts: { ctaHref?: string } = {}): StorefrontView {
  const hero   = (store.hero   ?? {}) as Record<string, unknown>
  const footer = (store.footer ?? {}) as Record<string, unknown>

  const ctaLink = str(hero, "ctaLink") ?? str(hero, "cta_link") ?? STOREFRONT_DEFAULTS.ctaLink
  // Per-section colors take precedence over legacy top-level primaryColor/secondaryColor.
  // The seller picks Hero's primary, which then becomes the brand color other
  // sections fall back to. Old stores keep working because the legacy top-level
  // value is still the final fallback if heroVariant colors are empty.
  const heroVariant = readHeroVariant(hero)
  const legacyPrimary   = str(hero, "primaryColor")   ?? STOREFRONT_DEFAULTS.primaryColor
  const legacySecondary = str(hero, "secondaryColor") ?? STOREFRONT_DEFAULTS.secondaryColor

  return {
    storeName:       store.name,
    tagline:         str(hero, "tagline") ?? "",
    description:     store.description ?? "",
    logoUrl:         store.logo_url ?? "",
    heroImage:       store.cover_url ?? "",
    ctaText:         str(hero, "ctaText")  ?? str(hero, "cta_text") ?? STOREFRONT_DEFAULTS.ctaText,
    ctaLink,
    ctaHref:         opts.ctaHref ?? ctaLink,
    secondaryCta:    readSecondaryCta(hero),
    template:        (str(hero, "template") as TemplateId)  ?? STOREFRONT_DEFAULTS.template,
    primaryColor:    heroVariant.primaryColor   || legacyPrimary,
    secondaryColor:  heroVariant.secondaryColor || legacySecondary,
    fontFamily:      (str(hero, "fontFamily") as FontFamily)?? STOREFRONT_DEFAULTS.fontFamily,
    rtl:             bool(hero, "rtl")                      ?? STOREFRONT_DEFAULTS.rtl,
    heroVariant,
    nav:             readNav(hero),
    theme:           readTheme(hero),
    fonts:           readFonts(hero),
    bgColors:        readBgColors(hero),
    announcement:    readAnnouncement(hero),
    aboutSection:    readAbout(hero),
    productsSection: readProductsSection(hero),
    trustBadges:     readTrustBadges(hero),
    showFooter:      bool(footer, "showFooter")             ?? STOREFRONT_DEFAULTS.showFooter,
    footerStyle:     ((s: unknown): FooterStyle => {
                       const allowed = ["dark", "light", "branded", "minimal", "custom"] as const
                       return typeof s === "string" && (allowed as readonly string[]).includes(s) ? (s as FooterStyle) : "dark"
                     })(str(footer, "footerStyle")),
    footerColors:    readFooterColors(footer),
    footerAlign:     str(footer, "footerAlign") === "center" ? "center" : "left",
    footerCopyright: str(footer, "footerCopyright") ?? "",
    footerAbout:     str(footer, "footerAbout") ?? str(footer, "about_text")    ?? "",
    footerEmail:     str(footer, "footerEmail") ?? str(footer, "contact_email") ?? "",
    footerPhone:     str(footer, "footerPhone") ?? "",
    footerWhatsapp:  store.whatsapp ?? "",
    footerAddress:   str(footer, "footerAddress") ?? "",
    businessHours:   str(footer, "businessHours") ?? "",
    showSocial:      bool(footer, "showSocial") ?? STOREFRONT_DEFAULTS.showSocial,
    socialFacebook:  store.facebook  ?? "",
    socialInstagram: store.instagram ?? "",
    socialTiktok:    store.tiktok    ?? "",
    // Prefer top-level column (post-migration), fall back to JSONB for old saves
    socialYoutube:   store.youtube ?? str(footer, "socialYoutube") ?? "",
    socialTwitter:   store.twitter ?? str(footer, "socialTwitter") ?? "",
    footerColumns:   readFooterColumns(footer),
    paymentMethods:  readPaymentMethods(footer),
  }
}

// ─── Inline brand SVGs (lucide doesn't ship Pinterest/TikTok) ────────────────

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.51a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.04Z" />
    </svg>
  )
}

// ─── Announcement bar ─────────────────────────────────────────────────────────

export function StorefrontAnnouncementBar({ view }: { view: StorefrontView }) {
  const a = view.announcement
  if (!a.enabled || !a.text) return null

  const inner = (
    <span className="text-xs sm:text-sm font-medium tracking-wide">{a.text}</span>
  )

  return (
    <div
      className="w-full text-center px-4 py-2"
      style={{ backgroundColor: a.bgColor, color: a.textColor }}
      dir={view.rtl ? "rtl" : "ltr"}
    >
      {a.link ? (
        <a href={a.link} className="hover:opacity-80 transition-opacity">{inner}</a>
      ) : inner}
    </div>
  )
}

// ─── About section ────────────────────────────────────────────────────────────

export function StorefrontAbout({ view }: { view: StorefrontView }) {
  const a = view.aboutSection
  if (!a.enabled || (!a.heading && !a.body && !a.imageUrl)) return null

  const fontClass = FONT_CLASS[view.fontFamily] ?? "font-sans"
  const tokens = themeTokens(view.theme)
  const bgStyle = view.bgColors.about ? { backgroundColor: view.bgColors.about } : undefined
  // Section accent: per-section override → falls back to global brand color
  const aboutAccent = a.accentColor || view.primaryColor
  const headingStyle: React.CSSProperties =
    view.fonts.headingFont && view.fonts.headingFont !== "system"
      ? { color: aboutAccent, fontFamily: fontFamily(view.fonts.headingFont) }
      : { color: aboutAccent }

  // Text alignment for templates that have a dedicated text column (Split / Card /
  // Polaroid). The Centered, Minimal & Overlay templates are center-aligned by design.
  const alignText  = a.align === "center" ? "text-center" : a.align === "right" ? "text-right" : "text-left"
  const alignItems = a.align === "center" ? "items-center" : a.align === "right" ? "items-end" : "items-start"
  // Shared, more readable body type — comfortable measure + relaxed leading.
  // Size scales with the seller's Body Size setting.
  const bodySizeClass =
    a.bodySize === "sm" ? "text-sm md:text-[15px]"
    : a.bodySize === "lg" ? "text-base md:text-lg"
    : "text-[15px] md:text-base"
  const bodyClass = cn(bodySizeClass, "text-muted-foreground leading-[1.85] whitespace-pre-line")
  // Eyebrow kicker text — seller-configurable; empty string hides it.
  const eyebrow = a.eyebrow.trim()

  const heading = a.heading && (
    <h2 className={cn("text-3xl md:text-4xl font-bold leading-tight tracking-tight", fontClass)} style={headingStyle}>
      {a.heading}
    </h2>
  )
  const image = a.imageUrl && (
    <div className={cn("overflow-hidden aspect-[4/3] bg-muted shadow-sm", tokens.radius)}>
      <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
    </div>
  )

  // ── Image-overlay ── full-bleed bg image with overlay tint and centered text
  if (a.template === "image-overlay") {
    const hasMedia = !!a.imageUrl
    return (
      <section
        id="about"
        className="relative overflow-hidden border-y"
        style={bgStyle}
        dir={view.rtl ? "rtl" : "ltr"}
      >
        {hasMedia && (
          <img
            src={a.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!hasMedia && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg,${aboutAccent},${view.secondaryColor})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
        <div className={cn("relative container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          <div className="max-w-2xl mx-auto text-center space-y-5 text-white">
            {a.heading && (
              <h2
                className={cn("text-3xl md:text-5xl font-bold leading-tight tracking-tight drop-shadow", fontClass)}
                style={view.fonts.headingFont && view.fonts.headingFont !== "system" ? { fontFamily: fontFamily(view.fonts.headingFont) } : undefined}
              >
                {a.heading}
              </h2>
            )}
            {a.body && (
              <p className="text-base md:text-lg text-white/90 leading-relaxed whitespace-pre-line drop-shadow-sm">
                {a.body}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="h-px w-12 bg-white/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="h-px w-12 bg-white/60" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Card ── content in a floating rounded card over a contrasting bg
  if (a.template === "card") {
    const surfaceBg = view.bgColors.about ? undefined : { background: `linear-gradient(135deg,${aboutAccent}10,${view.secondaryColor}12)` }
    return (
      <section
        id="about"
        className={cn("border-y", !bgStyle && !surfaceBg ? "bg-muted/20" : "")}
        style={bgStyle ?? surfaceBg}
        dir={view.rtl ? "rtl" : "ltr"}
      >
        <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          <div className={cn(
            "max-w-5xl mx-auto bg-background shadow-xl ring-1 ring-black/5 p-6 md:p-10",
            tokens.radius,
          )}>
            <div className={cn("grid gap-8 items-center", a.imageUrl ? "md:grid-cols-2" : "max-w-2xl mx-auto")}>
              {a.imageUrl && !a.flip && image}
              <div className={cn("space-y-4", alignText)}>
                {a.heading && (
                  <div className="space-y-2">
                    {eyebrow && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-2.5 py-1 rounded-full" style={{ backgroundColor: `${aboutAccent}15`, color: aboutAccent }}>
                        {eyebrow}
                      </span>
                    )}
                    {heading}
                  </div>
                )}
                {a.body && (
                  <p className={bodyClass}>{a.body}</p>
                )}
              </div>
              {a.imageUrl && a.flip && image}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Polaroid ── tilted image with a thick white border, beside the text
  if (a.template === "polaroid") {
    return (
      <section
        id="about"
        className={cn("border-y", !bgStyle && "bg-muted/20")}
        style={bgStyle}
        dir={view.rtl ? "rtl" : "ltr"}
      >
        <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          <div className={cn("grid gap-12 items-center", a.imageUrl ? "md:grid-cols-2" : "max-w-2xl mx-auto")}>
            {a.imageUrl && (
              <div className={cn("flex", a.flip ? "md:order-2 justify-center md:justify-end" : "justify-center md:justify-start")}>
                <div
                  className="bg-white p-3 pb-10 shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500 max-w-sm w-full"
                  style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)" }}
                >
                  <img src={a.imageUrl} alt="" className="w-full aspect-square object-cover" />
                </div>
              </div>
            )}
            <div className={cn("space-y-4", alignText)}>
              {heading}
              {a.body && (
                <p className={bodyClass}>{a.body}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Minimal ── text-only, large display typography. Image (if any) is a
  // narrow top accent strip rather than the centerpiece.
  if (a.template === "minimal") {
    return (
      <section
        id="about"
        className={cn("border-y", !bgStyle && "bg-muted/20")}
        style={bgStyle}
        dir={view.rtl ? "rtl" : "ltr"}
      >
        <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          {a.imageUrl && (
            <div className={cn("overflow-hidden aspect-[5/1] bg-muted mb-12 max-w-4xl mx-auto", tokens.radius)}>
              <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="max-w-3xl mx-auto space-y-8">
            {eyebrow && (
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">{eyebrow}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            )}
            {a.heading && (
              <h2
                className={cn("text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-center", fontClass)}
                style={headingStyle}
              >
                {a.heading}
              </h2>
            )}
            {a.body && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line text-center max-w-2xl mx-auto">
                {a.body}
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ── Centered ── narrow column, image above text, everything center-aligned
  if (a.template === "centered") {
    return (
      <section
        id="about"
        className={cn("border-y", !bgStyle && "bg-muted/20")}
        style={bgStyle}
        dir={view.rtl ? "rtl" : "ltr"}
      >
        <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {a.imageUrl && (
              <div className={cn("overflow-hidden aspect-[4/3] bg-muted mx-auto shadow-md max-w-md", tokens.radius)}>
                <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {a.heading && (
              <div className="space-y-3">
                <h2 className={cn("text-3xl md:text-4xl font-bold leading-tight tracking-tight", fontClass)} style={headingStyle}>
                  {a.heading}
                </h2>
                <span
                  className="block h-1 w-12 mx-auto rounded-full"
                  style={{ backgroundColor: aboutAccent }}
                />
              </div>
            )}
            {a.body && (
              <p className={cn(bodyClass, "max-w-2xl mx-auto")}>{a.body}</p>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ── Split (default) ── image and text side-by-side; flip swaps the order
  return (
    <section
      id="about"
      className={cn("border-y", !bgStyle && "bg-muted/20")}
      style={bgStyle}
      dir={view.rtl ? "rtl" : "ltr"}
    >
      <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
        <div className={cn("grid gap-10 md:gap-14 items-center", a.imageUrl ? "md:grid-cols-2" : "max-w-2xl mx-auto")}>
          {a.imageUrl && !a.flip && image}
          <div className={cn("space-y-5", alignText)}>
            {a.heading && (
              <div className={cn("flex flex-col gap-3", alignItems)}>
                {eyebrow && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: aboutAccent }}>
                    {eyebrow}
                  </span>
                )}
                <h2 className={cn("text-3xl md:text-4xl font-bold leading-tight tracking-tight", fontClass)} style={headingStyle}>
                  {a.heading}
                </h2>
              </div>
            )}
            {a.body && (
              <p className={bodyClass}>{a.body}</p>
            )}
          </div>
          {a.imageUrl && a.flip && image}
        </div>
      </div>
    </section>
  )
}

// ─── Mini-nav (used inside the builder preview only) ─────────────────────────

export function StorefrontMiniNav({ view }: { view: StorefrontView }) {
  return (
    <div className="border-b px-6 py-3 flex items-center justify-between bg-white" dir={view.rtl ? "rtl" : "ltr"}>
      <span className="font-bold text-sm tracking-tight" style={{ color: view.primaryColor }}>
        {view.storeName}
      </span>
      <nav className="flex gap-5 text-xs text-muted-foreground">
        {(view.rtl
          ? ["منتجات", "عن المتجر", "تواصل"]
          : ["Products", "About", "Contact"]
        ).map((l) => (
          <span key={l} className="hover:text-foreground cursor-pointer transition-colors">{l}</span>
        ))}
      </nav>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const FONT_CLASS: Record<FontFamily, string> = {
  modern:  "font-sans",
  classic: "font-serif",
  elegant: "font-serif italic",
  bold:    "font-sans font-black",
}

export function StorefrontHero(props: { view: StorefrontView }) {
  // Wrapper carries a data attribute that pairs with a CSS rule in globals.css
  // (`[data-sf-hero] :where(h1, h2, p):empty { display: none }`), so any text
  // element whose interpolated value is hidden via a visibility toggle below
  // collapses automatically without per-template edits.
  return (
    <div data-sf-hero>
      <StorefrontHeroBody {...props} />
    </div>
  )
}

function StorefrontHeroBody({ view }: { view: StorefrontView }) {
  const fontClass = FONT_CLASS[view.fontFamily] ?? "font-sans"
  const { ctaText, ctaHref, secondaryCta, template, rtl, heroVariant } = view
  // Hero's per-section colors override the legacy view-level brand colors when set.
  const primaryColor   = heroVariant.primaryColor   || view.primaryColor
  const secondaryColor = heroVariant.secondaryColor || view.secondaryColor
  // Apply visibility toggles: when a toggle is off, the corresponding value
  // is blanked, and the CSS rule on `[data-sf-hero]` hides the resulting
  // empty element so no vertical space leaks through.
  const storeName   = heroVariant.showStoreName   ? view.storeName   : ""
  const tagline     = heroVariant.showTagline     ? view.tagline     : ""
  const description = heroVariant.showDescription ? view.description : ""
  // Hero background image is independent from the store-card cover (`view.heroImage`).
  // Templates that show a hero image use this dedicated field on heroVariant.
  const heroImage = heroVariant.imageUrl

  // Heading font override — only applies when seller picked a non-system font.
  // Otherwise we keep the legacy Tailwind fontClass so existing stores look the same.
  const headingStyle: React.CSSProperties | undefined =
    view.fonts.headingFont && view.fonts.headingFont !== "system"
      ? { fontFamily: fontFamily(view.fonts.headingFont) }
      : undefined

  // Primary CTA — anchor when href provided, plain button otherwise (preview in builder).
  // Returns null when the seller toggles off the primary button — keeps the CTA
  // row collapsed if only the secondary is also off.
  const PrimaryCta = ({ className, style, label }: { className: string; style?: React.CSSProperties; label?: string }) => {
    if (!heroVariant.showPrimaryCta) return null
    const text = label ?? ctaText
    return ctaHref
      ? <a href={ctaHref} className={className} style={style}>{text}</a>
      : <button className={className} style={style}>{text}</button>
  }

  // Secondary CTA — anchor when label and link both set; button when only label set; null when disabled.
  const SecondaryCta = ({ className, style, fallbackLabel }: { className: string; style?: React.CSSProperties; fallbackLabel: string }) => {
    if (!secondaryCta.enabled) return null
    const label = secondaryCta.label || fallbackLabel
    if (!label) return null
    if (secondaryCta.link && ctaHref !== undefined) {
      // public-page render
      return <a href={secondaryCta.link} className={className} style={style}>{label}</a>
    }
    return <button className={className} style={style}>{label}</button>
  }

  const wrapDir = rtl ? "rtl" : "ltr"

  // Hero alignment helper — now honored by every template (the text column for
  // split layouts, the whole block for full-bleed ones).
  const align = heroVariant.align
  const alignClass =
    align === "center" ? "text-center items-center mx-auto"
    : align === "right" ? "text-right items-end ml-auto"
    : "text-left items-start"
  const flexAlignClass =
    align === "center" ? "justify-center"
    : align === "right" ? "justify-end"
    : "justify-start"
  // Aligns a flex column's cross-axis without forcing horizontal centering of the
  // block itself (used for split-layout text columns).
  const colAlignClass =
    align === "center" ? "items-center text-center"
    : align === "right" ? "items-end text-right"
    : "items-start text-left"

  // Hero height — applies to every template. Media-led templates keep a taller
  // floor by bumping one step, so "medium" still reads cinematic for them.
  const heightClass =
    heroVariant.height === "short" ? "min-h-[360px]"
    : heroVariant.height === "tall" ? "min-h-[620px] md:min-h-[760px]"
    : heroVariant.height === "full" ? "min-h-screen"
    : "min-h-[480px] md:min-h-[560px]"

  // Background focal point for image templates → CSS background-position keyword.
  const bgPos = heroVariant.bgPosition === "top" ? "top" : heroVariant.bgPosition === "bottom" ? "bottom" : "center"

  // Eyebrow kicker resolver: seller's custom text → else the template's built-in
  // default → hidden entirely when the seller turns the kicker off.
  const resolveEyebrow = (def: string) => (heroVariant.showEyebrow ? (heroVariant.eyebrow.trim() || def) : "")

  // Overlay opacity for templates that use bg image/video.
  const overlayAlpha = heroVariant.overlayOpacity / 100
  const heroVideoUrl = heroVariant.videoUrl
  // Effective overlay color — defaults to the brand color so the seller's
  // opacity slider actually tints their image instead of just darkening it.
  // The seller can still pick black or any other hex in the Hero overlay UI.
  const overlayColor =
    heroVariant.overlayColor && heroVariant.overlayColor !== "#000000"
      ? heroVariant.overlayColor
      : primaryColor

  // ── 1. Minimal ──
  if (template === "minimal") {
    const eyebrow = resolveEyebrow("")
    return (
      <div dir={wrapDir} className={cn("bg-white flex items-center px-10 py-16", heightClass, flexAlignClass)}>
        <div className={cn("max-w-lg space-y-6 flex flex-col", colAlignClass)}>
          <div className={cn("space-y-3", alignClass)}>
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: primaryColor }}>{eyebrow}</p>
            )}
            <h1 className={cn("text-4xl font-bold leading-tight tracking-tight", fontClass)} style={{ ...headingStyle, color: primaryColor }}>
              {storeName}
            </h1>
            <p className="text-lg text-gray-400 font-light">{tagline}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          </div>
          <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-7 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all inline-block"
              style={{ backgroundColor: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel={rtl ? "اكتشف المزيد" : "Learn More"}
              className="px-7 py-2.5 rounded-full text-sm font-semibold border-2 hover:bg-black/5 transition-colors inline-block"
              style={{ borderColor: primaryColor, color: primaryColor }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 2. Bold ──
  if (template === "bold") {
    const eyebrow = resolveEyebrow(rtl ? "مرحباً بك في متجرنا" : "Welcome to our store")
    return (
      <div
        dir={wrapDir}
        className={cn("px-10 py-16 flex items-center", heightClass, flexAlignClass)}
        style={{ background: `linear-gradient(135deg,${primaryColor} 0%,${secondaryColor} 100%)` }}
      >
        <div className={cn("max-w-2xl space-y-6 text-white flex flex-col", colAlignClass)}>
          {eyebrow && (
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {eyebrow}
            </div>
          )}
          <h1 className={cn("text-5xl font-extrabold leading-tight tracking-tight text-balance", fontClass)} style={headingStyle}>
            {storeName}
          </h1>
          <p className="text-xl text-white/85 leading-relaxed">{tagline}</p>
          <p className="text-sm text-white/65 max-w-lg leading-relaxed">{description}</p>
          <div className={cn("flex gap-3 pt-2", rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-9 py-3 bg-white rounded-full text-sm font-bold shadow-2xl hover:scale-105 transition-transform inline-block"
              style={{ color: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel=""
              className="px-9 py-3 rounded-full text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition-colors inline-block"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 3. Elegant ──
  if (template === "elegant") {
    const eyebrow = resolveEyebrow(rtl ? "مرحباً بكم" : "Welcome")
    return (
      <div dir={wrapDir} className={cn("grid md:grid-cols-2 bg-stone-50", heightClass)}>
        <div className="px-10 py-16 flex items-center">
          <div className={cn("space-y-6 flex flex-col w-full", colAlignClass)}>
            {eyebrow && (
              <div className={cn("flex items-center gap-3", rtl && "flex-row-reverse")}>
                <div className="h-px w-10" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: primaryColor }}>
                  {eyebrow}
                </span>
              </div>
            )}
            <h1 className={cn("text-4xl font-bold leading-tight tracking-tight", fontClass)} style={{ ...headingStyle, color: "#1a1a1a" }}>
              {storeName}
            </h1>
            <p className="text-lg text-gray-500 italic leading-relaxed">{tagline}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
              <PrimaryCta
                className="px-8 py-3 rounded-lg text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity inline-block"
                style={{ backgroundColor: primaryColor }}
              />
              <SecondaryCta
                fallbackLabel=""
                className="px-8 py-3 rounded-lg text-sm font-semibold border-2 hover:bg-black/5 transition-colors inline-block"
                style={{ borderColor: primaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </div>
        <div
          className="relative overflow-hidden min-h-[280px]"
          style={{
            background: heroVideoUrl
              ? undefined
              : heroImage
                ? `url(${heroImage}) ${bgPos}/cover no-repeat`
                : `linear-gradient(135deg,${primaryColor}20 0%,${secondaryColor}20 100%)`,
          }}
        >
          {heroVideoUrl && (
            <video
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {!heroImage && !heroVideoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  🛍️
                </div>
                <p className="text-xs text-gray-400">{rtl ? "أضف صورة البطل" : "Add a hero image"}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    )
  }

  // ── 4. Modern ──
  if (template === "modern") {
    const eyebrow = resolveEyebrow(rtl ? "بوتيك حصري" : "Exclusive Boutique")
    return (
      <div dir={wrapDir} className={cn("bg-slate-950 px-10 py-16 flex items-center", heightClass)}>
        <div className="w-full grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div className={cn("space-y-6 text-white flex flex-col", colAlignClass)}>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: primaryColor }}>
                {eyebrow}
              </p>
            )}
            <h1 className={cn("text-5xl font-extrabold leading-tight tracking-tight", fontClass)} style={headingStyle}>{storeName}</h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-md">{tagline}</p>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">{description}</p>
            <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
              <PrimaryCta
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all inline-block"
                style={{ backgroundColor: primaryColor }}
              />
              <SecondaryCta
                fallbackLabel={rtl ? "تصفح" : "Browse"}
                className="px-7 py-2.5 rounded-full text-sm font-bold border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors inline-block"
              />
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 w-52">
            {[`${primaryColor}30`, `${secondaryColor}30`, `${secondaryColor}20`, `${primaryColor}20`].map((bg, i) => (
              <div key={i} className={cn("h-28 rounded-2xl", i % 2 === 1 && "mt-5")} style={{ backgroundColor: bg }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── 5. Cinematic ──
  if (template === "cinematic") {
    const hasMedia = !!(heroImage || heroVideoUrl)
    const eyebrow = resolveEyebrow(rtl ? "مرحباً في" : "Welcome to")
    return (
      <div
        dir={wrapDir}
        className={cn("relative flex items-center overflow-hidden", heightClass, flexAlignClass)}
        style={{
          background: hasMedia
            ? undefined
            : `linear-gradient(135deg,#0f172a 0%,${primaryColor}55 50%,#0f172a 100%)`,
        }}
      >
        {/* Background media — slow Ken Burns zoom for still images */}
        {heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : heroImage ? (
          <div
            className="absolute inset-0 animate-[sf-kenburns_28s_ease-in-out_infinite_alternate]"
            style={{ background: `url(${heroImage}) ${bgPos}/cover no-repeat` }}
          />
        ) : null}

        {/* Colored overlay — seller's overlay color tints the image. Defaults
            to the brand color so the picture actually picks up the store's
            identity instead of going dark grey. */}
        {hasMedia && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${hexToRgba(overlayColor, overlayAlpha * 0.55)} 0%, ${hexToRgba(overlayColor, overlayAlpha)} 100%)`,
              mixBlendMode: "multiply",
            }}
          />
        )}

        {/* Bottom-fade for text legibility — always present so titles read
            on any image. Stays neutral so it doesn't fight the brand overlay. */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        {/* Content — slides up gently on mount */}
        <div
          className={cn(
            "relative z-10 text-white px-6 md:px-12 py-20 md:py-24 space-y-6 max-w-2xl animate-[sf-fade-up_900ms_ease-out_both]",
            alignClass,
          )}
        >
          {/* Accent rule above title */}
          {eyebrow && (
            <div className={cn("flex items-center gap-3", rtl && "flex-row-reverse")}>
              <span className="h-px w-12" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/85">
                {eyebrow}
              </span>
            </div>
          )}

          <h1
            className={cn("text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] drop-shadow-2xl", fontClass)}
            style={headingStyle}
          >
            {storeName}
          </h1>

          {tagline && (
            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-xl drop-shadow">{tagline}</p>
          )}

          {description && (
            <p className="text-sm md:text-base text-white/65 leading-relaxed max-w-lg">{description}</p>
          )}

          <div className={cn("flex gap-3 pt-3", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-9 py-3.5 rounded-full text-sm font-bold text-white shadow-2xl hover:scale-[1.03] transition-transform inline-block"
              style={{ backgroundColor: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel={rtl ? "اكتشف" : "Discover"}
              className="px-9 py-3.5 rounded-full text-sm font-semibold text-white border border-white/30 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all inline-block"
            />
          </div>
        </div>

        {/* Scroll cue — minimal arrow, no extra label */}
        <a
          href={ctaHref ?? "#products"}
          aria-label={rtl ? "اسحب للأسفل" : "Scroll to discover"}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors animate-[sf-scroll-bounce_2.4s_ease-in-out_infinite]"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    )
  }

  // ── 6. Glass ──
  if (template === "glass") {
    const eyebrow = resolveEyebrow("")
    return (
      <div
        dir={wrapDir}
        className={cn("relative flex items-center justify-center overflow-hidden px-10 py-16", heightClass)}
        style={{ background: `linear-gradient(135deg,${primaryColor} 0%,${secondaryColor} 100%)` }}
      >
        <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full blur-3xl opacity-40" style={{ backgroundColor: secondaryColor }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full blur-3xl opacity-40" style={{ backgroundColor: primaryColor }} />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full blur-2xl opacity-20" style={{ backgroundColor: "#ffffff" }} />

        <div
          className={cn("relative z-10 rounded-3xl p-10 max-w-lg w-full space-y-6 flex flex-col", colAlignClass)}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          {eyebrow && (
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/80">{eyebrow}</span>
          )}
          <h1 className={cn("text-4xl font-bold text-white leading-tight tracking-tight drop-shadow", fontClass)} style={headingStyle}>
            {storeName}
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">{tagline}</p>
          <p className="text-white/65 text-sm leading-relaxed">{description}</p>
          <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-8 py-3 rounded-full text-sm font-bold text-white border border-white/40 hover:bg-white/20 transition-colors shadow-lg inline-block"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            />
            <SecondaryCta
              fallbackLabel=""
              className="px-8 py-3 rounded-full text-sm font-bold text-white/80 hover:text-white transition-colors inline-block"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 7. Geometric ──
  if (template === "geometric") {
    const eyebrow = resolveEyebrow(rtl ? "متجرنا" : "Our Store")
    return (
      <div dir={wrapDir} className={cn("bg-white relative overflow-hidden flex items-center", heightClass, flexAlignClass)}>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ backgroundColor: `${primaryColor}18` }} />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full" style={{ backgroundColor: `${secondaryColor}15` }} />
        <div className="absolute bottom-16 right-16 w-20 h-20 rounded-full" style={{ backgroundColor: `${primaryColor}12` }} />
        <div className="absolute top-16 right-52 w-16 h-16 rounded-xl rotate-45" style={{ backgroundColor: `${secondaryColor}20` }} />

        <div className={cn("relative z-10 px-14 py-16 max-w-xl space-y-6 flex flex-col", colAlignClass)}>
          <div className={cn("flex items-center gap-4", rtl && "flex-row-reverse")}>
            <div className="w-1 h-14 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="space-y-2">
              {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                  {eyebrow}
                </p>
              )}
              <h1 className={cn("text-5xl font-bold leading-tight tracking-tight text-gray-900", fontClass)} style={headingStyle}>
                {storeName}
              </h1>
            </div>
          </div>
          <p className="text-xl font-light text-gray-500 leading-relaxed">{tagline}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-7 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all inline-block"
              style={{ backgroundColor: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel={rtl ? "تعرف علينا" : "About Us"}
              className="px-7 py-2.5 rounded-full text-sm font-semibold border-2 hover:bg-black/5 transition-colors inline-block"
              style={{ borderColor: primaryColor, color: primaryColor }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 8. Luxury ──
  if (template === "luxury") {
    const eyebrow = resolveEyebrow(rtl ? "مجموعة فاخرة" : "Luxury Collection")
    return (
      <div
        dir={wrapDir}
        className={cn("flex items-center px-14 py-16 relative overflow-hidden", heightClass, flexAlignClass)}
        style={{ background: `linear-gradient(135deg,#080808 0%,#180820 60%,#0a0a0a 100%)` }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] opacity-10" style={{ backgroundColor: primaryColor }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: secondaryColor }} />

        <div className={cn("relative z-10 max-w-2xl space-y-7 text-white flex flex-col", colAlignClass)}>
          {eyebrow && (
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
                {eyebrow}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <h1
              className={cn("text-5xl font-bold tracking-wide leading-tight", fontClass)}
              style={{ ...headingStyle, color: "#f5f5f5", letterSpacing: "0.04em" }}
            >
              {storeName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: `${primaryColor}60` }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: `${primaryColor}60` }} />
            </div>
          </div>

          <p className="text-lg leading-relaxed font-light" style={{ color: secondaryColor }}>{tagline}</p>
          <p className="text-sm leading-relaxed text-white/40 max-w-md">{description}</p>

          <div className={cn("flex gap-4 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-8 py-3 text-sm font-semibold rounded-none border hover:bg-white/5 transition-colors tracking-widest uppercase inline-block"
              style={{ borderColor: primaryColor, color: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel={rtl ? "استكشاف" : "Explore"}
              className="px-8 py-3 text-sm font-semibold text-white/40 tracking-widest uppercase hover:text-white/70 transition-colors inline-block"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 9. Wave ──
  if (template === "wave") {
    const eyebrow = resolveEyebrow(rtl ? "اكتشف مجموعتنا" : "Discover our collection")
    return (
      <div dir={wrapDir} className={cn("bg-white relative overflow-hidden flex flex-col", heightClass)}>
        <div className={cn("flex-1 flex items-center px-10 py-14 relative z-10", flexAlignClass)}>
          <div className={cn("max-w-xl space-y-6 flex flex-col", colAlignClass)}>
            {eyebrow && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                {eyebrow}
              </div>
            )}

            <h1 className={cn("text-5xl font-bold leading-tight tracking-tight text-gray-900", fontClass)} style={headingStyle}>
              {storeName}
            </h1>
            <p className="text-xl text-gray-400 font-light leading-relaxed">{tagline}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>

            <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
              <PrimaryCta
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all inline-block"
                style={{ backgroundColor: primaryColor }}
              />
              <SecondaryCta
                fallbackLabel={rtl ? "تعرف أكثر" : "Learn More"}
                className="px-7 py-2.5 rounded-full text-sm font-semibold border-2 hover:bg-black/5 transition-colors inline-block"
                style={{ borderColor: primaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full block" style={{ height: "100px", display: "block" }}>
            <path
              d="M0,50 C180,100 360,0 540,50 C720,100 900,0 1080,50 C1260,100 1380,30 1440,50 L1440,100 L0,100 Z"
              fill={primaryColor}
            />
          </svg>
          <div className="h-6" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    )
  }

  // ── 10. Magazine ──
  if (template === "magazine") {
    const eyebrow = resolveEyebrow(rtl ? "متجرنا المميز" : "Featured Store")
    return (
      <div dir={wrapDir} className={cn("bg-gray-50 relative overflow-hidden flex items-center", heightClass, flexAlignClass)}>
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
          <span
            className="font-black whitespace-nowrap leading-none"
            style={{ fontSize: "10rem", color: `${primaryColor}0E`, letterSpacing: "-0.04em" }}
          >
            {storeName.toUpperCase()}
          </span>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: primaryColor }} />

        <div className={cn("relative z-10 px-16 py-16 space-y-7 flex flex-col", colAlignClass)}>
          {eyebrow && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">
                {eyebrow}
              </span>
              <div className="h-px flex-1 max-w-16 bg-gray-200" />
            </div>
          )}

          <h1 className={cn("text-6xl font-black leading-none tracking-tight text-gray-900", fontClass)} style={headingStyle}>
            {storeName}
          </h1>

          <div className="flex items-start gap-5">
            <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: primaryColor }} />
            <p className="text-2xl font-light text-gray-500 leading-relaxed max-w-sm">{tagline}</p>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">{description}</p>

          <div className={cn("flex items-center gap-6 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
            <PrimaryCta
              className="px-8 py-3 text-sm font-black text-white tracking-wider uppercase hover:opacity-90 transition-opacity inline-block"
              style={{ backgroundColor: primaryColor }}
            />
            <SecondaryCta
              fallbackLabel={rtl ? "← اكتشف المزيد" : "Discover More →"}
              className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors inline-block"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── 11. Showcase (image-only) ──
  // Full-bleed photo. Ignores any uploaded video — this template is for stores
  // that want to lead with one strong product/lifestyle image. Falls back to a
  // brand-color gradient with a hint when no image is set.
  if (template === "showcase") {
    const eyebrow = resolveEyebrow("")
    return (
      <div
        dir={wrapDir}
        className={cn("relative overflow-hidden flex items-end", heightClass, flexAlignClass)}
        style={{
          background: heroImage
            ? undefined
            : `linear-gradient(135deg,${primaryColor}25 0%,${secondaryColor}25 100%)`,
        }}
      >
        {heroImage ? (
          <div
            className="absolute inset-0"
            style={{ background: `url(${heroImage}) ${bgPos}/cover no-repeat` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div
                className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}25` }}
              >
                <span className="text-5xl">🖼️</span>
              </div>
              <p className="text-xs text-gray-500">{rtl ? "أضف صورة المتجر" : "Upload a store image"}</p>
            </div>
          </div>
        )}

        {heroImage && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${hexToRgba(overlayColor, Math.max(overlayAlpha, 0.55))} 0%, ${hexToRgba(overlayColor, overlayAlpha * 0.2)} 50%, transparent 100%)`,
            }}
          />
        )}

        <div className={cn("relative z-10 w-full px-8 md:px-12 py-10 md:py-14 flex", flexAlignClass)}>
          <div className={cn("space-y-3 max-w-xl text-white flex flex-col", colAlignClass)}>
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/80 drop-shadow">{eyebrow}</span>
            )}
            <h1 className={cn("text-4xl md:text-5xl font-bold leading-tight tracking-tight drop-shadow", fontClass)} style={headingStyle}>
              {storeName}
            </h1>
            {tagline && <p className="text-lg text-white/90 drop-shadow">{tagline}</p>}
            <div className={cn("flex gap-3 pt-3", flexAlignClass, rtl && "flex-row-reverse")}>
              <PrimaryCta
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl hover:opacity-90 hover:scale-105 transition-all inline-block"
                style={{ backgroundColor: primaryColor }}
              />
              <SecondaryCta
                fallbackLabel={rtl ? "اكتشف" : "Explore"}
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors inline-block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 12. Reel (video-only) ──
  // Full-bleed autoplay video loop. Ignores any uploaded image. Falls back to
  // a dark gradient placeholder when no video is set.
  if (template === "reel") {
    const eyebrow = resolveEyebrow(rtl ? "بث مباشر" : "On Air")
    return (
      <div
        dir={wrapDir}
        className={cn("relative overflow-hidden flex items-center", heightClass, flexAlignClass)}
        style={{
          background: heroVideoUrl
            ? "#000"
            : `linear-gradient(to bottom right,#0f172a,${primaryColor}40,#0f172a)`,
        }}
      >
        {heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}30` }}
              >
                <span className="text-5xl">🎬</span>
              </div>
              <p className="text-xs text-white/70">{rtl ? "أضف فيديو المتجر" : "Upload a store video"}</p>
            </div>
          </div>
        )}

        {heroVideoUrl && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${hexToRgba(overlayColor, overlayAlpha * 0.4)}, ${hexToRgba(overlayColor, Math.max(overlayAlpha, 0.5))})`,
            }}
          />
        )}

        <div className={cn("relative z-10 w-full px-8 md:px-12 py-12 flex", flexAlignClass)}>
          <div className={cn("space-y-4 max-w-xl text-white flex flex-col", colAlignClass)}>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] bg-white/15 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {eyebrow}
              </span>
            )}
            <h1 className={cn("text-4xl md:text-6xl font-black leading-none tracking-tight drop-shadow-lg", fontClass)} style={headingStyle}>
              {storeName}
            </h1>
            {tagline && <p className="text-lg text-white/85 drop-shadow">{tagline}</p>}
            <div className={cn("flex gap-3 pt-2", flexAlignClass, rtl && "flex-row-reverse")}>
              <PrimaryCta
                className="px-8 py-3 rounded-full text-sm font-bold text-white shadow-xl hover:opacity-90 hover:scale-105 transition-all inline-block"
                style={{ backgroundColor: primaryColor }}
              />
              <SecondaryCta
                fallbackLabel={rtl ? "شاهد" : "Watch"}
                className="px-8 py-3 rounded-full text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition-colors inline-block"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function PaymentBadge({
  method,
  fg,
  bg,
  border,
}: {
  method: PaymentMethod
  fg?: string
  bg?: string
  border?: string
}) {
  return (
    <div
      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{
        color: fg ?? "#cbd5e1",
        backgroundColor: bg ?? "rgba(255,255,255,0.1)",
        border: `1px solid ${border ?? "rgba(255,255,255,0.15)"}`,
      }}
    >
      {PAYMENT_METHOD_LABEL[method]}
    </div>
  )
}

export function StorefrontFooter({ view, soukyHref = "/" }: { view: StorefrontView; soukyHref?: string }) {
  const {
    storeName, footerAbout, footerEmail, footerPhone, footerWhatsapp, footerAddress, businessHours,
    showSocial, socialFacebook, socialInstagram, socialTiktok, socialYoutube, socialTwitter,
    primaryColor, rtl, showFooter, footerColumns, paymentMethods,
  } = view

  const hasContact = !!(footerEmail || footerPhone || footerWhatsapp || footerAddress || businessHours)
  const hasSocials = !!(socialFacebook || socialInstagram || socialTiktok || socialYoutube || socialTwitter || footerWhatsapp)
  const hasColumns = footerColumns.length > 0

  const showRich = showFooter && (footerAbout || hasContact || hasColumns || paymentMethods.length > 0)
  const tokens = themeTokens(view.theme)
  const headingStyle: React.CSSProperties | undefined =
    view.fonts.headingFont && view.fonts.headingFont !== "system"
      ? { fontFamily: fontFamily(view.fonts.headingFont) }
      : undefined

  // Resolved color theme: combines preset (dark/light/branded/minimal) with seller overrides.
  const theme = resolveFooterTheme(view.footerStyle, primaryColor, {
    bg: view.bgColors.footer,
    colors: view.footerColors,
  })

  const center = view.footerAlign === "center"

  // Headings inherit the heading color (and optional heading font) by default.
  const h3Style: React.CSSProperties = { color: theme.heading, ...headingStyle }
  // Social/icon pill bg is a translucent layer derived from the text color so it works
  // on dark, light, and branded footers without us hardcoding white/black.
  const iconBg = "color-mix(in srgb, currentColor 14%, transparent)"
  const iconBgHover = "color-mix(in srgb, currentColor 24%, transparent)"
  // Inputs on dark/branded footers want light fields; on light/minimal they want darker fields.
  const isDarkFooter = view.footerStyle === "dark" || view.footerStyle === "branded" || view.footerStyle === "custom"
  const inputBg = isDarkFooter ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
  const inputBorder = theme.border

  const linkUrl = (raw: string, base: string) =>
    raw.startsWith("http") || raw.startsWith("/") || raw.startsWith("#") ? raw : `${base}${raw}`

  // Reusable social link
  const SocialLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{ backgroundColor: iconBg }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = iconBgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = iconBg)}
    >
      {children}
    </a>
  )

  return (
    <footer
      id="contact"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      dir={rtl ? "rtl" : "ltr"}
    >
      {showRich && (
        <div className={cn("px-5 sm:px-8 py-10 md:py-12 grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4", center && "text-center")}>
          {/* Brand + about + socials */}
          <div className={cn("space-y-4 lg:col-span-1", center && "flex flex-col items-center")}>
            <span className="font-bold text-lg" style={{ color: theme.heading }}>{storeName}</span>
            {footerAbout && (
              <p className="text-sm leading-relaxed whitespace-pre-line">{footerAbout}</p>
            )}
            {showSocial && hasSocials && (
              <div className={cn("flex flex-wrap gap-2 pt-1", center && "justify-center", rtl && "flex-row-reverse")}>
                {socialFacebook  && <SocialLink href={linkUrl(socialFacebook,  "https://facebook.com/")}  label="Facebook"><Facebook      className="w-4 h-4" /></SocialLink>}
                {socialInstagram && <SocialLink href={linkUrl(socialInstagram, "https://instagram.com/")} label="Instagram"><Instagram     className="w-4 h-4" /></SocialLink>}
                {socialTiktok    && <SocialLink href={linkUrl(socialTiktok,    "https://tiktok.com/@")}   label="TikTok"><TiktokIcon       className="w-4 h-4" /></SocialLink>}
                {socialYoutube   && <SocialLink href={linkUrl(socialYoutube,   "https://youtube.com/")}   label="YouTube"><Youtube         className="w-4 h-4" /></SocialLink>}
                {socialTwitter   && <SocialLink href={linkUrl(socialTwitter,   "https://x.com/")}         label="X / Twitter"><Twitter     className="w-4 h-4" /></SocialLink>}
                {footerWhatsapp  && <SocialLink href={`https://wa.me/${footerWhatsapp.replace(/[^\d]/g, "")}`} label="WhatsApp"><MessageCircle className="w-4 h-4" /></SocialLink>}
              </div>
            )}
          </div>

          {/* Contact */}
          {hasContact && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={h3Style}>
                {rtl ? "تواصل معنا" : "Contact"}
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Mail,           val: footerEmail,    href: footerEmail   ? `mailto:${footerEmail}` : null,    accent: false },
                  { icon: Phone,          val: footerPhone,    href: footerPhone   ? `tel:${footerPhone}`    : null,    accent: false },
                  { icon: MessageCircle,  val: footerWhatsapp, href: footerWhatsapp? `https://wa.me/${footerWhatsapp.replace(/[^\d]/g, "")}` : null, accent: true },
                  { icon: MapPin,         val: footerAddress,  href: null,                                              accent: false },
                  { icon: Clock,          val: businessHours,  href: null,                                              accent: false },
                ]
                  .filter((r) => r.val)
                  .map(({ icon: Icon, val, href, accent }) => (
                    <div key={val as string} className={cn("flex items-start gap-2.5", center && "justify-center", rtl && "flex-row-reverse")}>
                      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accent ? "#22c55e" : theme.accent, opacity: accent ? 1 : 0.7 }} />
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="transition-opacity hover:opacity-80 whitespace-pre-line">
                          {val}
                        </a>
                      ) : (
                        <span className="whitespace-pre-line">{val}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Custom columns */}
          {hasColumns && footerColumns.map((col, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={h3Style}>{col.title}</h3>
              <div className="space-y-2.5 text-sm">
                {col.links.map((l, j) => (
                  <a
                    key={j}
                    href={l.url}
                    target={l.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-80"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Payment methods strip */}
      {showRich && paymentMethods.length > 0 && (
        <div
          className="px-5 sm:px-8 py-4 flex flex-wrap items-center gap-x-3 gap-y-2 justify-center"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.heading, opacity: 0.7 }}>
            {rtl ? "طرق الدفع" : "We Accept"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {paymentMethods.map((m) => (
              <PaymentBadge key={m} method={m} fg={theme.heading} bg={iconBg} border={theme.border} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar (always renders) */}
      <div
        className={cn(
          "px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-center sm:text-left",
          center && "sm:justify-center sm:gap-6",
        )}
        style={{ borderTop: `1px solid ${theme.border}`, opacity: 0.85 }}
      >
        <span className="text-balance leading-snug">
          {view.footerCopyright
            ? view.footerCopyright.replace(/\{year\}/g, String(new Date().getFullYear())).replace(/\{store\}/g, storeName)
            : <>© {new Date().getFullYear()} {storeName}. {rtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</>
          }
        </span>
        <a
          href={soukyHref}
          className="font-medium hover:opacity-80 transition-opacity shrink-0"
          style={{ color: theme.accent }}
        >
          {rtl ? "مدعوم من Soukly" : "Powered by Soukly"}
        </a>
      </div>
    </footer>
  )
}

// ─── Google Fonts loader ─────────────────────────────────────────────────────
// React 19 hoists <link> elements rendered in JSX into <head>. This component
// just emits the right link tag(s) for the seller's chosen fonts.

export function GoogleFontsLoader({ view }: { view: StorefrontView }) {
  const ids = Array.from(new Set([view.fonts.headingFont, view.fonts.bodyFont]))
  const families = ids
    .map((id) => FONT_BY_ID[id]?.google)
    .filter((g): g is string => !!g)
  if (families.length === 0) return null
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`
  return <link rel="stylesheet" href={href} />
}

// ─── Storefront nav (replaces Soukly navbar on store pages) ──────────────────

export function StorefrontNav({
  view,
  onCartClick,
  cartCount = 0,
  showMarketplaceLink = true,
}: {
  view: StorefrontView
  onCartClick?: () => void
  cartCount?: number
  /** "← Soukly" back-to-marketplace pill. Hidden in the seller builder preview. */
  showMarketplaceLink?: boolean
}) {
  const { storeName, primaryColor, nav, rtl, fonts } = view
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hasLinks = nav.links.length > 0

  const CartButton = () => {
    if (!nav.showCart || !onCartClick) return null
    return (
      <button
        onClick={onCartClick}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Cart"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {cartCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <nav
      className="border-b bg-background sticky top-0 z-40 backdrop-blur-md"
      dir={rtl ? "rtl" : "ltr"}
      style={{ fontFamily: fontFamily(fonts.bodyFont) }}
    >
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: back-to-marketplace pill + brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showMarketplaceLink && (
            <Link
              href="/"
              aria-label="Back to Soukly marketplace"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className={cn("w-3 h-3", rtl && "rotate-180")} />
              <span>Soukly</span>
            </Link>
          )}

          <a href="#top" className="flex items-center min-w-0">
            <span
              className="font-bold text-sm sm:text-base tracking-tight truncate"
              style={{ color: primaryColor, fontFamily: fontFamily(fonts.headingFont) }}
            >
              {storeName}
            </span>
          </a>
        </div>

        {/* Center: desktop links */}
        {hasLinks && (
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {nav.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {l.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </a>
            ))}
          </div>
        )}

        {/* Right: cart + mobile hamburger */}
        <div className="flex items-center gap-1 shrink-0">
          <CartButton />
          {hasLinks && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown — links */}
      {hasLinks && mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-2">
            {nav.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-3 text-sm font-medium border-b last:border-b-0 hover:bg-muted/40 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Trust badges section ────────────────────────────────────────────────────

const TRUST_BADGE_ICON: Record<TrustBadgeKey, React.ReactNode> = {
  "free-shipping":   <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  "returns":         <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
  "secure":          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  "support":         <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
  "quality":         <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  "authentic":       <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
  "made-in-lebanon": <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  "fast-delivery":   <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
}

export function StorefrontTrustBadges({ view }: { view: StorefrontView }) {
  const t = view.trustBadges
  if (!t.enabled || t.items.length === 0) return null

  const tokens = themeTokens(view.theme)
  const headingFamily = fontFamily(view.fonts.headingFont)
  const bgStyle = view.bgColors.products ? { backgroundColor: view.bgColors.products } : undefined
  const trustAccent = t.accentColor || view.primaryColor

  return (
    <section className={cn("border-t border-b", !bgStyle && "bg-muted/20")} style={bgStyle} dir={view.rtl ? "rtl" : "ltr"}>
      <div className={cn("container mx-auto px-4", tokens.sectionPad, tokens.container)}>
        <div className={cn("grid gap-4", t.items.length === 2 ? "md:grid-cols-2" : t.items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4")}>
          {t.items.map((badge, i) => (
            <div
              key={i}
              className={cn("flex items-start gap-3 p-4 bg-background border", tokens.radius)}
            >
              <div
                className={cn("w-11 h-11 flex items-center justify-center shrink-0", tokens.radius)}
                style={{ backgroundColor: `${trustAccent}15`, color: trustAccent }}
              >
                {TRUST_BADGE_ICON[badge.key]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight" style={{ fontFamily: headingFamily }}>
                  {badge.label}
                </p>
                {badge.sublabel && (
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{badge.sublabel}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
