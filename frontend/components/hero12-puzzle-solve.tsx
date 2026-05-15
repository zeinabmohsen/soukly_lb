"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero12PuzzleSolve() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [piecesFitted, setPiecesFitted] = useState(0)

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

    // Puzzle pieces (3x3 grid)
    const puzzleSize = 60
    const gap = 5
    const pieces = [
      { row: 0, col: 0, color: "#8b5cf6", startX: centerX - 200, startY: centerY - 150 },
      { row: 0, col: 1, color: "#a78bfa", startX: centerX + 150, startY: centerY - 180 },
      { row: 0, col: 2, color: "#c4b5fd", startX: centerX - 220, startY: centerY + 120 },
      { row: 1, col: 0, color: "#f97316", startX: centerX + 180, startY: centerY - 100 },
      { row: 1, col: 1, color: "#fb923c", startX: centerX - 180, startY: centerY + 150 },
      { row: 1, col: 2, color: "#fdba74", startX: centerX + 190, startY: centerY + 130 },
      { row: 2, col: 0, color: "#7c3aed", startX: centerX - 210, startY: centerY - 120 },
      { row: 2, col: 1, color: "#a855f7", startX: centerX + 160, startY: centerY + 160 },
      { row: 2, col: 2, color: "#c084fc", startX: centerX - 190, startY: centerY - 160 },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.98)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.012
      const progress = Math.min(time / 4, 1)

      let fittedCount = 0
      pieces.forEach((piece, index) => {
        const pieceDelay = index * 0.15
        const pieceProgress = Math.max(0, Math.min((progress - pieceDelay) / 0.3, 1))

        if (pieceProgress >= 1) fittedCount++

        // Calculate target position
        const targetX = centerX - (puzzleSize * 1.5 + gap) + piece.col * (puzzleSize + gap)
        const targetY = centerY - (puzzleSize * 1.5 + gap) + piece.row * (puzzleSize + gap)

        // Ease-out animation
        const easeProgress = 1 - Math.pow(1 - pieceProgress, 3)
        const currentX = piece.startX + (targetX - piece.startX) * easeProgress
        const currentY = piece.startY + (targetY - piece.startY) * easeProgress

        // Rotation during movement
        const rotation = (1 - pieceProgress) * Math.PI * 2

        ctx.save()
        ctx.translate(currentX + puzzleSize / 2, currentY + puzzleSize / 2)
        ctx.rotate(rotation)

        // Piece shadow
        ctx.shadowBlur = 15
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3

        // Draw puzzle piece
        ctx.fillStyle = piece.color
        ctx.strokeStyle = "#1e1b4b"
        ctx.lineWidth = 2

        // Simple puzzle piece shape
        ctx.beginPath()
        ctx.roundRect(-puzzleSize / 2, -puzzleSize / 2, puzzleSize, puzzleSize, 4)
        ctx.fill()
        ctx.stroke()

        // Add puzzle tab (right side)
        if (piece.col < 2) {
          ctx.fillStyle = piece.color
          ctx.beginPath()
          ctx.arc(puzzleSize / 2, 0, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }

        // Add puzzle slot (bottom)
        if (piece.row < 2) {
          ctx.fillStyle = "#1e1b4b"
          ctx.beginPath()
          ctx.arc(0, puzzleSize / 2, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }

        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Glow effect when in place
        if (pieceProgress >= 1) {
          ctx.strokeStyle = piece.color
          ctx.lineWidth = 3
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.roundRect(-puzzleSize / 2 - 5, -puzzleSize / 2 - 5, puzzleSize + 10, puzzleSize + 10, 4)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        ctx.restore()
      })

      setPiecesFitted(Math.floor((fittedCount / pieces.length) * 100))

      // Completion effect
      if (progress >= 1) {
        const pulseRadius = 150 + Math.sin(time * 2) * 10
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - Math.sin(time * 2) * 0.15})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
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
        <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
          <span className="text-purple-300 text-sm font-medium">{piecesFitted}% Complete</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Every Piece Matters
          <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Build Your Complete Picture
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Building a business doesn't have to be complicated. Soukly provides all the pieces you need to complete your
          success story.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
            Complete Your Puzzle
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg bg-transparent"
          >
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  )
}
