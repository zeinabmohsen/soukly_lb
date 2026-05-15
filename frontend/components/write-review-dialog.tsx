"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateReviewMutation } from "@/store/api/reviewApi"
import { useToast } from "@/hooks/use-toast"

interface Props {
  productId: string
  productName: string
  orderId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
}

export function WriteReviewDialog({
  productId, productName, orderId, open, onOpenChange, onSubmitted,
}: Props) {
  const { toast } = useToast()
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: "Pick a rating from 1 to 5", variant: "destructive" })
      return
    }
    try {
      await createReview({
        product_id: productId,
        rating,
        comment: comment.trim() || undefined,
        order_id: orderId,
      }).unwrap()
      toast({ title: "Review posted!", description: `Thanks for reviewing ${productName}.` })
      onSubmitted?.()
      onOpenChange(false)
      // Reset for next time
      setRating(0)
      setComment("")
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Couldn't post review"
      toast({ title: msg, variant: "destructive" })
    }
  }

  const displayRating = hoverRating || rating
  const ratingLabel = displayRating === 0
    ? "Tap a star"
    : displayRating === 1
      ? "Poor"
      : displayRating === 2
        ? "Fair"
        : displayRating === 3
          ? "Good"
          : displayRating === 4
            ? "Very good"
            : "Excellent"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your purchase</DialogTitle>
          <DialogDescription className="line-clamp-2">{productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${s} star${s > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      s <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{ratingLabel}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-sm font-medium">
              Your review <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? What could be better?"
              rows={4}
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">{comment.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || rating < 1} className="gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Posting..." : "Post review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
