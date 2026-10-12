import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hovered, setHovered] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, feedback);
    onClose();
    setRating(0);
    setFeedback("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Did we resolve your issue?</DialogTitle>
          <DialogDescription className="text-center">
            Rate the quality of the resolution from 1 to 10.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex justify-center gap-0.5" onMouseLeave={() => setHovered(0)}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} out of 10`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Star
                  size={22}
                  className={cn(
                    "transition-colors",
                    star <= (hovered || rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-2xl font-bold">
            {rating > 0 ? rating : "–"}
            <span className="text-base font-normal text-muted-foreground">/10</span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="feedback-notes">Additional notes (optional)</Label>
            <Textarea
              id="feedback-notes"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How could we have helped you better?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={rating === 0} className="flex-1">
              Submit rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
