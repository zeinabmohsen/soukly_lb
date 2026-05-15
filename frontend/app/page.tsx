import Navbar from "@/components/navbar"
import Hero3TypewriterDreams from "@/components/hero3-typewriter-dreams"
import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero3TypewriterDreams />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  )
}
