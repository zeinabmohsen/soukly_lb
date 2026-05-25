"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Lock, Loader2, Eye, EyeOff, Check, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { useResetPasswordMutation } from "@/store/api/authApi"

const PASSWORD_CHECKS = [
  { label: "8+ characters",  test: (v: string) => v.length >= 8 },
  { label: "One uppercase",  test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number",     test: (v: string) => /\d/.test(v) },
]

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const passwordChecks = useMemo(
    () => PASSWORD_CHECKS.map((c) => ({ ...c, passed: c.test(password) })),
    [password],
  )
  const allChecksPass = passwordChecks.every((c) => c.passed)
  const matches = password.length > 0 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!allChecksPass) return setError("Please meet all password requirements")
    if (!matches) return setError("Passwords don't match")
    try {
      await resetPassword({ token, password }).unwrap()
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setError(msg ?? "Couldn't reset your password. The link may have expired.")
    }
  }

  if (!token) {
    return (
      <>
        <Navbar />
        <AuthLayout title="Invalid link" description="This reset link is missing its token.">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">
              Request a new password reset link from the sign-in page.
            </p>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              Request a new link
            </Link>
          </div>
        </AuthLayout>
      </>
    )
  }

  if (success) {
    return (
      <>
        <Navbar />
        <AuthLayout title="Password updated" description="You can now sign in with your new password.">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              For security, all your other devices have been signed out.
            </p>
            <Link href="/login">
              <Button className="w-full h-11">Go to sign in</Button>
            </Link>
          </div>
        </AuthLayout>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <AuthLayout title="Choose a new password" description="Pick something memorable but hard to guess.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rp-password" className="text-sm">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="rp-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
                autoFocus
                className="pl-9 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-1 text-xs">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      check.passed ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {check.passed && <Check className="w-2 h-2" />}
                  </div>
                  <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rp-confirm" className="text-sm">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="rp-confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                required
                autoComplete="new-password"
                className="pl-9 h-11"
              />
            </div>
            {confirm.length > 0 && !matches && (
              <p className="text-xs text-destructive">Passwords don&apos;t match</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !allChecksPass || !matches}
            className="w-full gap-2 h-11"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </AuthLayout>
    </>
  )
}
