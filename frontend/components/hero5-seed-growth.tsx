"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero5SeedGrowth() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [growthStage, setGrowthStage] = useState<string>("Seed")

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.offsetWidth)
      gradient.addColorStop(0, "rgba(30, 27, 75, 0.95)")
      gradient.addColorStop(1, "rgba(17, 24, 39, 0.95)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.01

      // Determine growth stage
      if (time < 2) {
        setGrowthStage("Seed")
        // Draw seed
        ctx.fillStyle = "#f97316"
        ctx.beginPath()
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Pulsing glow
        ctx.strokeStyle = "#fb923c"
        ctx.lineWidth = 2
        ctx.globalAlpha = Math.abs(Math.sin(time * 3)) * 0.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      } else if (time < 4) {
        setGrowthStage("Sprout")
        // Seed
        ctx.fillStyle = "#f97316"
        ctx.beginPath()
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Sprouting stem
        const stemHeight = (time - 2) * 50
        const gradient = ctx.createLinearGradient(centerX, centerY, centerX, centerY - stemHeight)
        gradient.addColorStop(0, "#22c55e")
        gradient.addColorStop(1, "#86efac")
        ctx.strokeStyle = gradient
        ctx.lineWidth = 4
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX, centerY - stemHeight)
        ctx.stroke()
      } else if (time < 6) {
        setGrowthStage("Growing")
        // Full stem
        const stemHeight = 120
        ctx.strokeStyle = "#22c55e"
        ctx.lineWidth = 6
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX, centerY - stemHeight)
        ctx.stroke()

        // Growing branches
        const branchProgress = (time - 4) / 2
        const branches = [
          { angle: -Math.PI / 4, startY: -60 },
          { angle: Math.PI / 4, startY: -60 },
          { angle: -Math.PI / 3, startY: -90 },
          { angle: Math.PI / 3, startY: -90 },
        ]

        branches.forEach((branch) => {
          const branchLength = 40 * branchProgress
          ctx.strokeStyle = "#10b981"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(centerX, centerY + branch.startY)
          ctx.lineTo(
            centerX + Math.cos(branch.angle) * branchLength,
            centerY + branch.startY - Math.sin(Math.abs(branch.angle)) * branchLength * 0.5,
          )
          ctx.stroke()
        })
      } else {
        setGrowthStage("Thriving")
        // Full stem
        ctx.strokeStyle = "#22c55e"
        ctx.lineWidth = 6
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX, centerY - 120)
        ctx.stroke()

        // Full branches with leaves
        const branches = [
          { angle: -Math.PI / 4, startY: -60 },
          { angle: Math.PI / 4, startY: -60 },
          { angle: -Math.PI / 3, startY: -90 },
          { angle: Math.PI / 3, startY: -90 },
        ]

        branches.forEach((branch, i) => {
          const branchLength = 40
          const endX = centerX + Math.cos(branch.angle) * branchLength
          const endY = centerY + branch.startY - Math.sin(Math.abs(branch.angle)) * branchLength * 0.5

          ctx.strokeStyle = "#10b981"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(centerX, centerY + branch.startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()

          // Pulsing leaves
          const pulse = Math.abs(Math.sin(time * 2 + i))
          ctx.fillStyle = "#8b5cf6"
          ctx.globalAlpha = 0.7 + pulse * 0.3
          ctx.beginPath()
          ctx.arc(endX, endY, 12 + pulse * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1

          // Leaf glow
          ctx.strokeStyle = "#a78bfa"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(endX, endY, 16 + pulse * 3, 0, Math.PI * 2)
          ctx.stroke()
        })
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
        <div className="inline-block mb-6 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
          <span className="text-green-300 text-sm font-medium">Stage: {growthStage}</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          From Seed to
          <span className="block bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
            Thriving Business
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Every business starts small. Watch your idea grow into something beautiful with Soukly's nurturing platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
            Plant Your Seed
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-green-500/50 text-green-300 hover:bg-green-500/10 px-8 py-6 text-lg bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
