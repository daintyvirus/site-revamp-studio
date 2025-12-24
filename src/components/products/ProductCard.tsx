import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
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

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product.id);

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
      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover-lift card-3d">
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-destructive/20 to-primary/20 animate-gradient-shift" style={{ backgroundSize: '200% 100%' }} />
        </div>
        
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Zap className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/50 transition-colors duration-300" />
            </div>
          )}
          
          {/* Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" className="font-display animate-bounce-in shadow-lg shadow-destructive/30">
                -{discountPercent}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary font-display shadow-lg shadow-primary/30 animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                Featured
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="secondary" className="font-display">
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
                'absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm bg-background/80 hover:bg-primary hover:text-primary-foreground',
                isInWishlist && 'opacity-100 translate-y-0'
              )}
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
            >
              <Heart className={cn(
                'h-4 w-4 transition-all duration-300',
                isInWishlist && 'fill-current text-destructive scale-110',
                toggleWishlist.isPending && 'animate-pulse'
              )} />
            </Button>
          )}

          {/* Quick Add */}
          {product.stock > 0 && user && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 btn-shine"
              >
                <ShoppingCart className={cn(
                  'h-4 w-4 mr-2 transition-transform',
                  addToCart.isPending && 'animate-bounce'
                )} />
                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 relative">
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            {product.category && (
              <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">{product.category.name}</p>
            )}
            <h3 className="font-display font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
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
        
        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
}
