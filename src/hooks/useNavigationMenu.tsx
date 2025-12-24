import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NavigationMenuItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  parent_id: string | null;
  location: string;
  sort_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export function useNavigationMenu(location?: string) {
  return useQuery({
    queryKey: ['navigation-menu', location],
    queryFn: async () => {
      let query = supabase
        .from('navigation_menu')
        .select('*')
        .order('sort_order', { ascending: true });

      if (location) {
        query = query.eq('location', location);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NavigationMenuItem[];
    },
  });
}

export function useAdminNavigationMenu() {
  return useQuery({
    queryKey: ['admin-navigation-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_menu')
        .select('*')
        .order('location', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as NavigationMenuItem[];
    },
  });
}

export function useCreateNavigationMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<NavigationMenuItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('navigation_menu')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menu'] });
      queryClient.invalidateQueries({ queryKey: ['admin-navigation-menu'] });
      toast.success('Menu item added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add menu item: ${error.message}`);
    },
  });
}

export function useUpdateNavigationMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NavigationMenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('navigation_menu')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menu'] });
      queryClient.invalidateQueries({ queryKey: ['admin-navigation-menu'] });
      toast.success('Menu item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update menu item: ${error.message}`);
    },
  });
}

export function useDeleteNavigationMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('navigation_menu')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menu'] });
      queryClient.invalidateQueries({ queryKey: ['admin-navigation-menu'] });
      toast.success('Menu item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete menu item: ${error.message}`);
    },
  });
}
