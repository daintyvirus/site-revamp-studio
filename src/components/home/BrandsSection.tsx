import { useBrands } from '@/hooks/useProducts';
import { useHomepageSection } from '@/hooks/useHomepageSections';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrandsSection() {
  const { data: brands } = useBrands();
  const { data: section } = useHomepageSection('brands');
  
  // Get content from database or use defaults
  const title = section?.title || 'Trusted Brands';
  const description = section?.description || 'Official digital products from top gaming brands worldwide';

  // Don't render if section is hidden or no brands
  if (section && !section.is_visible) return null;
  if (!brands?.length) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-transparent to-card/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brand=${brand.slug}`}
              className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-12 w-auto object-contain opacity-70 group-hover:opacity-100 transition-all"
                />
              ) : (
                <span className="font-display text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        {brands.length > 12 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10 group">
              <Link to="/shop">
                View All Brands
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
