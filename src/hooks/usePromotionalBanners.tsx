import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromotionalBanner {
  id: string;
  text: string;
  link_url: string | null;
  background_color: string | null;
  text_color: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  countdown_enabled: boolean;
  countdown_end_time: string | null;
  countdown_label: string | null;
  created_at: string;
  updated_at: string;
}

export function usePromotionalBanners() {
  return useQuery({
    queryKey: ['promotional-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as PromotionalBanner[];
    },
  });
}

export function useActivePromotionalBanners() {
  return useQuery({
    queryKey: ['promotional-banners', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Filter by date range on client side for simplicity
      return (data as PromotionalBanner[]).filter(banner => {
        if (banner.starts_at && new Date(banner.starts_at) > new Date()) return false;
        if (banner.ends_at && new Date(banner.ends_at) < new Date()) return false;
        return true;
      });
    },
  });
}

export function useCreatePromotionalBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banner: Omit<PromotionalBanner, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .insert(banner)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success('Banner created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create banner: ' + error.message);
    },
  });
}

export function useUpdatePromotionalBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PromotionalBanner> & { id: string }) => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success('Banner updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update banner: ' + error.message);
    },
  });
}

export function useDeletePromotionalBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete banner: ' + error.message);
    },
  });
}
