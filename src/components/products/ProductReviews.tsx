import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Star, ThumbsUp, Pencil, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { useProductReviews, useProductReviewStats, useUserProductReview } from '@/hooks/useProductReviews';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const { data: stats } = useProductReviewStats(productId);
  const { data: userReview } = useUserProductReview(productId);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const hasUserReviewed = !!userReview;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
        {user && (
          <Button onClick={() => setIsFormOpen(true)}>
            {hasUserReviewed ? (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Review
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.count > 0 && (
        <div className="grid md:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-xl">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{stats.average.toFixed(1)}</p>
              <StarRating rating={stats.average} size="md" />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.count} review{stats.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as keyof typeof stats.distribution];
              const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8 flex items-center gap-1">
                    {rating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User's pending review notice */}
      {userReview && !userReview.is_approved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your review is pending moderation. It will be visible to others once approved.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No reviews yet</p>
          {user && (
            <Button variant="outline" onClick={() => setIsFormOpen(true)} className="mt-4">
              Be the first to review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                'p-4 border rounded-lg',
                review.is_featured && 'border-primary/50 bg-primary/5'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {review.profile?.full_name || 'Anonymous'}
                      </p>
                      {review.is_featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium mt-3">{review.title}</h4>
              )}
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review Form Dialog */}
      <ReviewForm
        productId={productId}
        productName={productName}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
}
