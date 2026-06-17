import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PLANS, TRIAL_DAYS } from "@/lib/plans"
import Reveal from "@/components/reveal"

export default function PricingTeaserSection() {
  return (
    <section id="pricing-teaser" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Simple, honest pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            One flat fee. <span className="text-primary">0% commission.</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Pick a plan, start with a {TRIAL_DAYS}-day free trial, and keep 100% of every sale — no per-order cuts, ever.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan, index) => {
            const featured = plan.highlight
            return (
              <Reveal key={plan.id} delay={index * 120} className={`h-full ${featured ? "md:-mt-2" : ""}`}>
                <div
                  className={`relative h-full flex flex-col p-6 md:p-8 rounded-2xl border-2 transition-all ${
                    featured
                      ? "border-primary bg-card shadow-xl shadow-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {featured && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most popular
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">{plan.tagline}</p>
                  <div className="flex items-baseline gap-1 mt-4 mb-6">
                    <span className="text-4xl md:text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/become-seller?plan=${plan.id}`} className="mt-auto">
                    <Button
                      className="w-full gap-2"
                      variant={featured ? "default" : "outline"}
                    >
                      Start with {plan.name}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/pricing" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
            Compare all features
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
