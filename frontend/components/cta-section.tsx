import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import Reveal from "@/components/reveal"

const TRUST_SIGNALS = [
  "30-day free trial",
  "From $10/month",
  "0% commission on sales",
  "Cancel anytime",
]

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-card py-24 md:py-36">
      {/* Aurora mesh — soft brand glows drifting across the full section */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[8%] h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-float-drift" />
        <div className="absolute -bottom-28 right-[6%] h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-float-drift" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl animate-float-drift" style={{ animationDelay: "3.5s" }} />
      </div>

      {/* Fine dot-grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle,_rgba(99,91,210,0.07)_1px,_transparent_1px)] [background-size:24px_24px]" />

      <div className="container relative z-10 mx-auto px-4">
        <Reveal className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Join Lebanese Sellers on Soukly</span>
          </div>

          <h2 className="mt-7 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-[1.1]">
            Ready to turn your business dreams into{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-text">
                reality
              </span>
              <svg
                className="absolute left-0 -bottom-2 w-full h-3"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 80 2, 150 12, 298 5"
                  stroke="url(#ctaUnderline)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ctaUnderline" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="oklch(0.45 0.15 265)" />
                    <stop offset="1" stopColor="oklch(0.65 0.2 35)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            ?
          </h2>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Apply in minutes, try free for 30 days, then pay one flat monthly fee. No commission on your sales — ever.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link href="/become-seller">
              <Button size="lg" className="group text-lg px-8 shadow-lg shadow-primary/25">
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                See Pricing
              </Button>
            </Link>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {TRUST_SIGNALS.map((signal) => (
              <span
                key={signal}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm text-foreground"
              >
                <Check className="h-3.5 w-3.5 text-primary" />
                {signal}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
