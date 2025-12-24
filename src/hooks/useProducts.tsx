import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Category, Brand } from '@/types/database';

export function useProducts(filters?: {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data as Product[];
      
      if (filters?.categorySlug) {
        filteredData = filteredData.filter(p => p.category?.slug === filters.categorySlug);
      }
      if (filters?.brandSlug) {
        filteredData = filteredData.filter(p => p.brand?.slug === filters.brandSlug);
      }
      
      return filteredData;
    }
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    }
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Brand[];
    }
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: { name: string; slug: string; price: number } & Partial<Omit<Product, 'name' | 'slug' | 'price'>>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });
}
