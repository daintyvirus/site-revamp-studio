import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import type { Product } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

interface CountdownDisplayProps {
  endDate: string;
}

function CountdownDisplay({ endDate }: CountdownDisplayProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }
      setTimeLeft({
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) return null;

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-destructive">
      <span className="font-medium">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product.id);

  const now = new Date();
  const saleStartDate = product.sale_start_date ? new Date(product.sale_start_date) : null;
  const saleEndDate = product.sale_end_date ? new Date(product.sale_end_date) : null;
  
  const isFlashSaleActive = product.flash_sale_enabled && 
    product.sale_price_bdt && product.sale_price_bdt < product.price_bdt &&
    (!saleStartDate || saleStartDate <= now) && (!saleEndDate || saleEndDate > now);

  const displayPriceBDT = product.sale_price_bdt || product.price_bdt;
  const displayPriceUSD = product.sale_price || product.price;
  const hasDiscount = product.sale_price_bdt && product.sale_price_bdt < product.price_bdt;
  const discountPercent = hasDiscount
    ? Math.round(((product.price_bdt - product.sale_price_bdt!) / product.price_bdt) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ productId: product.id });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist.mutate(product.id);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/30 transition-all duration-300 card-hover">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary to-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl text-muted-foreground/30">🎮</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {(isFlashSaleActive || hasDiscount) && (
              <Badge className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1">
                -{discountPercent}%
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          {user && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all',
                isInWishlist && 'opacity-100'
              )}
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
            >
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-destructive text-destructive')} />
            </Button>
          )}

          {/* Quick Add */}
          {product.stock > 0 && user && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-glow"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>
          )}
          <h3 className="font-display font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {isFlashSaleActive && saleEndDate && (
            <div className="mb-2">
              <CountdownDisplay endDate={product.sale_end_date!} />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-display text-lg font-bold",
              isFlashSaleActive ? "text-primary" : "text-foreground"
            )}>
              {formatPrice(displayPriceBDT, displayPriceUSD)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price_bdt, product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
