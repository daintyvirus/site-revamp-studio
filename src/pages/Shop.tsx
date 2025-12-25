import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
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
  const currentCategory = categories?.find(c => c.slug === categorySlug);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                {currentCategory?.name || 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {products?.length || 0} products available
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden border-border/50"
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
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <aside className={cn(
              'lg:w-64 flex-shrink-0',
              showFilters ? 'block' : 'hidden lg:block'
            )}>
              <div className="sticky top-24 space-y-5 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    Filters
                  </h2>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary h-7 px-2">
                      <X className="h-3 w-3 mr-1" /> Clear
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
                      className="pl-9 h-9 bg-muted/30 border-border/30 text-sm"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
                  <div className="space-y-0.5">
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter('category', cat.slug === categorySlug ? null : cat.slug)}
                        className={cn(
                          'flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                          cat.slug === categorySlug
                            ? 'bg-primary/10 text-primary font-medium border border-primary/30'
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {cat.icon && <span className="text-base">{cat.icon}</span>}
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {brands && brands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">Brands</h3>
                    <div className="space-y-0.5">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => updateFilter('brand', brand.slug === brandSlug ? null : brand.slug)}
                          className={cn(
                            'flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                            brand.slug === brandSlug
                              ? 'bg-primary/10 text-primary font-medium border border-primary/30'
                              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {brand.logo_url && (
                            <img src={brand.logo_url} alt={brand.name} className="w-5 h-5 object-contain rounded" />
                          )}
                          <span className="truncate">{brand.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1">
              {/* Active Filters */}
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentCategory && (
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-muted"
                      onClick={() => updateFilter('category', null)}
                    >
                      {currentCategory.icon && <span>{currentCategory.icon}</span>}
                      {currentCategory.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {brandSlug && brands?.find(b => b.slug === brandSlug) && (
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-muted"
                      onClick={() => updateFilter('brand', null)}
                    >
                      {brands.find(b => b.slug === brandSlug)?.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-muted"
                      onClick={() => updateFilter('search', null)}
                    >
                      "{searchQuery}"
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              )}

              <ProductGrid products={products ?? []} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Badge component for active filters
function Badge({ 
  children, 
  className, 
  variant = 'default',
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'default' | 'secondary';
  onClick?: () => void;
}) {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full border",
        variant === 'secondary' 
          ? "bg-muted/50 border-border/50 text-foreground" 
          : "bg-primary text-primary-foreground border-primary",
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
