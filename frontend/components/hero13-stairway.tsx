"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Hero13Stairway() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentStep, setCurrentStep] = useState(0)

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

    const steps = [
      { label: "Start", y: canvas.offsetHeight - 100 },
      { label: "Design", y: canvas.offsetHeight - 180 },
      { label: "Build", y: canvas.offsetHeight - 260 },
      { label: "Launch", y: canvas.offsetHeight - 340 },
      { label: "Grow", y: canvas.offsetHeight - 420 },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background
      const gradient = ctx.createLinearGradient(0, canvas.offsetHeight, 0, 0)
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.98)")
      gradient.addColorStop(1, "rgba(30, 27, 75, 0.98)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      time += 0.015
      const progress = Math.min(time / 3, 1)
      const currentStepIndex = Math.floor(progress * steps.length)
      setCurrentStep(currentStepIndex)

      const centerX = canvas.offsetWidth / 2
      const stepWidth = 140
      const stepHeight = 80

      // Draw steps
      steps.forEach((step, index) => {
        const stepX = centerX - stepWidth / 2 + index * 30
        const stepY = step.y
        const isActive = index <= currentStepIndex
        const isCurrent = index === currentStepIndex

        // Step shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        ctx.fillRect(stepX + 5, stepY + 5, stepWidth, stepHeight)

        // Step itself
        const stepGradient = ctx.createLinearGradient(stepX, stepY, stepX, stepY + stepHeight)
        if (isActive) {
          stepGradient.addColorStop(0, "#8b5cf6")
          stepGradient.addColorStop(1, "#6d28d9")
        } else {
          stepGradient.addColorStop(0, "#475569")
          stepGradient.addColorStop(1, "#334155")
        }
        ctx.fillStyle = stepGradient
        ctx.fillRect(stepX, stepY, stepWidth, stepHeight)

        // Step border
        ctx.strokeStyle = isActive ? "#a78bfa" : "#64748b"
        ctx.lineWidth = 2
        ctx.strokeRect(stepX, stepY, stepWidth, stepHeight)

        // Step label
        ctx.font = "bold 16px sans-serif"
        ctx.fillStyle = isActive ? "#ffffff" : "#94a3b8"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(step.label, stepX + stepWidth / 2, stepY + stepHeight / 2)

        // Current step glow
        if (isCurrent && progress < 1) {
          ctx.strokeStyle = "#f97316"
          ctx.lineWidth = 4
          ctx.shadowBlur = 20
          ctx.shadowColor = "#f97316"
          ctx.strokeRect(stepX - 3, stepY - 3, stepWidth + 6, stepHeight + 6)
          ctx.shadowBlur = 0
        }

        // Check mark on completed steps
        if (isActive && !isCurrent) {
          ctx.strokeStyle = "#22c55e"
          ctx.lineWidth = 4
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(stepX + 20, stepY + stepHeight / 2)
          ctx.lineTo(stepX + 35, stepY + stepHeight / 2 + 10)
          ctx.lineTo(stepX + 55, stepY + stepHeight / 2 - 15)
          ctx.stroke()
        }
      })

      // Animated person climbing
      if (currentStepIndex > 0 && currentStepIndex < steps.length) {
        const prevStep = steps[currentStepIndex - 1]
        const currentStepObj = steps[currentStepIndex]
        const stepProgress = (progress * steps.length) % 1

        const personX = centerX - stepWidth / 2 + (currentStepIndex - 1) * 30 + 70 + stepProgress * 30
        const personY = prevStep.y + stepHeight - stepProgress * 80

        // Simple stick figure
        ctx.strokeStyle = "#f97316"
        ctx.lineWidth = 4
        ctx.lineCap = "round"

        // Head
        ctx.beginPath()
        ctx.arc(personX, personY - 20, 8, 0, Math.PI * 2)
        ctx.stroke()

        // Body
        ctx.beginPath()
        ctx.moveTo(personX, personY - 12)
        ctx.lineTo(personX, personY + 10)
        ctx.stroke()

        // Legs (walking animation)
        const legSwing = Math.sin(time * 10) * 10
        ctx.beginPath()
        ctx.moveTo(personX, personY + 10)
        ctx.lineTo(personX - 8 + legSwing, personY + 28)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(personX, personY + 10)
        ctx.lineTo(personX + 8 - legSwing, personY + 28)
        ctx.stroke()

        // Arms
        ctx.beginPath()
        ctx.moveTo(personX, personY)
        ctx.lineTo(personX - 12, personY + 8)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(personX, personY)
        ctx.lineTo(personX + 12, personY + 8)
        ctx.stroke()
      }

      // Success sparkles at top
      if (progress >= 1) {
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2 + time * 2
          const radius = 100 + Math.sin(time * 3 + i) * 20
          const sparkleX = centerX + Math.cos(angle) * radius
          const sparkleY = steps[steps.length - 1].y - 50 + Math.sin(angle) * radius * 0.5

          ctx.fillStyle = i % 2 === 0 ? "#fbbf24" : "#f97316"
          ctx.beginPath()
          ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2)
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
        <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
          <span className="text-purple-300 text-sm font-medium">Step {currentStep + 1} of 5</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-balance">
          Climb The Ladder
          <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            To Success
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Success is a journey, not a destination. Soukly guides you step by step from idea to thriving Lebanese
          business.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
            Start Climbing
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg bg-transparent"
          >
            View Roadmap
          </Button>
        </div>
      </div>
    </section>
  )
}
