import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
