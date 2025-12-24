import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useCreateReview, useUpdateReview, useUserProductReview } from '@/hooks/useProductReviews';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReviewForm({
  productId,
  productName,
  open,
  onOpenChange,
}: ReviewFormProps) {
  const { user } = useAuth();
  const { data: existingReview } = useUserProductReview(productId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [hoveredRating, setHoveredRating] = useState(0);

  const isEditing = !!existingReview;
  const isLoading = createReview.isPending || updateReview.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          id: existingReview.id,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        });
        toast.success('Review updated! It will appear after moderation.');
      } else {
        await createReview.mutateAsync({
          product_id: productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        });
        toast.success('Review submitted! It will appear after moderation.');
      }
      onOpenChange(false);
    } catch (error: any) {
      if (error.message.includes('unique')) {
        toast.error('You have already reviewed this product');
      } else {
        toast.error(error.message || 'Failed to submit review');
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell others what you think about this product..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </p>
          </div>

          {existingReview && !existingReview.is_approved && (
            <p className="text-sm text-amber-600 bg-amber-500/10 p-2 rounded">
              Your review is pending moderation.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                isEditing ? 'Update Review' : 'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
