"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, ArrowRight, ShieldCheck } from "lucide-react"
import { useGetStoresQuery } from "@/store/api/storeApi"
import { TRIAL_DAYS } from "@/lib/plans"

const businessIdeas = [
  "a boutique",
  "a bakery",
  "a candle shop",
  "a skincare brand",
  "a jewelry line",
  "a craft store",
  "an art shop",
  "a bookstore",
]

export default function Hero3TypewriterDreams() {
  const [currentIdea, setCurrentIdea] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Live store count for the social-proof strip — one cheap call, just the total.
  const { data: storesPage } = useGetStoresQuery({ limit: 1 })
  const totalStores = storesPage?.total ?? 0

  // Honest, verifiable stats. The store count only appears once we actually
  // have stores, so the strip never shows a hollow "0+".
  const stats = [
    ...(totalStores > 0 ? [{ value: `${totalStores}+`, label: "Stores live" }] : []),
    { value: `${TRIAL_DAYS} days`, label: "Free trial" },
    { value: "5 min", label: "Setup" },
  ]

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

      {/* Animated gradient orbs — drifting "market lights" */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float-drift" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl animate-float-drift" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float-drift" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
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
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-text min-h-[1.2em] inline-flex items-center">
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
            Launch your own online store on Lebanon's marketplace — try free for 30 days, no tech skills needed.
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

          {/* Trust line under the CTAs */}
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            No credit card to apply · Cancel anytime
          </p>

          {/* Live social-proof stats */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 pt-16">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ animation: `slide-up 0.6s ease-out ${i * 0.1}s both` }}
              >
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
