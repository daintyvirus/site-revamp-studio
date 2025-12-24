import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';

export default function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({ featured: true });

  return (
    <section className="py-16 md:py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Top picks handpicked for gamers like you
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/shop">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <ProductGrid products={products?.slice(0, 8) ?? []} isLoading={isLoading} />
      </div>
    </section>
  );
}
