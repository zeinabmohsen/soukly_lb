"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { selectAccessToken, setCredentials } from "@/store/slices/authSlice"
import { useUpdateUserMutation } from "@/store/api/userApi"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isHydrating } = useAuth()
  const accessToken = useAppSelector(selectAccessToken)
  const [updateUser, { isLoading }] = useUpdateUserMutation()

  const [form, setForm] = useState({ name: "", phone: "", avatar_url: "" })
  const [error, setError] = useState("")
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    // Don't redirect mid-hydration — /auth/refresh may still confirm the session.
    if (!isHydrating && !isAuthenticated) router.push("/login?redirect=/profile")
  }, [isHydrating, isAuthenticated, router])

  // Hydrate form once we have the user
  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", phone: user.phone ?? "", avatar_url: user.avatar_url ?? "" })
    }
  }, [user])

  if (!isAuthenticated || !user) return null

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const dirty =
    form.name !== (user.name ?? "") ||
    form.phone !== (user.phone ?? "") ||
    form.avatar_url !== (user.avatar_url ?? "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) {
      setError("Name is required")
      return
    }
    try {
      const updated = await updateUser({
        id: user.id,
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        avatar_url: form.avatar_url.trim() || undefined,
      }).unwrap()

      // Refresh the auth slice so navbar / role checks reflect changes
      if (accessToken) dispatch(setCredentials({ user: updated, accessToken }))
      setSavedAt(Date.now())
      toast({ title: "Profile updated" })
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Could not save changes."
      setError(msg)
    }
  }

  const initials = (form.name || user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This information is shown on your reviews and orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={form.avatar_url || undefined} alt={form.name} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-accent text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {user.is_admin && <Badge variant="destructive" className="text-xs">Admin</Badge>}
                    {user.is_seller && (
                      <Badge variant={user.seller_status === "approved" ? "default" : "secondary"} className="text-xs">
                        {user.seller_status === "approved" ? "Seller" : `Seller (${user.seller_status})`}
                      </Badge>
                    )}
                    {user.is_verified && <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={handleChange("name")} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed yet — contact support if needed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+961 XX XXX XXX"
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar Image URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar_url}
                  onChange={handleChange("avatar_url")}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                {savedAt && !dirty && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </p>
                )}
                <div className="ml-auto flex gap-3">
                  <Link href={user.is_admin ? "/admin/dashboard" : user.is_seller ? "/seller/dashboard" : "/marketplace"}>
                    <Button type="button" variant="ghost">Cancel</Button>
                  </Link>
                  <Button type="submit" className="gap-2" disabled={isLoading || !dirty}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
