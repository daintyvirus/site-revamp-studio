import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  is_approved: boolean;
  is_featured: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch approved reviews for a product
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile info for each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', review.user_id)
            .maybeSingle();
          
          return { ...review, profile } as ProductReview;
        })
      );

      return reviewsWithProfiles;
    },
    enabled: !!productId,
  });
}

// Fetch user's own review for a product
export function useUserProductReview(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-product-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ProductReview | null;
    },
    enabled: !!productId && !!user,
  });
}

// Fetch all reviews for admin moderation
export function useAdminReviews(filter?: 'all' | 'pending' | 'approved' | 'featured') {
  return useQuery({
    queryKey: ['admin-reviews', filter],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filter === 'featured') {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profile and product info
      const reviewsWithDetails = await Promise.all(
        (data || []).map(async (review) => {
          const [profileResult, productResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', review.user_id)
              .maybeSingle(),
            supabase
              .from('products')
              .select('name, slug, image_url')
              .eq('id', review.product_id)
              .maybeSingle(),
          ]);

          return {
            ...review,
            profile: profileResult.data,
            product: productResult.data,
          };
        })
      );

      return reviewsWithDetails;
    },
  });
}

// Create a review
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (review: {
      product_id: string;
      rating: number;
      title?: string;
      content: string;
    }) => {
      if (!user) throw new Error('Must be logged in to submit a review');

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          ...review,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['user-product-review', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

// Update a review
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      rating?: number;
      title?: string;
      content?: string;
    }) => {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-product-review'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

// Admin moderation actions
export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      admin_notes,
    }: {
      id: string;
      action: 'approve' | 'reject' | 'feature' | 'unfeature';
      admin_notes?: string;
    }) => {
      const updates: Record<string, any> = { admin_notes };

      if (action === 'approve') {
        updates.is_approved = true;
      } else if (action === 'reject') {
        updates.is_approved = false;
      } else if (action === 'feature') {
        updates.is_featured = true;
        updates.is_approved = true; // Auto-approve featured reviews
      } else if (action === 'unfeature') {
        updates.is_featured = false;
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

// Delete a review
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-product-review'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

// Get review statistics for a product
export function useProductReviewStats(productId: string) {
  return useQuery({
    queryKey: ['product-review-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let total = 0;

      data.forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++;
        total += review.rating;
      });

      return {
        average: total / data.length,
        count: data.length,
        distribution,
      };
    },
    enabled: !!productId,
  });
}
