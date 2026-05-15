"use client"

import { UserPlus, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, label: "Create account", icon: UserPlus },
  { id: 2, label: "Apply",          icon: FileText },
  { id: 3, label: "Get approved",   icon: CheckCircle2 },
]

interface Props {
  /** Current step (1 = account, 2 = apply, 3 = approval) */
  current: 1 | 2 | 3
  /** Compact rendering for tight spaces (auth pages above the card) */
  compact?: boolean
}

export function SellerFunnelSteps({ current, compact = false }: Props) {
  return (
    <div className={cn("w-full", compact && "scale-90 origin-top")}>
      <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider text-center mb-3">
        Becoming a seller
      </p>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        {STEPS.map((step) => {
          const Icon = step.icon
          const isCompleted = current > step.id
          const isCurrent = current === step.id
          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all",
                isCurrent && "scale-105",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background transition-all",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary shadow-md shadow-primary/20",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  "text-[10px] md:text-xs font-medium text-center whitespace-nowrap",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
