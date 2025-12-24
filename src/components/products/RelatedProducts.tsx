import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';
import type { Product } from '@/types/database';

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
}

export default function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['related-products', productId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!categoryId
  });

  if (isLoading) {
    return (
      <div className="mt-16 pt-8 border-t">
        <h2 className="font-display text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProducts?.length) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Related Products</h2>
        <Link 
          to={`/shop?category=${relatedProducts[0]?.category?.slug || ''}`}
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
