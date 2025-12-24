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
    <Link to={`/product/${product.slug}`} className="group">
      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Zap className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" className="font-display">
                -{discountPercent}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary font-display">Featured</Badge>
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
                'absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300',
                isInWishlist && 'opacity-100'
              )}
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
            >
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current text-destructive')} />
            </Button>
          )}

          {/* Quick Add */}
          {product.stock > 0 && user && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="w-full glow-purple"
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
            <p className="text-xs text-primary font-medium mb-1">{product.category.name}</p>
          )}
          <h3 className="font-display font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-foreground">
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
