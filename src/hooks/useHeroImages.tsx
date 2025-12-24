import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HeroImage {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useHeroImages() {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as HeroImage[];
    },
  });
}

export function useAdminHeroImages() {
  return useQuery({
    queryKey: ['admin-hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as HeroImage[];
    },
  });
}

export function useCreateHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (heroImage: Omit<HeroImage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hero_images')
        .insert(heroImage)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      toast.success('Hero image added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add hero image: ${error.message}`);
    },
  });
}

export function useUpdateHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('hero_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      toast.success('Hero image updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update hero image: ${error.message}`);
    },
  });
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      toast.success('Hero image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete hero image: ${error.message}`);
    },
  });
}
