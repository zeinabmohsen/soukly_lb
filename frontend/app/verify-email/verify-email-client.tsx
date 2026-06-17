"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail, CheckCircle2, AlertCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { useAuth } from "@/hooks/useAuth"
import { useVerifyEmailMutation, useResendVerificationMutation } from "@/store/api/authApi"

type Status = "verifying" | "success" | "error" | "no-token"

export default function VerifyEmailClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const { user } = useAuth()

  const [status, setStatus] = useState<Status>(token ? "verifying" : "no-token")
  const [error, setError] = useState<string | null>(null)

  const [verifyEmail] = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()
  const [resendEmail, setResendEmail] = useState("")
  const [resent, setResent] = useState(false)

  // Verify exactly once on mount when a token is present. The ref guards against
  // React 18/19 StrictMode double-invoking the effect in dev.
  const attempted = useRef(false)
  useEffect(() => {
    if (!token || attempted.current) return
    attempted.current = true
    ;(async () => {
      try {
        await verifyEmail({ token }).unwrap()
        setStatus("success")
      } catch (err: unknown) {
        setError((err as { data?: { message?: string } })?.data?.message ?? null)
        setStatus("error")
      }
    })()
  }, [token, verifyEmail])

  useEffect(() => {
    if (user?.email && !resendEmail) setResendEmail(user.email)
  }, [user, resendEmail])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail) return
    try {
      await resendVerification({ email: resendEmail }).unwrap()
    } catch {
      /* always-200 endpoint; ignore */
    } finally {
      setResent(true)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <>
        <Navbar />
        <AuthLayout title="Email verified" description="Your email address is confirmed.">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Thanks for confirming. Your Soukly account is all set.
            </p>
            <Link href={user ? "/" : "/login"}>
              <Button className="w-full h-11">{user ? "Go to Soukly" : "Go to sign in"}</Button>
            </Link>
          </div>
        </AuthLayout>
      </>
    )
  }

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <>
        <Navbar />
        <AuthLayout title="Verifying your email" description="One moment…">
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Confirming your link…</p>
          </div>
        </AuthLayout>
      </>
    )
  }

  // ── Error / no-token → show message + resend ───────────────────────────────
  const title = status === "no-token" ? "Confirm your email" : "Link invalid or expired"
  const description =
    status === "no-token"
      ? "Enter your email and we'll send a fresh confirmation link."
      : "We couldn't verify that link. Request a new one below."

  return (
    <>
      <Navbar />
      <AuthLayout title={title} description={description}>
        <div className="space-y-5">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
              status === "no-token" ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            {status === "no-token" ? (
              <Mail className="w-7 h-7 text-primary" />
            ) : (
              <AlertCircle className="w-7 h-7 text-destructive" />
            )}
          </div>

          {error && status === "error" && (
            <p className="text-center text-sm text-muted-foreground">{error}</p>
          )}

          {resent ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>If that account exists and isn&apos;t verified yet, a new link is on its way. Check your inbox (and spam).</span>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="resend-email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isResending || !resendEmail} className="w-full gap-2 h-11">
                {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isResending ? "Sending…" : "Send a new link"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  )
}
