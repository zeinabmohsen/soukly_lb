"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero6KeyUnlock() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [unlockProgress, setUnlockProgress] = useState(0)

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
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.98)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.015

      // Draw lock
      const lockX = centerX + 60
      const lockY = centerY
      const lockSize = 60

      // Lock body
      ctx.fillStyle = "#6b7280"
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(lockX - lockSize / 2, lockY - lockSize / 3, lockSize, lockSize * 0.8, 8)
      ctx.fill()
      ctx.stroke()

      // Lock shackle
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(lockX, lockY - lockSize / 3, lockSize / 3, Math.PI, 0, false)
      ctx.stroke()

      // Keyhole
      ctx.fillStyle = "#374151"
      ctx.beginPath()
      ctx.arc(lockX, lockY, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(lockX - 3, lockY, 6, 15)

      // Draw animated key
      const keyProgress = Math.min(time / 3, 1)
      const insertProgress = Math.max(0, Math.min((time - 3) / 2, 1))
      const turnProgress = Math.max(0, Math.min((time - 5) / 1.5, 1))

      setUnlockProgress(Math.floor(turnProgress * 100))

      const keyStartX = centerX - 200
      const keyStartY = centerY + 100
      const keyTargetX = lockX - 50
      const keyTargetY = lockY

      const keyX = keyStartX + (keyTargetX - keyStartX) * keyProgress
      const keyY = keyStartY + (keyTargetY - keyStartY) * keyProgress
      const keyInsertX = keyX + insertProgress * 50

      ctx.save()
      ctx.translate(keyInsertX, keyY)
      ctx.rotate(turnProgress * (Math.PI / 4))

      // Key head
      const gradient2 = ctx.createLinearGradient(-30, -15, -30, 15)
      gradient2.addColorStop(0, "#f97316")
      gradient2.addColorStop(1, "#fb923c")
      ctx.fillStyle = gradient2
      ctx.strokeStyle = "#fdba74"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(-30, 0, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Key shaft
      ctx.fillStyle = "#f97316"
      ctx.strokeStyle = "#fb923c"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(-15, -4, 45, 8)
      ctx.fill()
      ctx.stroke()

      // Key teeth
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#f97316"
        ctx.fillRect(10 + i * 8, 4, 5, 8)
      }

      // Glow effect
      ctx.shadowBlur = 20
      ctx.shadowColor = "#f97316"
      ctx.strokeStyle = "#fb923c"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(-30, 0, 18, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.restore()

      // Unlock particles
      if (turnProgress > 0.5) {
        const particles = 20
        for (let i = 0; i < particles; i++) {
          const angle = (i / particles) * Math.PI * 2
          const distance = (turnProgress - 0.5) * 100
          const px = lockX + Math.cos(angle) * distance
          const py = lockY + Math.sin(angle) * distance

          ctx.fillStyle = `rgba(139, 92, 246, ${1 - (turnProgress - 0.5) * 2})`
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fill()
        }
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
          <span className="text-orange-300 text-sm font-medium">{unlockProgress}% Unlocked</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Unlock Your
          <span className="block bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            Business Potential
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          The key to success is in your hands. Soukly unlocks the doors to e-commerce for every Lebanese entrepreneur.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
            Get Your Key
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 px-8 py-6 text-lg bg-transparent"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
