"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero4PaintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brushStrokes, setBrushStrokes] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const colors = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#f97316", "#fb923c"]
    const strokes: Array<{
      x: number
      y: number
      color: string
      size: number
      angle: number
      progress: number
    }> = []

    // Create initial strokes that paint the vision
    for (let i = 0; i < 20; i++) {
      strokes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 40 + 20,
        angle: Math.random() * Math.PI * 2,
        progress: 0,
      })
    }

    let animationFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.95)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.95)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      let activeStrokes = 0
      strokes.forEach((stroke) => {
        if (stroke.progress < 1) {
          stroke.progress += 0.01
          activeStrokes++
        }

        const length = stroke.size * 2
        const x1 = stroke.x - Math.cos(stroke.angle) * length * (stroke.progress / 2)
        const x2 = stroke.x + Math.cos(stroke.angle) * length * (stroke.progress / 2)
        const y1 = stroke.y - Math.sin(stroke.angle) * length * (stroke.progress / 2)
        const y2 = stroke.y + Math.sin(stroke.angle) * length * (stroke.progress / 2)

        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.size * 0.3
        ctx.lineCap = "round"
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // Add glow
        ctx.shadowBlur = 20
        ctx.shadowColor = stroke.color
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      setBrushStrokes(Math.floor((strokes.filter((s) => s.progress >= 1).length / strokes.length) * 100))

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
          <span className="text-purple-300 text-sm font-medium">{brushStrokes}% Vision Painted</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Paint Your Business
          <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            On Your Canvas
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Every great business starts with a blank canvas. Soukly gives you the brushstrokes to create your masterpiece.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
            Start Creating
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg bg-transparent"
          >
            See Examples
          </Button>
        </div>
      </div>
    </section>
  )
}
