import type React from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  /** Optional content rendered above the auth card (e.g. seller funnel breadcrumb) */
  topSlot?: React.ReactNode
  /** Optional marketing panel — when provided, renders a 2-column split on lg+ */
  marketingSlot?: React.ReactNode
}

export function AuthLayout({ title, description, children, topSlot, marketingSlot }: AuthLayoutProps) {
  // Two-column split layout when marketingSlot is provided
  if (marketingSlot) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        {/* Marketing side */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
            <div />
            <div className="flex-1 flex items-center">
              <div className="space-y-6">{marketingSlot}</div>
            </div>

            <p className="text-xs text-primary-foreground/70">
              © {new Date().getFullYear()} Soukly · Made for Lebanon
            </p>
          </div>
        </div>

        {/* Form side — decorative gradient + soft blur orbs */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 pt-20 md:pt-24 lg:py-4 bg-gradient-to-br from-background via-primary/[0.04] to-accent/[0.06]">
          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            {topSlot}

            <Card className="border-2 shadow-2xl shadow-primary/10 backdrop-blur-md bg-card/80">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Single-column layout — used by /login, /signup, and the seller funnel mode.
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 pt-20 md:pt-24 bg-gradient-to-br from-background via-primary/[0.06] to-accent/[0.08]">
      {/* Aurora — overlapping orbs with staggered breathing animations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-accent/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none animate-pulse [animation-duration:10s] [animation-delay:2s]" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:9s] [animation-delay:1s]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:11s] [animation-delay:3s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/[0.08] rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:6s]" />

      {/* Diagonal light streak — adds depth and a hint of dimension */}
      <div className="absolute -inset-x-1/4 top-1/2 -translate-y-1/2 h-64 rotate-12 bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Tiny dot field — glowing pinpoints scattered around */}
      <div className="hidden md:block absolute top-[18%] left-[18%] w-1 h-1 rounded-full bg-primary/40 shadow-[0_0_8px_2px] shadow-primary/30 pointer-events-none animate-pulse [animation-duration:3s]" />
      <div className="hidden md:block absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-accent/50 shadow-[0_0_10px_2px] shadow-accent/40 pointer-events-none animate-pulse [animation-duration:4s] [animation-delay:1.5s]" />
      <div className="hidden md:block absolute bottom-[28%] left-[22%] w-1 h-1 rounded-full bg-accent/40 shadow-[0_0_8px_2px] shadow-accent/30 pointer-events-none animate-pulse [animation-duration:5s] [animation-delay:0.5s]" />
      <div className="hidden md:block absolute bottom-[20%] right-[16%] w-1.5 h-1.5 rounded-full bg-primary/50 shadow-[0_0_10px_2px] shadow-primary/40 pointer-events-none animate-pulse [animation-duration:4s] [animation-delay:2s]" />
      <div className="hidden md:block absolute top-[50%] left-[10%] w-1 h-1 rounded-full bg-primary/35 shadow-[0_0_6px_1px] shadow-primary/25 pointer-events-none animate-pulse [animation-duration:6s] [animation-delay:1s]" />
      <div className="hidden md:block absolute top-[60%] right-[8%] w-1 h-1 rounded-full bg-accent/40 shadow-[0_0_8px_2px] shadow-accent/30 pointer-events-none animate-pulse [animation-duration:5s] [animation-delay:2.5s]" />

      {/* Floating sparkles — small, theme-matched, staggered timing */}
      <Sparkles className="hidden md:block absolute top-[10%] left-[8%] w-4 h-4 text-primary/40 animate-pulse [animation-duration:4s] pointer-events-none" />
      <Sparkles className="hidden md:block absolute top-[18%] right-[12%] w-3 h-3 text-accent/50 animate-pulse [animation-duration:5s] [animation-delay:1s] pointer-events-none" />
      <Sparkles className="hidden md:block absolute bottom-[16%] left-[14%] w-3 h-3 text-accent/40 animate-pulse [animation-duration:6s] [animation-delay:2s] pointer-events-none" />
      <Sparkles className="hidden md:block absolute bottom-[10%] right-[10%] w-4 h-4 text-primary/45 animate-pulse [animation-duration:5s] [animation-delay:0.5s] pointer-events-none" />
      <Sparkles className="hidden lg:block absolute top-[42%] right-[24%] w-2.5 h-2.5 text-primary/35 animate-pulse [animation-duration:7s] [animation-delay:3s] pointer-events-none" />
      <Sparkles className="hidden lg:block absolute bottom-[36%] left-[28%] w-2.5 h-2.5 text-accent/40 animate-pulse [animation-duration:6s] [animation-delay:1.5s] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
        {topSlot}

        <Card className="border-2 shadow-2xl shadow-primary/10 backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{title}</CardTitle>
            <CardDescription className="text-center">{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
