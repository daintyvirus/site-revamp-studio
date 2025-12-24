import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useHomepageSection } from '@/hooks/useHomepageSections';

export default function BestSellersSection() {
  const { data: products, isLoading } = useProducts({});
  const { data: section } = useHomepageSection('bestsellers');
  
  // Get content from database or use defaults
  const badgeText = section?.badge_text || 'Most Popular';
  const title = section?.title || 'Best Sellers';
  const description = section?.description || 'Our most purchased products loved by gamers';

  // Don't render if section is hidden
  if (section && !section.is_visible) return null;

  // Get first 4 products as "bestsellers" (in real app, would sort by sales)
  const bestsellers = products?.slice(0, 4) ?? [];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">{badgeText}</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>
          <Button asChild variant="outline" className="animate-slide-up hover:border-primary hover:text-primary transition-all duration-300 group" style={{ animationDelay: '0.1s' }}>
            <Link to="/shop">
              View All
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <ProductGrid products={bestsellers} isLoading={isLoading} />
      </div>
    </section>
  );
}
