import { Sparkles, TrendingUp, Palette, ClipboardList, BarChart3 } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Marketplace traffic",
      description: "Buyers come to Soukly to discover Lebanese stores. You don't have to chase customers — they find you.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Palette,
      title: "Custom store builder",
      description: "Design your hero, categories, and layout. Add your logo, cover image, and social links — no code needed.",
      gradient: "from-accent to-primary",
    },
    {
      icon: ClipboardList,
      title: "Order management",
      description: "Track every order from confirmed to delivered. Update status, message buyers, and ship with confidence.",
      gradient: "from-primary to-accent",
    },
    {
      icon: BarChart3,
      title: "Real sales analytics",
      description: "Revenue trends, top products, customer counts, and weekly performance — all in one dashboard.",
      gradient: "from-accent to-primary",
    },
  ]

  return (
    <section id="features" className="relative overflow-hidden bg-muted/30 py-20 md:py-32">
      {/* Soft top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Everything You Need</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            Built for <span className="text-primary">Lebanese Entrepreneurs</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Every feature designed to help local businesses succeed in the digital marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Gradient glow that warms up on hover */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
                />

                {/* Gradient icon */}
                <div
                  className={`relative mb-5 inline-flex w-fit rounded-2xl bg-gradient-to-br ${feature.gradient} p-3.5 text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="relative mb-2.5 text-lg md:text-xl font-bold transition-colors group-hover:text-primary">
                  {feature.title}
                </h3>
                <p className="relative text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
