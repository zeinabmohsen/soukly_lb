"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero10Compass() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [direction, setDirection] = useState("North")

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
    const centerY = canvas.offsetHeight / 2
    let animationFrame: number

    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.offsetWidth / 2)
      gradient.addColorStop(0, "rgba(30, 27, 75, 0.98)")
      gradient.addColorStop(1, "rgba(17, 24, 39, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.02

      // Compass body
      const compassRadius = 120

      // Outer ring
      ctx.strokeStyle = "#6b7280"
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.arc(centerX, centerY, compassRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Inner decorative rings
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, compassRadius - 15, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(centerX, centerY, compassRadius - 25, 0, Math.PI * 2)
      ctx.stroke()

      // Direction markers
      const markers = ["N", "E", "S", "W"]
      const markerAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]

      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      markers.forEach((marker, i) => {
        const angle = markerAngles[i] - Math.PI / 2
        const x = centerX + Math.cos(angle) * (compassRadius - 50)
        const y = centerY + Math.sin(angle) * (compassRadius - 50)

        ctx.fillStyle = marker === "N" ? "#ef4444" : "#d1d5db"
        ctx.fillText(marker, x, y)
      })

      // Small tick marks
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 2
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
        const x1 = centerX + Math.cos(angle) * (compassRadius - 10)
        const y1 = centerY + Math.sin(angle) * (compassRadius - 10)
        const x2 = centerX + Math.cos(angle) * (compassRadius - 20)
        const y2 = centerY + Math.sin(angle) * (compassRadius - 20)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Rotating needle
      const needleAngle = time - Math.PI / 2

      // Update direction text
      const angleIndex = Math.floor(((time % (Math.PI * 2)) / (Math.PI * 2)) * 8)
      setDirection(directions[angleIndex])

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(needleAngle)

      // North needle (red)
      const northGradient = ctx.createLinearGradient(0, 0, 0, -80)
      northGradient.addColorStop(0, "#dc2626")
      northGradient.addColorStop(1, "#ef4444")
      ctx.fillStyle = northGradient
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(-8, 15)
      ctx.lineTo(0, -80)
      ctx.lineTo(8, 15)
      ctx.closePath()
      ctx.fill()

      // South needle (white)
      ctx.fillStyle = "#f3f4f6"
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(-8, -15)
      ctx.lineTo(0, 70)
      ctx.lineTo(8, -15)
      ctx.closePath()
      ctx.fill()

      // Center dot
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.fill()

      // Glow on north needle
      ctx.shadowBlur = 20
      ctx.shadowColor = "#ef4444"
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -80)
      ctx.lineTo(0, 0)
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.restore()

      // Pulsing rings around compass
      const pulseRadius = compassRadius + 20 + Math.sin(time * 2) * 10
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(time * 2) * 0.2})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
      ctx.stroke()

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
        <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
          <span className="text-purple-300 text-sm font-medium">Heading: {direction}</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Find Your True
          <span className="block bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            Business Direction
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Navigate the world of e-commerce with confidence. Soukly is your compass to success in Lebanon's digital
          marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
            Set Your Course
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-red-500/50 text-red-300 hover:bg-red-500/10 px-8 py-6 text-lg bg-transparent"
          >
            Explore Platform
          </Button>
        </div>
      </div>
    </section>
  )
}
