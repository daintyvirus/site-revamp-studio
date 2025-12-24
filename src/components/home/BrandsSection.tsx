import { useBrands } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';

export default function BrandsSection() {
  const { data: brands } = useBrands();

  if (!brands?.length) return null;

  return (
    <section className="py-16 md:py-24 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Trusted Brands
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Official digital products from top gaming brands worldwide
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brand=${brand.slug}`}
              className="group opacity-60 hover:opacity-100 transition-opacity"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-12 w-auto grayscale group-hover:grayscale-0 transition-all"
                />
              ) : (
                <span className="font-display text-xl font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
