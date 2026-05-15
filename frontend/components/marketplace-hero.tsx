"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Shield, Truck, Star, Heart, TrendingUp } from "lucide-react"

interface MarketplaceHeroProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
}

export default function MarketplaceHero({ value, onChange, onSubmit }: MarketplaceHeroProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [internalQuery, setInternalQuery] = useState("")
  const isControlled = value !== undefined
  const searchQuery = isControlled ? value : internalQuery
  const setSearchQuery = (next: string) => {
    if (isControlled) onChange?.(next)
    else setInternalQuery(next)
  }
  const handleSubmit = () => onSubmit?.()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
    }> = []

    const colors = [
      "rgba(139, 92, 246, 0.6)", // primary purple
      "rgba(251, 146, 60, 0.6)", // accent orange
      "rgba(59, 130, 246, 0.5)", // blue
    ]

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: (Math.random() * canvas.width) / 2,
        y: (Math.random() * canvas.height) / 2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2)

      // Draw connections between close particles
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width / 2) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height / 2) p.vy *= -1

        // Glow effect
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
        gradient.addColorStop(0, p.color)
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)")
        ctx.fillStyle = gradient
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  const trendingSearches = ["Electronics", "Fashion", "Home Decor", "Lebanese Food"]

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

      <div className="relative z-10 container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-full text-sm font-semibold text-primary animate-fade-in shadow-lg backdrop-blur-sm">
          <TrendingUp className="w-4 h-4" />
          Discover 500+ Local Lebanese Businesses
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance animate-slide-up leading-tight">
          Shop from the Best
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Local Stores
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up [animation-delay:100ms] leading-relaxed">
          Support Lebanese entrepreneurs and discover unique products from trusted local vendors across Lebanon
        </p>

        <div className="max-w-3xl mx-auto mb-12 animate-slide-up [animation-delay:200ms]">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
                placeholder="Search for stores, products, or categories..."
                className="w-full pl-14 pr-5 py-5 rounded-2xl border-2 border-border bg-background/90 backdrop-blur-md focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-base shadow-lg"
              />
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              className="px-10 py-6 text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-accent"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Trending:</span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term)
                  handleSubmit()
                }}
                className="px-3 py-1.5 rounded-full bg-background/60 border border-border hover:border-primary hover:bg-primary/10 transition-all text-foreground"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto animate-slide-up [animation-delay:300ms]">
          <div className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all group-hover:rotate-6">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Verified Sellers</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">500+ trusted businesses</p>
            </div>
          </div>

          <div className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-all group-hover:rotate-6">
              <Truck className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Fast Delivery</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">Across all Lebanon</p>
            </div>
          </div>

          <div className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all group-hover:rotate-6">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Quality Products</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">10k+ 5-star reviews</p>
            </div>
          </div>

          <div className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-all group-hover:rotate-6">
              <Heart className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Support Local</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">Empower entrepreneurs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
