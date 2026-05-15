import { UserPlus, FileText, Sparkles, Rocket, TrendingUp } from "lucide-react"

export default function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: "Create your account",
      description: "Sign up in seconds — same account works for buying and selling.",
    },
    {
      icon: FileText,
      number: "02",
      title: "Apply to sell",
      description: "Tell us about your store. Admin reviews in 2–3 business days.",
    },
    {
      icon: Sparkles,
      number: "03",
      title: "Start your free trial",
      description: "30 days free on any plan. Customize your store and add products.",
    },
    {
      icon: Rocket,
      number: "04",
      title: "Go live & sell",
      description: "Your store appears in the marketplace. Accept orders from across Lebanon.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-6">
            <Rocket className="h-4 w-4" />
            <span>Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            From Idea to <span className="text-accent">Live Store</span> in 4 Steps
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            No complexity, no confusion. Just a straightforward path to your online success.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative items-stretch">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative h-full">
                  {/* Step Card */}
                  <div className="h-full flex flex-col text-center p-8 rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10">
                    {/* Number Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="pt-4 flex justify-center">
                      <div className="p-4 rounded-xl bg-accent/10">
                        <Icon className="h-8 w-8 text-accent" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mt-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mt-3 flex-1">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
