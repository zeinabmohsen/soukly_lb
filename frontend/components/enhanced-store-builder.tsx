"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import {
  Eye,
  Save,
  ImageIcon,
  Monitor,
  Smartphone,
  ArrowLeft,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const HERO_TEMPLATES = [
  { id: "minimal", name: "Minimal", description: "Clean and simple design" },
  { id: "bold", name: "Bold Statement", description: "Eye-catching and vibrant" },
  { id: "elegant", name: "Elegant", description: "Sophisticated and refined" },
  { id: "modern", name: "Modern Grid", description: "Contemporary layout" },
  { id: "animated", name: "Animated", description: "Dynamic with animations" },
  { id: "split", name: "Split Screen", description: "Image and content side by side" },
  { id: "fullscreen", name: "Full Screen", description: "Immersive hero experience" },
  { id: "centered", name: "Centered", description: "Classic centered layout" },
]

const BACKGROUND_STYLES = [
  { id: "solid", name: "Solid Color", preview: "bg-background" },
  { id: "gradient", name: "Gradient", preview: "bg-gradient-to-br from-primary/20 to-accent/20" },
  { id: "pattern", name: "Pattern", preview: "bg-[url('/pattern.svg')]" },
  { id: "image", name: "Background Image", preview: "bg-cover" },
]

