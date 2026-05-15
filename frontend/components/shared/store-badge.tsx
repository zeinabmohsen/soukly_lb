import { Star, MapPin, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StoreBadgeProps {
  rating?: number
  location?: string
  verified?: boolean
  reviewCount?: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function StoreBadge({ rating, location, verified, reviewCount, className, size = "md" }: StoreBadgeProps) {
  const sizeClasses = {
    sm: { icon: "w-3 h-3", text: "text-xs" },
    md: { icon: "w-4 h-4", text: "text-sm" },
    lg: { icon: "w-5 h-5", text: "text-base" },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {rating !== undefined && (
        <div className="flex items-center gap-1">
          <Star className={cn(sizes.icon, "fill-amber-400 text-amber-400")} />
          <span className={cn("font-semibold", sizes.text)}>{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className={cn("text-muted-foreground", sizes.text)}>({reviewCount} reviews)</span>
          )}
        </div>
      )}
      {location && (
        <div className={cn("flex items-center gap-1 text-muted-foreground", sizes.text)}>
          <MapPin className={sizes.icon} />
          <span>{location}</span>
        </div>
      )}
      {verified && (
        <Badge variant="secondary" className={cn("gap-1", sizes.text)}>
          <Check className={sizes.icon} />
          Verified
        </Badge>
      )}
    </div>
  )
}
