import { useState } from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle, XCircle, Star, Trash2, MessageSquare, 
  Filter, Eye, Search, Loader2, StickyNote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import StarRating from '@/components/products/StarRating';
import { useAdminReviews, useModerateReview, useDeleteReview } from '@/hooks/useProductReviews';
import { toast } from 'sonner';

type FilterType = 'all' | 'pending' | 'approved' | 'featured';

export default function AdminReviews() {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [search, setSearch] = useState('');
  const [viewingReview, setViewingReview] = useState<any>(null);
  const [deletingReview, setDeletingReview] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: reviews, isLoading } = useAdminReviews(filter);
  const moderateReview = useModerateReview();
  const deleteReview = useDeleteReview();

  const filteredReviews = reviews?.filter((r: any) => {
    const matchesSearch = 
      r.content?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleModerate = async (id: string, action: 'approve' | 'reject' | 'feature' | 'unfeature') => {
    try {
      await moderateReview.mutateAsync({ id, action, admin_notes: adminNotes || undefined });
      toast.success(
        action === 'approve' ? 'Review approved' :
        action === 'reject' ? 'Review rejected' :
        action === 'feature' ? 'Review featured' : 'Review unfeatured'
      );
      setViewingReview(null);
      setAdminNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to moderate review');
    }
  };

  const handleDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteReview.mutateAsync(deletingReview.id);
      toast.success('Review deleted');
      setDeletingReview(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const pendingCount = reviews?.filter((r: any) => !r.is_approved).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">Moderate customer reviews</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-base px-3 py-1">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {review.product?.image_url && (
                          <img 
                            src={review.product.image_url} 
                            alt="" 
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <Link 
                          to={`/products/${review.product?.slug}`}
                          className="text-sm font-medium hover:underline"
                          target="_blank"
                        >
                          {review.product?.name || 'Unknown'}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {review.profile?.full_name || 'Anonymous'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate">{review.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {review.is_approved ? (
                          <Badge variant="default">Approved</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {review.is_featured && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewingReview(review)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {!review.is_approved && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleModerate(review.id, 'approve')}
                                  disabled={moderateReview.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {review.is_approved && !review.is_featured && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleModerate(review.id, 'feature')}
                                  disabled={moderateReview.isPending}
                                >
                                  <Star className="h-4 w-4 text-amber-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Feature</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingReview(review)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Review Dialog */}
      <Dialog open={!!viewingReview} onOpenChange={() => setViewingReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Review Details</DialogTitle>
          </DialogHeader>

          {viewingReview && (
            <div className="space-y-4">
              {/* Product */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {viewingReview.product?.image_url && (
                  <img 
                    src={viewingReview.product.image_url} 
                    alt="" 
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{viewingReview.product?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    By {viewingReview.profile?.full_name || 'Anonymous'}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={viewingReview.rating} size="lg" />
                <span className="text-lg font-medium">{viewingReview.rating}/5</span>
              </div>

              {/* Review Content */}
              {viewingReview.title && (
                <h4 className="font-medium text-lg">{viewingReview.title}</h4>
              )}
              <p className="text-muted-foreground leading-relaxed">
                {viewingReview.content}
              </p>

              {/* Submitted Date */}
              <p className="text-sm text-muted-foreground">
                Submitted on {format(new Date(viewingReview.created_at), 'MMMM d, yyyy')}
              </p>

              {/* Admin Notes */}
              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes || viewingReview.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this review..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {viewingReview && !viewingReview.is_approved && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleModerate(viewingReview.id, 'reject')}
                  disabled={moderateReview.isPending}
                  className="text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerate(viewingReview.id, 'approve')}
                  disabled={moderateReview.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {viewingReview?.is_approved && (
              <>
                {viewingReview.is_featured ? (
                  <Button
                    variant="outline"
                    onClick={() => handleModerate(viewingReview.id, 'unfeature')}
                    disabled={moderateReview.isPending}
                  >
                    Remove Featured
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleModerate(viewingReview.id, 'feature')}
                    disabled={moderateReview.isPending}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Feature Review
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReview} onOpenChange={() => setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
