"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero9BridgeBuilding() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [buildProgress, setBuildProgress] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    let time = 0
    const centerY = canvas.offsetHeight / 2
    let animationFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.98)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.015
      const progress = Math.min(time / 4, 1)
      setBuildProgress(Math.floor(progress * 100))

      // Left cliff
      ctx.fillStyle = "#475569"
      ctx.beginPath()
      ctx.moveTo(0, centerY + 100)
      ctx.lineTo(150, centerY + 100)
      ctx.lineTo(150, centerY - 50)
      ctx.lineTo(100, centerY)
      ctx.lineTo(0, centerY + 50)
      ctx.closePath()
      ctx.fill()

      // Right cliff
      ctx.beginPath()
      ctx.moveTo(canvas.offsetWidth, centerY + 100)
      ctx.lineTo(canvas.offsetWidth - 150, centerY + 100)
      ctx.lineTo(canvas.offsetWidth - 150, centerY - 50)
      ctx.lineTo(canvas.offsetWidth - 100, centerY)
      ctx.lineTo(canvas.offsetWidth, centerY + 50)
      ctx.closePath()
      ctx.fill()

      // Gap/chasm
      const chasmGradient = ctx.createLinearGradient(0, centerY, 0, canvas.offsetHeight)
      chasmGradient.addColorStop(0, "rgba(15, 23, 42, 0.8)")
      chasmGradient.addColorStop(1, "rgba(15, 23, 42, 1)")
      ctx.fillStyle = chasmGradient
      ctx.fillRect(150, centerY - 50, canvas.offsetWidth - 300, canvas.offsetHeight - centerY + 50)

      // Bridge construction
      const bridgeStartX = 150
      const bridgeEndX = canvas.offsetWidth - 150
      const bridgeY = centerY - 30
      const bridgeLength = bridgeEndX - bridgeStartX
      const currentLength = bridgeLength * progress

      // Main bridge cables
      ctx.strokeStyle = "#f97316"
      ctx.lineWidth = 4
      ctx.lineCap = "round"

      // Left cable
      ctx.beginPath()
      ctx.moveTo(bridgeStartX, bridgeY)
      ctx.lineTo(bridgeStartX + currentLength, bridgeY)
      ctx.stroke()

      // Right cable
      ctx.beginPath()
      ctx.moveTo(bridgeStartX, bridgeY + 20)
      ctx.lineTo(bridgeStartX + currentLength, bridgeY + 20)
      ctx.stroke()

      // Bridge planks
      ctx.strokeStyle = "#8b5cf6"
      ctx.lineWidth = 3
      const plankCount = Math.floor(currentLength / 20)
      for (let i = 0; i < plankCount; i++) {
        const x = bridgeStartX + i * 20 + 10
        ctx.beginPath()
        ctx.moveTo(x, bridgeY)
        ctx.lineTo(x, bridgeY + 20)
        ctx.stroke()
      }

      // Support cables
      ctx.strokeStyle = "#a78bfa"
      ctx.lineWidth = 1
      ctx.setLineDash([])
      for (let i = 0; i < plankCount; i += 2) {
        const x = bridgeStartX + i * 20
        ctx.beginPath()
        ctx.moveTo(x, bridgeY)
        ctx.lineTo(x - 15, bridgeY - 30)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, bridgeY + 20)
        ctx.lineTo(x - 15, bridgeY + 50)
        ctx.stroke()
      }

      // Construction sparkles at the end
      if (progress < 1) {
        const sparkleX = bridgeStartX + currentLength
        const sparkleY = bridgeY + 10
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 5
          const dist = 15 + Math.sin(time * 10) * 5
          const sx = sparkleX + Math.cos(angle) * dist
          const sy = sparkleY + Math.sin(angle) * dist

          ctx.fillStyle = "#fbbf24"
          ctx.beginPath()
          ctx.arc(sx, sy, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Person crossing (appears after bridge is 80% done)
      if (progress > 0.8) {
        const personProgress = (progress - 0.8) / 0.2
        const personX = bridgeStartX + (currentLength - 50) * personProgress
        const personY = bridgeY + 10

        // Simple stick figure
        ctx.strokeStyle = "#60a5fa"
        ctx.lineWidth = 3
        ctx.lineCap = "round"

        // Head
        ctx.beginPath()
        ctx.arc(personX, personY - 15, 5, 0, Math.PI * 2)
        ctx.stroke()

        // Body
        ctx.beginPath()
        ctx.moveTo(personX, personY - 10)
        ctx.lineTo(personX, personY + 5)
        ctx.stroke()

        // Legs
        ctx.beginPath()
        ctx.moveTo(personX, personY + 5)
        ctx.lineTo(personX - 5, personY + 15)
        ctx.moveTo(personX, personY + 5)
        ctx.lineTo(personX + 5, personY + 15)
        ctx.stroke()

        // Arms
        ctx.beginPath()
        ctx.moveTo(personX, personY - 5)
        ctx.lineTo(personX - 7, personY + 2)
        ctx.moveTo(personX, personY - 5)
        ctx.lineTo(personX + 7, personY + 2)
        ctx.stroke()
      }

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
        <div className="inline-block mb-6 px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full">
          <span className="text-orange-300 text-sm font-medium">Building: {buildProgress}%</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Bridge The Gap
          <span className="block bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            To Your Customers
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Connect your business with customers across Lebanon. Soukly builds the bridge that brings you together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
            Build Your Bridge
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 px-8 py-6 text-lg bg-transparent"
          >
            Learn How
          </Button>
        </div>
      </div>
    </section>
  )
}
