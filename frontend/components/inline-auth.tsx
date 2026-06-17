"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Mail, Lock, User, Phone, Eye, EyeOff, LogIn, UserPlus, Loader2, Check, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useLoginMutation, useRegisterMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { useAppDispatch } from "@/hooks/useAppDispatch"

const PASSWORD_CHECKS = [
  { label: "8+ characters",  test: (v: string) => v.length >= 8 },
  { label: "One uppercase",  test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase",  test: (v: string) => /[a-z]/.test(v) },
  { label: "One number",     test: (v: string) => /\d/.test(v) },
]

/**
 * Turn an RTK Query error into a user-facing message, distinguishing the cause
 * so we don't tell someone their password is wrong when the server is actually
 * unreachable (e.g. the backend cold-starting on Render's free tier).
 *
 * - FETCH_ERROR / TIMEOUT_ERROR → network problem, not credentials.
 * - 5xx → server-side failure, not credentials.
 * - 4xx → genuine rejection; prefer the server's message, else the caller's
 *   fallback (e.g. "Invalid email or password").
 */
function authErrorMessage(err: unknown, credentialFallback: string): string {
  const e = err as { status?: number | string; data?: { message?: string } }
  const status = e?.status
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
    return "Can't reach the server — check your connection and try again."
  }
  if (typeof status === "number" && status >= 500) {
    return "Something went wrong on our end. Please try again in a moment."
  }
  return e?.data?.message ?? credentialFallback
}

interface AuthResult {
  user: {
    is_admin: boolean
    is_seller: boolean
    seller_status: string
  }
}

interface Props {
  /** Default tab to show — newcomers default to signup */
  defaultMode?: "signup" | "login"
  /** Heading shown above the auth card */
  title?: string
  /** Sub-heading shown above the auth card */
  description?: string
  /** Hide the card chrome (border + padding) — useful inside existing wrappers */
  bare?: boolean
  /** Called after successful login/signup. Useful when the parent needs to navigate. */
  onSuccess?: (result: AuthResult) => void
}

export function InlineAuth({
  defaultMode = "signup",
  title = "Create your account to continue",
  description = "Same Soukly account works for both buying and selling.",
  bare = false,
  onSuccess,
}: Props) {
  const [mode, setMode] = useState<"signup" | "login">(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [signupData, setSignupData] = useState({ name: "", email: "", phone: "", password: "" })
  // Single identifier field — accepts an email or a phone number (beachbeds-style).
  const [loginData, setLoginData] = useState({ identifier: "", password: "" })
  const [passwordFocused, setPasswordFocused] = useState(false)

  const dispatch = useAppDispatch()
  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [register, { isLoading: registering }] = useRegisterMutation()
  const isLoading = loggingIn || registering

  const passwordChecks = useMemo(
    () => PASSWORD_CHECKS.map((c) => ({ ...c, passed: c.test(signupData.password) })),
    [signupData.password],
  )
  const allChecksPass = passwordChecks.every((c) => c.passed)

  const switchMode = (next: "signup" | "login") => {
    setError("")
    setMode(next)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      // Treat an "@" as an email, otherwise send it as a phone number.
      const id = loginData.identifier.trim()
      const credentials = id.includes("@")
        ? { email: id, password: loginData.password }
        : { phone: id, password: loginData.password }
      const result = await login(credentials).unwrap()
      dispatch(setCredentials({ user: result.user, accessToken: result.access_token }))
      onSuccess?.(result)
    } catch (err: unknown) {
      setError(authErrorMessage(err, "Invalid credentials"))
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!allChecksPass) {
      setError("Please meet all password requirements")
      return
    }
    try {
      const result = await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        ...(signupData.phone ? { phone: signupData.phone } : {}),
      }).unwrap()
      dispatch(setCredentials({ user: result.user, accessToken: result.access_token }))
      onSuccess?.(result)
    } catch (err: unknown) {
      setError(authErrorMessage(err, "Registration failed. Please try again."))
    }
  }

  const inner = (
    <>
      {!bare && (
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex p-1 rounded-lg bg-muted mb-5">
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            New to Soukly
          </button>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mode === "signup" ? (
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ia-name" className="text-sm">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="Ahmad Hassan"
                  required
                  autoComplete="name"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ia-email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ia-phone" className="text-sm flex items-center justify-between">
                <span>Phone</span>
                <span className="text-xs text-muted-foreground font-normal">Optional</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder="+961 XX XXX XXX"
                  autoComplete="tel"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ia-password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-password"
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
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

              {(passwordFocused || signupData.password.length > 0) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 animate-in fade-in duration-200">
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
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full gap-2 h-11 mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isLoading ? "Creating account..." : "Create account & continue"}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ia-login-identifier" className="text-sm">Email or phone</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-login-identifier"
                  type="text"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  placeholder="you@example.com or +961 XX XXX XXX"
                  required
                  autoComplete="username"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ia-login-password" className="text-sm">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="ia-login-password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
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
            </div>

            <Button type="submit" disabled={isLoading} className="w-full gap-2 h-11 mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isLoading ? "Signing in..." : "Sign in & continue"}
            </Button>
          </form>
        )}
    </>
  )

  if (bare) return inner

  return (
    <Card className="border-2 shadow-md">
      <CardContent className="p-5 md:p-8">{inner}</CardContent>
    </Card>
  )
}