const COLOR_PRESETS = [
  { name: "Purple Dream", primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Ocean Blue", primary: "#0EA5E9", secondary: "#06B6D4" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#EAB308" },
  { name: "Forest Green", primary: "#10B981", secondary: "#14B8A6" },
  { name: "Royal Red", primary: "#EF4444", secondary: "#F59E0B" },
  { name: "Midnight", primary: "#1E293B", secondary: "#475569" },
]

export default function EnhancedStoreBuilder() {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [storeData, setStoreData] = useState({
    // Content
    storeName: "My Amazing Store",
    tagline: "Discover unique products handcrafted with love",
    description: "Welcome to our store where quality meets affordability.",

    // Design
    template: "minimal",
    backgroundStyle: "gradient",
    backgroundImage: "",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    heroImage: "",
    fontFamily: "modern",
    animationStyle: "fade",

    // Footer
    showFooter: true,
    footerAbout: "We are a Lebanese business dedicated to bringing you the finest handcrafted products.",
    footerEmail: "contact@mystore.com",
    footerPhone: "+961 1 234 567",
    footerAddress: "Beirut, Lebanon",

    // Social Media
    showSocial: true,
    socialFacebook: "https://facebook.com/mystore",
    socialInstagram: "https://instagram.com/mystore",
    socialTwitter: "https://twitter.com/mystore",

    // Custom Links
    customLinks: [
      { label: "About Us", url: "/about" },
      { label: "Contact", url: "/contact" },
    ],
  })

  const updateStoreData = (field: string, value: any) => {
    setStoreData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    const sellerId = "1" // In production, this would come from auth context
    localStorage.setItem(`storeTemplate_${sellerId}`, JSON.stringify(storeData))

    toast({
      title: "Store template saved!",
      description: "Your custom store design has been saved successfully.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">Enhanced Store Builder</h1>
              <p className="text-xs text-muted-foreground">Create your unique storefront</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </Button>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Store
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Customization Panel */}
          <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <Card className="p-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input
                      value={storeData.storeName}
                      onChange={(e) => updateStoreData("storeName", e.target.value)}
                      placeholder="Enter your store name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={storeData.tagline}
                      onChange={(e) => updateStoreData("tagline", e.target.value)}
                      placeholder="A catchy tagline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={storeData.description}
                      onChange={(e) => updateStoreData("description", e.target.value)}
                      placeholder="Tell customers about your store"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Image URL</Label>
                    <Input
                      value={storeData.heroImage}
                      onChange={(e) => updateStoreData("heroImage", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Hero Template</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {HERO_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => updateStoreData("template", template.id)}
                          className={cn(
                            "p-3 rounded-lg border-2 text-left transition-all text-sm",
                            storeData.template === template.id && "border-primary bg-primary/5",
                          )}
                        >
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Style</Label>
                    <Select
                      value={storeData.backgroundStyle}
                      onValueChange={(val) => updateStoreData("backgroundStyle", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BACKGROUND_STYLES.map((bg) => (
                          <SelectItem key={bg.id} value={bg.id}>
                            {bg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {storeData.backgroundStyle === "image" && (
                    <div className="space-y-2">
                      <Label>Background Image URL</Label>
                      <Input
                        value={storeData.backgroundImage}
                        onChange={(e) => updateStoreData("backgroundImage", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label>Color Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            updateStoreData("primaryColor", preset.primary)
                            updateStoreData("secondaryColor", preset.secondary)
                          }}
                          className="p-3 rounded-lg border-2 hover:border-primary transition-colors text-left"
                        >
                          <div className="flex gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <p className="text-sm font-medium">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={storeData.primaryColor}
                        onChange={(e) => updateStoreData("primaryColor", e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={storeData.secondaryColor}
                        onChange={(e) => updateStoreData("secondaryColor", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Footer Tab */}
                <TabsContent value="footer" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <Label>Show Footer</Label>
                    <Switch
                      checked={storeData.showFooter}
                      onCheckedChange={(val) => updateStoreData("showFooter", val)}
                    />
                  </div>

                  {storeData.showFooter && (
                    <>
                      <div className="space-y-2">
                        <Label>About Text</Label>
                        <Textarea
                          value={storeData.footerAbout}
                          onChange={(e) => updateStoreData("footerAbout", e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={storeData.footerEmail}
                          onChange={(e) => updateStoreData("footerEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={storeData.footerPhone}
                          onChange={(e) => updateStoreData("footerPhone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={storeData.footerAddress}
                          onChange={(e) => updateStoreData("footerAddress", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Social Tab */}
                <TabsContent value="social" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <Label>Show Social Links</Label>
                    <Switch
                      checked={storeData.showSocial}
                      onCheckedChange={(val) => updateStoreData("showSocial", val)}
                    />
                  </div>

                  {storeData.showSocial && (
                    <>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </Label>
                        <Input
                          value={storeData.socialFacebook}
                          onChange={(e) => updateStoreData("socialFacebook", e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </Label>
                        <Input
                          value={storeData.socialInstagram}
                          onChange={(e) => updateStoreData("socialInstagram", e.target.value)}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </Label>
                        <Input
                          value={storeData.socialTwitter}
                          onChange={(e) => updateStoreData("socialTwitter", e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                Live Preview
              </div>
            </div>
            <div
              className={cn(
                "mx-auto transition-all duration-300 rounded-xl shadow-2xl overflow-hidden",
                previewMode === "desktop" ? "w-full" : "w-[375px]",
              )}
            >
              <EnhancedStorePreview data={storeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnhancedStorePreview({ data }: { data: any }) {
  // Render hero based on selected template
  const renderHero = () => {
    const commonClasses = "min-h-[500px]"

    switch (data.template) {
      case "minimal":
        return (
          <div className={cn(commonClasses, "flex items-center justify-center p-12 text-center")}>
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-5xl font-bold" style={{ color: data.primaryColor }}>
                {data.storeName}
              </h1>
              <p className="text-xl text-gray-600">{data.tagline}</p>
              <p className="text-gray-500">{data.description}</p>
              <div className="flex gap-4 justify-center pt-4">
                <button
                  className="px-8 py-3 rounded-full text-white font-semibold"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        )

      case "split":
        return (
          <div className={cn(commonClasses, "grid md:grid-cols-2")}>
            <div className="p-12 flex items-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold" style={{ color: data.primaryColor }}>
                  {data.storeName}
                </h1>
                <p className="text-xl text-gray-600">{data.tagline}</p>
                <p className="text-gray-500">{data.description}</p>
                <button
                  className="px-8 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  Explore
                </button>
              </div>
            </div>
            <div
              className="bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              style={{
                background: data.heroImage
                  ? `url(${data.heroImage}) center/cover`
                  : `linear-gradient(135deg, ${data.primaryColor}20 0%, ${data.secondaryColor}20 100%)`,
              }}
            >
              {!data.heroImage && <ImageIcon className="w-24 h-24 text-gray-400" />}
            </div>
          </div>
        )

      default:
        return (
          <div className={cn(commonClasses, "flex items-center justify-center p-12 text-center")}>
            <div className="space-y-6">
              <h1 className="text-5xl font-bold" style={{ color: data.primaryColor }}>
                {data.storeName}
              </h1>
              <p className="text-xl">{data.tagline}</p>
            </div>
          </div>
        )
    }
  }

  // Background styles
  const getBackgroundStyle = () => {
    switch (data.backgroundStyle) {
      case "solid":
        return { backgroundColor: "#ffffff" }
      case "gradient":
        return {
          background: `linear-gradient(135deg, ${data.primaryColor}10 0%, ${data.secondaryColor}10 100%)`,
        }
      case "image":
        return data.backgroundImage
          ? {
              backgroundImage: `url(${data.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      default:
        return {}
    }
  }

  return (
    <div style={getBackgroundStyle()}>
      {/* Hero Section */}
      {renderHero()}

      {/* Footer Section */}
      {data.showFooter && (
        <footer className="bg-slate-900 text-white p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">About {data.storeName}</h3>
              <p className="text-sm text-gray-400">{data.footerAbout}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {data.footerEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {data.footerPhone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {data.footerAddress}
                </div>
              </div>
            </div>
            {data.showSocial && (
              <div>
                <h3 className="font-bold text-lg mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {data.socialFacebook && (
                    <a
                      href={data.socialFacebook}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {data.socialInstagram && (
                    <a
                      href={data.socialInstagram}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {data.socialTwitter && (
                    <a
                      href={data.socialTwitter}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
            © 2025 {data.storeName}. All rights reserved. Powered by Soukly.
          </div>
        </footer>
      )}
    </div>
  )
}
