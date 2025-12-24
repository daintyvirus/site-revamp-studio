import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  type: string;
  account_number: string;
  account_name: string | null;
  logo_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  available_currencies: string[] | null;
  created_at: string;
  updated_at: string;
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as PaymentMethod[];
    }
  });
}

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as PaymentMethod[];
    }
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(method)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Payment method added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add payment method', description: error.message, variant: 'destructive' });
    }
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentMethod> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Payment method updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    }
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Payment method deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
    }
  });
}
