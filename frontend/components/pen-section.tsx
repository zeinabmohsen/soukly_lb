"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenTool, ArrowRight, Sparkles } from "lucide-react"
import { TRIAL_DAYS } from "@/lib/plans"

// Theme-matched particle colours (approximations of --primary / --accent so the
// canvas reads on-brand against the light background).
const PRIMARY_RGB = "99, 91, 210"
const ACCENT_RGB = "224, 122, 80"

/**
 * Pen section — immersive "blank page → pen → thriving store" moment, styled to
 * the light marketplace theme. A brand-coloured particle constellation that
 * reacts to the cursor sits behind centered copy, where "Soukly is your pen." is
 * literally written by a travelling pen once it scrolls into view.
 * No external 3D dependency — pure canvas 2D + CSS.
 *
 * Not mounted on the landing page; render <PenSection /> wherever it's needed.
 */
export default function PenSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phraseRef = useRef<HTMLSpanElement>(null)
  const [writeStarted, setWriteStarted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  // ── Canvas particle constellation (cursor-reactive) ────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let raf = 0
    const mouse = { x: -9999, y: -9999 }

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; accent: boolean }
    let particles: Particle[] = []

    const setup = () => {
      width = section.clientWidth
      height = section.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(90, Math.floor((width * height) / 16000))
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
        accent: i % 4 === 0, // ~1 in 4 particles warm-accent, rest brand-violet
      }))
    }

    const LINK_DIST = 130

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // gentle pull toward the cursor for an interactive feel
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 160 * 160) {
          p.x += dx * 0.001
          p.y += dy * 0.001
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.accent ? ACCENT_RGB : PRIMARY_RGB}, 0.55)`
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.13 * (1 - dist / LINK_DIST)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    setup()
    if (reduce) {
      draw() // one static frame
      cancelAnimationFrame(raf)
    } else {
      draw()
      section.addEventListener("mousemove", onMove)
      section.addEventListener("mouseleave", onLeave)
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      setup()
      if (!reduce) draw()
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      section.removeEventListener("mousemove", onMove)
      section.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  // ── Trigger the "writing" animation when the phrase scrolls into view ──────
  useEffect(() => {
    const phrase = phraseRef.current
    if (!phrase) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWriteStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(phrase)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background py-28 md:py-40">
      {/* Soft brand wash + drifting orbs to match the hero */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-[10%] h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float-drift" />
        <div className="absolute bottom-0 right-[8%] h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float-drift" style={{ animationDelay: "2s" }} />
      </div>

      {/* Particle constellation */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Decorative sparkle accents */}
      <Sparkles className="pointer-events-none absolute top-16 right-[14%] h-6 w-6 text-primary/25 animate-float-drift" />
      <Sparkles className="pointer-events-none absolute bottom-20 left-[12%] h-5 w-5 text-accent/30 animate-float-drift" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <PenTool className="h-4 w-4" />
            <span>Write your success story</span>
          </div>

          <h2 className="mt-7 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance leading-tight">
            Every great business starts with a dream and a blank page.
          </h2>

          {/* The pen writes this line */}
          <p className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span ref={phraseRef} className="relative inline-block">
              {/* The ink — revealed left→right as the pen passes */}
              <span
                className="block whitespace-nowrap bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-text"
                style={
                  reduceMotion
                    ? undefined
                    : writeStarted
                      ? { animation: "reveal 1.9s linear 0.2s both, gradient-pan 5s linear 2s infinite" }
                      : { clipPath: "inset(0 100% 0 0)" }
                }
              >
                Soukly is your pen.
              </span>

              {/* Ink underline drawn just after the words finish */}
              <svg
                className="absolute left-0 -bottom-3 w-full h-3"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C 80 2, 150 12, 298 5"
                  stroke="url(#penUnderline)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="320"
                  strokeDashoffset={writeStarted || reduceMotion ? 0 : 320}
                  style={{ transition: "stroke-dashoffset 0.6s ease-out 1.9s" }}
                />
                <defs>
                  <linearGradient id="penUnderline" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="oklch(0.45 0.15 265)" />
                    <stop offset="1" stopColor="oklch(0.65 0.2 35)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* The pen nib riding the leading edge of the ink */}
              {!reduceMotion && (
                <span
                  className="pointer-events-none absolute top-1/2"
                  style={writeStarted ? { animation: "write-pen 1.9s linear 0.2s both" } : { left: 0, opacity: 0 }}
                  aria-hidden="true"
                >
                  <PenTool className="h-8 w-8 md:h-10 md:w-10 text-accent drop-shadow-md" />
                </span>
              )}
            </span>
          </p>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Turning ideas into thriving online stores — try free for {TRIAL_DAYS} days, no tech skills needed.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/become-seller">
              <Button size="lg" className="group text-lg px-8 shadow-lg shadow-primary/20">
                Start your store
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                See live stores
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
