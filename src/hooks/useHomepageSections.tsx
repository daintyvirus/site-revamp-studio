import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  badge_text: string | null;
  description: string | null;
  button_text: string | null;
  button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  is_visible: boolean;
  sort_order: number;
  extra_data: Json;
  created_at: string;
  updated_at: string;
}

export function useHomepageSections() {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });
}

export function useHomepageSection(sectionKey: string) {
  return useQuery({
    queryKey: ['homepage-section', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .single();

      if (error) throw error;
      return data as HomepageSection;
    },
  });
}

export function useUpdateHomepageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomepageSection> & { id: string }) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-section'] });
      toast.success('Section updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });
}

export function useCreateHomepageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: Omit<HomepageSection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert(section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast.success('Section created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });
}

export function useDeleteHomepageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast.success('Section deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });
}
