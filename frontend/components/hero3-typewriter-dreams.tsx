"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, ArrowRight } from "lucide-react"

const businessIdeas = ["a bakery", "a boutique", "a café", "a jewelry shop", "an art studio", "a bookstore"]

export default function Hero3TypewriterDreams() {
  const [currentIdea, setCurrentIdea] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const idea = businessIdeas[currentIdea]
    const timeout = setTimeout(
      () => {
        if (!isDeleting && displayText !== idea) {
          setDisplayText(idea.slice(0, displayText.length + 1))
        } else if (isDeleting && displayText !== "") {
          setDisplayText(idea.slice(0, displayText.length - 1))
        } else if (!isDeleting && displayText === idea) {
          setTimeout(() => setIsDeleting(true), 2000)
        } else if (isDeleting && displayText === "") {
          setIsDeleting(false)
          setCurrentIdea((prev) => (prev + 1) % businessIdeas.length)
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentIdea])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <Pencil className="h-4 w-4" />
            <span>Write Your Success Story</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl text-foreground">
              You dream of opening
            </h1>

            <div className="relative inline-block">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent min-h-[1.2em] inline-flex items-center">
                {displayText}
                <span className="inline-block w-1 h-[0.9em] bg-primary ml-2 animate-blink" />
              </h2>

              {/* Animated underline */}
              <div className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl text-foreground">
              We make it reality
            </h1>
          </div>

          <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
            Every great business starts with a dream and a blank page. Soukly is your pen, turning ideas into thriving
            online stores—try free for 30 days, no tech skills needed.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row items-center justify-center pt-8">
            <Link href="/become-seller">
              <Button size="lg" className="group text-lg px-8">
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {/* Floating quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            {[
              { quote: "Started with just an idea", author: "Sarah M., Jewelry Designer" },
              { quote: "Live in 10 minutes", author: "Ahmad K., Coffee Roaster" },
              { quote: "Customers from all Lebanon", author: "Leila N., Handmade Crafts" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                style={{
                  animation: `slide-up 0.6s ease-out ${i * 0.2}s both`,
                }}
              >
                <p className="text-lg font-medium text-foreground mb-2">"{item.quote}"</p>
                <p className="text-sm text-muted-foreground">— {item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
