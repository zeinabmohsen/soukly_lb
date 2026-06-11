import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export type LegalSection = {
  heading: string
  body: string[]
}

/**
 * Shared shell for static legal pages (Terms, Privacy). Renders a centered
 * prose column between the standard Navbar and Footer.
 */
export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <p className="text-base text-muted-foreground leading-relaxed mb-10">{intro}</p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  {i + 1}. {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.body.map((para, j) => (
                    <p key={j} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-muted/40 border border-border p-4 text-xs text-muted-foreground">
            This page is a plain-language summary provided for transparency. It is not legal advice. Questions? Email{" "}
            <a href="mailto:support@soukly.com" className="text-primary hover:underline">support@soukly.com</a>.
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
