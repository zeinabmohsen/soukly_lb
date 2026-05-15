"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero11Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [starsConnected, setStarsConnected] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    let time = 0
    let animationFrame: number

    // Constellation star positions (forming a simple store icon shape)
    const stars = [
      { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 - 80 }, // top
      { x: canvas.offsetWidth / 2 - 60, y: canvas.offsetHeight / 2 - 40 }, // top left
      { x: canvas.offsetWidth / 2 + 60, y: canvas.offsetHeight / 2 - 40 }, // top right
      { x: canvas.offsetWidth / 2 - 70, y: canvas.offsetHeight / 2 + 20 }, // bottom left
      { x: canvas.offsetWidth / 2 + 70, y: canvas.offsetHeight / 2 + 20 }, // bottom right
      { x: canvas.offsetWidth / 2 - 70, y: canvas.offsetHeight / 2 + 70 }, // bottom left corner
      { x: canvas.offsetWidth / 2 + 70, y: canvas.offsetHeight / 2 + 70 }, // bottom right corner
      { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 + 70 }, // bottom center
    ]

    // Connection sequence
    const connections = [
      [0, 1],
      [0, 2], // roof
      [1, 3],
      [2, 4], // sides
      [3, 5],
      [4, 6], // lower sides
      [5, 7],
      [7, 6], // bottom
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Deep space background
      const gradient = ctx.createRadialGradient(
        canvas.offsetWidth / 2,
        canvas.offsetHeight / 2,
        0,
        canvas.offsetWidth / 2,
        canvas.offsetHeight / 2,
        canvas.offsetWidth / 2,
      )
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.98)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background stars
      for (let i = 0; i < 100; i++) {
        const x = (i * 97) % canvas.offsetWidth
        const y = (i * 73) % canvas.offsetHeight
        const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.5})`
        ctx.beginPath()
        ctx.arc(x, y, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      time += 0.015
      const progress = Math.min(time / 3, 1)
      const currentConnections = Math.floor(progress * connections.length)
      setStarsConnected(Math.floor((currentConnections / connections.length) * 100))

      // Draw completed connections
      ctx.strokeStyle = "#8b5cf6"
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = "#8b5cf6"

      for (let i = 0; i < currentConnections; i++) {
        const [start, end] = connections[i]
        ctx.beginPath()
        ctx.moveTo(stars[start].x, stars[start].y)
        ctx.lineTo(stars[end].x, stars[end].y)
        ctx.stroke()
      }

      // Draw partial connection (currently animating)
      if (currentConnections < connections.length) {
        const connectionProgress = (progress * connections.length) % 1
        const [start, end] = connections[currentConnections]
        const currentX = stars[start].x + (stars[end].x - stars[start].x) * connectionProgress
        const currentY = stars[start].y + (stars[end].y - stars[start].y) * connectionProgress

        ctx.strokeStyle = "#a78bfa"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(stars[start].x, stars[start].y)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()

        // Animated end point
        const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 15)
        glowGradient.addColorStop(0, "rgba(167, 139, 250, 1)")
        glowGradient.addColorStop(1, "rgba(167, 139, 250, 0)")
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(currentX, currentY, 15, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0

      // Draw constellation stars
      stars.forEach((star, i) => {
        const isActive =
          i === 0 || connections.slice(0, currentConnections).some((conn) => conn[0] === i || conn[1] === i)

        if (isActive) {
          // Outer glow
          const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 20)
          glowGradient.addColorStop(0, "rgba(249, 115, 22, 0.8)")
          glowGradient.addColorStop(1, "rgba(249, 115, 22, 0)")
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(star.x, star.y, 20, 0, Math.PI * 2)
          ctx.fill()

          // Star
          ctx.fillStyle = "#f97316"
          ctx.beginPath()
          ctx.arc(star.x, star.y, 5, 0, Math.PI * 2)
          ctx.fill()

          // Pulsing ring
          const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5
          ctx.strokeStyle = `rgba(251, 146, 60, ${pulse * 0.6})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(star.x, star.y, 10 + pulse * 5, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          // Inactive star
          ctx.fillStyle = "#64748b"
          ctx.beginPath()
          ctx.arc(star.x, star.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

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
          <span className="text-purple-300 text-sm font-medium">{starsConnected}% Connected</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Connect The Stars
          <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Build Your Constellation
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Your business idea is a bright star. Soukly connects the dots to create something extraordinary in Lebanon's
          marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
            Start Connecting
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg bg-transparent"
          >
            View Gallery
          </Button>
        </div>
      </div>
    </section>
  )
}
