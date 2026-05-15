"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  )
}
