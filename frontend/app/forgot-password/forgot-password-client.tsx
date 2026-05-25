"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import { AuthLayout } from "@/components/shared/auth-layout"
import { useForgotPasswordMutation } from "@/store/api/authApi"

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await forgotPassword({ email }).unwrap()
      setSubmitted(true)
    } catch {
      // Backend always returns 200 to prevent enumeration — any error here is
      // network/validation. Still show the "check email" view so we don't leak.
      setSubmitted(true)
    }
  }

  return (
    <>
      <Navbar />
      <AuthLayout
        title={submitted ? "Check your email" : "Forgot your password?"}
        description={
          submitted
            ? "If an account exists for that email, we've sent a reset link. It expires in 1 hour."
            : "Enter the email tied to your account and we'll send you a reset link."
        }
      >
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Open the link in your email to choose a new password. Didn&apos;t get anything? Check spam, or
              {" "}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline font-medium"
              >
                try a different email
              </button>
              .
            </p>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fp-email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">
                Something went wrong. Please try again in a moment.
              </p>
            )}

            <Button type="submit" disabled={isLoading || !email} className="w-full gap-2 h-11">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>

            <div className="text-center pt-1">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </form>
        )}
      </AuthLayout>
    </>
  )
}
