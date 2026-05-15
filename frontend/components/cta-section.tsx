import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Check } from "lucide-react"

const TRUST_SIGNALS = [
  "30-day free trial",
  "From $10/month",
  "0% commission on sales",
  "Cancel anytime",
]

export default function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4" />
            <span>Join Lebanese Sellers on Soukly</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
            Ready to Turn Your Business Dreams Into Reality?
          </h2>

          <p className="text-xl text-white/90 text-pretty max-w-2xl mx-auto leading-relaxed">
            Apply in minutes, try free for 30 days, then pay one flat monthly fee. No commission on your sales — ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <Link href="/become-seller">
              <Button size="lg" variant="secondary" className="group text-lg px-8 shadow-xl">
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              >
                See Pricing
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-x-6 gap-y-3 flex-wrap text-white/90">
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="text-sm">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
