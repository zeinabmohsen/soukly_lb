import Link from "next/link"
import { Home, Search, ArrowLeft, Compass } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-xl mx-auto text-center">
          {/* Big 404 mark */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <span className="text-[7rem] md:text-[10rem] font-bold leading-none bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent select-none">
              404
            </span>
            <Compass className="absolute w-12 h-12 md:w-16 md:h-16 text-primary/40 animate-pulse" />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-3">Page not found</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or may have moved. Let's get
            you back to something useful.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 h-12">
              <Link href="/">
                <Home className="w-4 h-4" />
                Back home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 h-12 bg-transparent">
              <Link href="/marketplace">
                <Search className="w-4 h-4" />
                Browse the marketplace
              </Link>
            </Button>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Popular pages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link href="/become-seller" className="text-foreground hover:text-primary transition-colors">
                Become a seller
              </Link>
              <Link href="/pricing" className="text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
