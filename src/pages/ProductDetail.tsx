import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, ShoppingCart, Zap, Package, Truck, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import VariantSelector from '@/components/products/VariantSelector';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: string;
}

function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
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

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
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
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-destructive/10 to-orange-500/10 border border-destructive/30 mb-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-destructive animate-pulse" />
        <span className="font-semibold text-destructive">Flash Sale ends in:</span>
      </div>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <span className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground mt-1">Hours</span>
        </div>
        <span className="text-destructive font-bold text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground mt-1">Mins</span>
        </div>
        <span className="text-destructive font-bold text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product?.id || '');
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants?.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product?.variants, selectedVariantId]);

  const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId);

  // Check if flash sale is active
  const now = new Date();
  const saleStartDate = product?.sale_start_date ? new Date(product.sale_start_date) : null;
  const saleEndDate = product?.sale_end_date ? new Date(product.sale_end_date) : null;
  
  const isFlashSaleActive = product?.flash_sale_enabled && 
    product?.sale_price && 
    product.sale_price < product.price &&
    (!saleStartDate || saleStartDate <= now) &&
    (!saleEndDate || saleEndDate > now);

  // Use variant price if selected, otherwise product price
  const basePrice = selectedVariant 
    ? (selectedVariant.sale_price || selectedVariant.price)
    : (product?.sale_price || product?.price || 0);
  
  const originalPrice = selectedVariant 
    ? selectedVariant.price 
    : (product?.price || 0);

  const hasDiscount = basePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
    : 0;

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;

  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate({ 
        productId: product.id, 
        variantId: selectedVariantId || undefined,
        quantity 
      });
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist.mutate(product.id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-muted rounded mb-8" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-10 w-3/4 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <Helmet>
          <title>Product Not Found | GameVault</title>
        </Helmet>
        <div className="container py-16 text-center">
          <Zap className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{product.name} | GameVault</title>
        <meta name="description" content={product.short_description || product.description || `Buy ${product.name} at GameVault`} />
      </Helmet>

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted border border-border">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Zap className="h-32 w-32 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isFlashSaleActive && (
                <Badge variant="destructive" className="font-display text-sm px-3 py-1 animate-pulse bg-gradient-to-r from-destructive to-orange-500">
                  <Zap className="h-4 w-4 mr-1" />
                  Flash Sale! -{discountPercent}% OFF
                </Badge>
              )}
              {!isFlashSaleActive && hasDiscount && (
                <Badge variant="destructive" className="font-display text-sm px-3 py-1">
                  -{discountPercent}% OFF
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-primary font-display text-sm px-3 py-1">Featured</Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 mb-3">
              {product.category && (
                <Link 
                  to={`/shop?category=${product.category.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              {product.category && product.brand && (
                <span className="text-muted-foreground">•</span>
              )}
              {product.brand && (
                <Link 
                  to={`/shop?brand=${product.brand.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {product.brand.name}
                </Link>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Flash Sale Countdown */}
            {isFlashSaleActive && saleEndDate && (
              <CountdownTimer endDate={product.sale_end_date!} />
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className={cn(
                "font-display text-4xl font-bold",
                isFlashSaleActive ? "text-destructive" : "text-foreground"
              )}>
                {formatPrice(basePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {hasDiscount && (
                <Badge variant="secondary" className="text-sm">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatPrice(basePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-4 w-4 text-muted-foreground" />
              {currentStock > 0 ? (
                <span className="text-sm text-green-500 font-medium">
                  In Stock ({currentStock} available)
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">Out of Stock</span>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Description */}
            {(product.short_description || product.description) && (
              <div className="mb-6">
                <h2 className="font-display font-semibold text-foreground mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || product.short_description}
                </p>
              </div>
            )}

            {/* Delivery Info */}
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border mb-6">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Instant Delivery</span> — Code sent to your email immediately after purchase
              </span>
            </div>

            <Separator className="mb-6" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {user ? (
                <>
                  <Button
                    size="lg"
                    className={cn(
                      "flex-1",
                      isFlashSaleActive 
                        ? "bg-gradient-to-r from-destructive to-orange-500 hover:from-destructive/90 hover:to-orange-500/90" 
                        : "glow-purple"
                    )}
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending || currentStock <= 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {currentStock <= 0 ? 'Out of Stock' : isFlashSaleActive ? 'Buy Now - Flash Sale!' : 'Add to Cart'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleToggleWishlist}
                    disabled={toggleWishlist.isPending}
                    className={cn(isInWishlist && 'border-destructive text-destructive')}
                  >
                    <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="flex-1 glow-purple">
                  <Link to="/auth">
                    Sign in to Purchase
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
