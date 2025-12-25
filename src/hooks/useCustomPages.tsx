import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  show_in_menu: boolean;
  menu_location: string | null;
  menu_order: number;
  created_at: string;
  updated_at: string;
  sections?: PageSection[];
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  background_color: string | null;
  text_color: string | null;
  extra_data: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  faq_items?: FaqItem[];
  feature_items?: FeatureItem[];
}

export interface FaqItem {
  id: string;
  section_id: string | null;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FeatureItem {
  id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Fetch all pages (admin)
export function useAdminPages() {
  return useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('menu_order');
      if (error) throw error;
      return data as CustomPage[];
    },
  });
}

// Fetch single page with sections
export function usePage(slug: string) {
  return useQuery({
    queryKey: ['page', slug],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (pageError) throw pageError;
      if (!page) return null;

      const { data: sections, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_visible', true)
        .order('sort_order');
      
      if (sectionsError) throw sectionsError;

      // Fetch FAQ and feature items for each section
      const sectionsWithItems = await Promise.all(
        (sections || []).map(async (section) => {
          if (section.section_type === 'faq') {
            const { data: faqItems } = await supabase
              .from('faq_items')
              .select('*')
              .eq('section_id', section.id)
              .eq('is_active', true)
              .order('sort_order');
            return { ...section, faq_items: faqItems || [] };
          }
          if (section.section_type === 'features') {
            const { data: featureItems } = await supabase
              .from('feature_items')
              .select('*')
              .eq('section_id', section.id)
              .eq('is_active', true)
              .order('sort_order');
            return { ...section, feature_items: featureItems || [] };
          }
          return section;
        })
      );

      return { ...page, sections: sectionsWithItems } as CustomPage;
    },
    enabled: !!slug,
  });
}

// Fetch page for admin editing (with all sections)
export function useAdminPage(id: string) {
  return useQuery({
    queryKey: ['admin-page', id],
    queryFn: async () => {
      const { data: page, error: pageError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pageError) throw pageError;

      const { data: sections, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', id)
        .order('sort_order');
      
      if (sectionsError) throw sectionsError;

      // Fetch FAQ and feature items
      const sectionsWithItems = await Promise.all(
        (sections || []).map(async (section) => {
          if (section.section_type === 'faq') {
            const { data: faqItems } = await supabase
              .from('faq_items')
              .select('*')
              .eq('section_id', section.id)
              .order('sort_order');
            return { ...section, faq_items: faqItems || [] };
          }
          if (section.section_type === 'features') {
            const { data: featureItems } = await supabase
              .from('feature_items')
              .select('*')
              .eq('section_id', section.id)
              .order('sort_order');
            return { ...section, feature_items: featureItems || [] };
          }
          return section;
        })
      );

      return { ...page, sections: sectionsWithItems } as CustomPage;
    },
    enabled: !!id,
  });
}

// Create page
export function useCreatePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; meta_title?: string; meta_description?: string }) => {
      const { data, error } = await supabase
        .from('custom_pages')
        .insert(page)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success('Page created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });
}

// Update page
export function useUpdatePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...page }: Partial<CustomPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_pages')
        .update(page)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-page', variables.id] });
      toast.success('Page updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update page: ${error.message}`);
    },
  });
}

// Delete page
export function useDeletePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success('Page deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete page: ${error.message}`);
    },
  });
}

// Create section
export function useCreateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (section: Partial<PageSection> & { page_id: string; section_type: string }) => {
      const { data, error } = await supabase
        .from('page_sections')
        .insert(section)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-page', variables.page_id] });
      toast.success('Section added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add section: ${error.message}`);
    },
  });
}

// Update section
export function useUpdateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...section }: Partial<PageSection> & { id: string }) => {
      const { data, error } = await supabase
        .from('page_sections')
        .update(section)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
      toast.success('Section updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });
}

// Delete section
export function useDeleteSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
      toast.success('Section deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });
}

// Reorder sections
export function useReorderSections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sections: { id: string; sort_order: number }[]) => {
      const promises = sections.map(s =>
        supabase.from('page_sections').update({ sort_order: s.sort_order }).eq('id', s.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

// FAQ Item mutations
export function useCreateFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: { section_id: string; question: string; answer: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('faq_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

export function useUpdateFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FaqItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('faq_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

export function useDeleteFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

// Feature Item mutations
export function useCreateFeatureItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: { section_id: string; title: string; description?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('feature_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

export function useUpdateFeatureItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FeatureItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('feature_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}

export function useDeleteFeatureItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feature_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page'] });
    },
  });
}
