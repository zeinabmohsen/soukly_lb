"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero8Lighthouse() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [beamRotation, setBeamRotation] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    let time = 0
    const centerX = canvas.offsetWidth / 2
    const centerY = canvas.offsetHeight / 2 + 100
    let animationFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Night sky background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight)
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.98)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Stars
      for (let i = 0; i < 50; i++) {
        const x = (i * 97) % canvas.offsetWidth
        const y = (i * 73) % (canvas.offsetHeight * 0.6)
        const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }

      time += 0.02
      setBeamRotation(Math.floor((time * 50) % 360))

      // Ocean waves
      ctx.fillStyle = "rgba(30, 58, 138, 0.3)"
      ctx.beginPath()
      ctx.moveTo(0, canvas.offsetHeight - 50)
      for (let x = 0; x < canvas.offsetWidth; x += 10) {
        const y = canvas.offsetHeight - 50 + Math.sin(x * 0.02 + time * 2) * 8
        ctx.lineTo(x, y)
      }
      ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight)
      ctx.lineTo(0, canvas.offsetHeight)
      ctx.closePath()
      ctx.fill()

      // Lighthouse base
      const lighthouseWidth = 40
      const lighthouseHeight = 150

      const lighthouseGradient = ctx.createLinearGradient(
        centerX - lighthouseWidth / 2,
        centerY,
        centerX + lighthouseWidth / 2,
        centerY,
      )
      lighthouseGradient.addColorStop(0, "#94a3b8")
      lighthouseGradient.addColorStop(0.5, "#cbd5e1")
      lighthouseGradient.addColorStop(1, "#94a3b8")
      ctx.fillStyle = lighthouseGradient
      ctx.beginPath()
      ctx.moveTo(centerX - lighthouseWidth / 2, centerY)
      ctx.lineTo(centerX - lighthouseWidth / 3, centerY - lighthouseHeight)
      ctx.lineTo(centerX + lighthouseWidth / 3, centerY - lighthouseHeight)
      ctx.lineTo(centerX + lighthouseWidth / 2, centerY)
      ctx.closePath()
      ctx.fill()

      // Lighthouse stripes
      ctx.fillStyle = "#ef4444"
      const stripeHeight = 30
      for (let i = 0; i < 3; i++) {
        const y = centerY - i * stripeHeight * 2 - 20
        const topWidth = lighthouseWidth / 3 + ((centerY - y) / lighthouseHeight) * (lighthouseWidth / 6)
        ctx.fillRect(centerX - topWidth / 2, y, topWidth, stripeHeight / 2)
      }

      // Light room
      ctx.fillStyle = "#fbbf24"
      ctx.fillRect(centerX - lighthouseWidth / 2.5, centerY - lighthouseHeight - 20, lighthouseWidth / 1.25, 25)

      // Rotating light beam
      ctx.save()
      ctx.translate(centerX, centerY - lighthouseHeight - 7)
      ctx.rotate(time)

      // Light beam gradient
      const beamGradient = ctx.createLinearGradient(0, 0, 300, 0)
      beamGradient.addColorStop(0, "rgba(251, 191, 36, 0.8)")
      beamGradient.addColorStop(0.3, "rgba(251, 191, 36, 0.4)")
      beamGradient.addColorStop(1, "rgba(251, 191, 36, 0)")

      ctx.fillStyle = beamGradient
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(300, -30)
      ctx.lineTo(300, 30)
      ctx.closePath()
      ctx.fill()

      ctx.restore()

      // Light glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY - lighthouseHeight - 7,
        0,
        centerX,
        centerY - lighthouseHeight - 7,
        60,
      )
      glowGradient.addColorStop(0, "rgba(251, 191, 36, 0.6)")
      glowGradient.addColorStop(1, "rgba(251, 191, 36, 0)")
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY - lighthouseHeight - 7, 60, 0, Math.PI * 2)
      ctx.fill()

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full">
          <span className="text-yellow-300 text-sm font-medium">Guiding Light at {beamRotation}°</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Be The Beacon
          <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            In Your Market
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Stand out in the crowded marketplace. Soukly helps you shine bright and guide customers to your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6 text-lg">
            Start Shining
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 px-8 py-6 text-lg bg-transparent"
          >
            See Success Stories
          </Button>
        </div>
      </div>
    </section>
  )
}
