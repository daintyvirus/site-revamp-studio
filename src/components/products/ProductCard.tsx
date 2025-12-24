import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

interface CountdownDisplayProps {
  endDate: string;
}

function CountdownDisplay({ endDate }: CountdownDisplayProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      setTimeLeft({
        hours: totalHours,
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
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product.id);

  const now = new Date();
  const saleStartDate = product.sale_start_date ? new Date(product.sale_start_date) : null;
  const saleEndDate = product.sale_end_date ? new Date(product.sale_end_date) : null;
  
  const isFlashSaleActive = product.flash_sale_enabled && 
    product.sale_price && 
    product.sale_price < product.price &&
    (!saleStartDate || saleStartDate <= now) &&
    (!saleEndDate || saleEndDate > now);

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
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
      <div className="relative overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-300 hover:border-border hover:shadow-card-hover">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
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
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isFlashSaleActive && (
              <Badge variant="destructive" className="text-xs">
                Sale -{discountPercent}%
              </Badge>
            )}
            {!isFlashSaleActive && hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          {user && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 hover:bg-background',
                isInWishlist && 'opacity-100'
              )}
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
            >
              <Heart className={cn(
                'h-4 w-4',
                isInWishlist && 'fill-destructive text-destructive'
              )} />
            </Button>
          )}

          {/* Quick Add */}
          {product.stock > 0 && user && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                size="sm"
                className="w-full bg-primary/95 hover:bg-primary backdrop-blur-sm"
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
            <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
          )}
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Flash Sale Countdown */}
          {isFlashSaleActive && saleEndDate && (
            <div className="mb-2">
              <CountdownDisplay endDate={product.sale_end_date!} />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-display text-lg font-semibold",
              isFlashSaleActive ? "text-destructive" : "text-foreground"
            )}>
              ${displayPrice?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
