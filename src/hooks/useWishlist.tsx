import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { WishlistItem } from '@/types/database';
import { toast } from 'sonner';

export function useWishlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user
  });
}

export function useToggleWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Please sign in to add items to wishlist');

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { added: false };
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId
          });
        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(result.added ? 'Added to wishlist!' : 'Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useIsInWishlist(productId: string) {
  const { data: wishlist } = useWishlist();
  return wishlist?.some(item => item.product_id === productId) ?? false;
}
