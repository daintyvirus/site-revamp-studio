import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useCategories, useBrands } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const categorySlug = searchParams.get('category') || undefined;
  const brandSlug = searchParams.get('brand') || undefined;
  const searchQuery = searchParams.get('search') || undefined;

  const { data: products, isLoading } = useProducts({ categorySlug, brandSlug, search: searchQuery });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = categorySlug || brandSlug || searchQuery;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            'lg:w-64 flex-shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>

              {/* Search */}
              <div>
                <Input
                  placeholder="Search products..."
                  value={searchQuery || ''}
                  onChange={(e) => updateFilter('search', e.target.value || null)}
                  className="bg-muted"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug === categorySlug ? null : cat.slug)}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        cat.slug === categorySlug
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands?.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => updateFilter('brand', brand.slug === brandSlug ? null : brand.slug)}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        brand.slug === brandSlug
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {categorySlug ? categories?.find(c => c.slug === categorySlug)?.name : 'All Products'}
              </h1>
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <ProductGrid products={products ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
