"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  }

  const starSize = sizeClasses[size]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={cn(
              interactive && "hover:scale-110 transition-transform cursor-pointer",
              !interactive && "cursor-default",
            )}
          >
            <Star
              className={cn(
                starSize,
                star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300",
                interactive && "hover:fill-amber-400 hover:text-amber-400",
              )}
            />
          </button>
        ))}
      </div>
      {showValue && <span className="font-semibold ml-1">{rating.toFixed(1)}</span>}
    </div>
  )
}
