import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  label: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsMap {
  [key: string]: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category')
        .order('sort_order');

      if (error) throw error;
      
      // Convert to a map for easy access
      const settingsMap: SiteSettingsMap = {};
      (data as SiteSetting[]).forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value || '';
      });
      
      return settingsMap;
    },
  });
}

export function useAdminSiteSettings() {
  return useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category')
        .order('sort_order');

      if (error) throw error;
      return data as SiteSetting[];
    },
  });
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, setting_value }: { id: string; setting_value: string }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ setting_value })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });
}

export function useBulkUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; setting_value: string }[]) => {
      const promises = updates.map(update =>
        supabase
          .from('site_settings')
          .update({ setting_value: update.setting_value })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} settings`);
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
}

export function useCreateSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('site_settings')
        .insert(setting)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      toast.success('Setting added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add setting: ${error.message}`);
    },
  });
}

export function useDeleteSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      toast.success('Setting deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete setting: ${error.message}`);
    },
  });
}
