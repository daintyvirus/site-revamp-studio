import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Clock } from 'lucide-react';
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
      <div className="relative overflow-hidden rounded-xl bg-card/50 border border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl text-muted-foreground/30">🎮</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {(isFlashSaleActive || hasDiscount) && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="secondary" className="text-[10px] bg-muted/80">Out of Stock</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all border border-border/30',
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
            <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                size="sm"
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-medium rounded-lg h-8"
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-primary mb-1.5">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {(product as any).delivery_time || 'Instant'}
            </span>
          </div>
          
          {product.category && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{product.category.name}</p>
          )}
          <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          
          {isFlashSaleActive && saleEndDate && (
            <div className="mb-1.5">
              <CountdownDisplay endDate={product.sale_end_date!} />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold text-sm",
              isFlashSaleActive ? "text-primary" : "text-foreground"
            )}>
              {formatPrice(displayPriceBDT, displayPriceUSD)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price_bdt, product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
