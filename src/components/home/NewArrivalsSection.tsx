import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useHomepageSection } from '@/hooks/useHomepageSections';

export default function NewArrivalsSection() {
  const { data: products, isLoading } = useProducts({});
  const { data: section } = useHomepageSection('new_arrivals');
  
  // Get content from database or use defaults
  const badgeText = section?.badge_text || 'Just Added';
  const title = section?.title || 'New Arrivals';
  const description = section?.description || 'Fresh products just added to our store';

  // Don't render if section is hidden
  if (section && !section.is_visible) return null;

  // Get last 4 products as "new arrivals" (sorted by created_at)
  const newArrivals = products?.slice(0, 4) ?? [];

  return (
    <section className="py-16 md:py-20 bg-card/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <Clock className="h-5 w-5" />
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

        <ProductGrid products={newArrivals} isLoading={isLoading} />
      </div>
    </section>
  );
}
