import {
  Sparkles, TrendingUp, Palette, ClipboardList, BarChart3, HandCoins, MapPin,
} from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Marketplace traffic",
      description: "Buyers come to Soukly to discover Lebanese stores. You don't have to chase customers — they find you.",
    },
    {
      icon: Palette,
      title: "Custom store builder",
      description: "Design your hero, categories, and layout. Add your logo, cover image, and social links — no code needed.",
    },
    {
      icon: ClipboardList,
      title: "Order management",
      description: "Track every order from confirmed to delivered. Update status, message buyers, and ship with confidence.",
    },
    {
      icon: BarChart3,
      title: "Real sales analytics",
      description: "Revenue trends, top products, customer counts, and weekly performance — all in one dashboard.",
    },
    {
      icon: HandCoins,
      title: "0% commission",
      description: "Keep 100% of every sale. One flat monthly fee, no per-sale percentages, no hidden charges.",
    },
    {
      icon: MapPin,
      title: "Built for Lebanon",
      description: "Whish Money payments, Lebanese cities, local categories. Made for sellers from Beirut to Tripoli.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group h-full flex flex-col p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
