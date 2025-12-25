import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {categorySlug 
                ? categories?.find(c => c.slug === categorySlug)?.name 
                : 'All Products'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {products?.length || 0} products available
            </p>
          </div>
          
          <Button
            variant="outline"
            className="lg:hidden border-primary/50 hover:bg-primary/10"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasFilters && (
              <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {(categorySlug ? 1 : 0) + (brandSlug ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            'lg:w-72 flex-shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <div className="sticky top-24 space-y-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filters
                </h2>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>

              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery || ''}
                    onChange={(e) => updateFilter('search', e.target.value || null)}
                    className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
                <div className="space-y-1">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug === categorySlug ? null : cat.slug)}
                      className={cn(
                        'flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                        cat.slug === categorySlug
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Brands</h3>
                <div className="space-y-1">
                  {brands?.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => updateFilter('brand', brand.slug === brandSlug ? null : brand.slug)}
                      className={cn(
                        'flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                        brand.slug === brandSlug
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {brand.logo_url && (
                        <img src={brand.logo_url} alt={brand.name} className="w-5 h-5 object-contain" />
                      )}
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <ProductGrid products={products ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
