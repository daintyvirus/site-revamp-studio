import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminCoupons() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: isAdmin,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, used_count: 0 })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create coupon: ${error.message}`);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Coupon> & { id: string }) => {
      const { error } = await supabase
        .from('coupons')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update coupon: ${error.message}`);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete coupon: ${error.message}`);
    },
  });
}

export function useValidateCoupon() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      // Get the coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        throw new Error('Invalid coupon code');
      }

      const now = new Date();
      
      // Check if coupon has started
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        throw new Error('This coupon is not yet active');
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        throw new Error('This coupon has expired');
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('This coupon has reached its usage limit');
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
        throw new Error(`Minimum order amount is ৳${coupon.min_order_amount}`);
      }

      // Check if user has already used this coupon
      if (user) {
        const { data: usage } = await supabase
          .from('coupon_usage')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', user.id)
          .single();

        if (usage) {
          throw new Error('You have already used this coupon');
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (orderTotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
          discount = coupon.max_discount_amount;
        }
      } else {
        discount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed order total
      if (discount > orderTotal) {
        discount = orderTotal;
      }

      return {
        coupon: coupon as Coupon,
        discount: Math.round(discount),
      };
    },
  });
}

export function useRecordCouponUsage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, orderId, discountApplied }: { 
      couponId: string; 
      orderId: string; 
      discountApplied: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Record usage
      const { error: usageError } = await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: user.id,
          order_id: orderId,
          discount_applied: discountApplied,
        });

      if (usageError) throw usageError;

      // Increment used_count manually
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1 })
          .eq('id', couponId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}