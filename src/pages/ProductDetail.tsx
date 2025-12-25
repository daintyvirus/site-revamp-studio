import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, ShoppingCart, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import VariantSelector from '@/components/products/VariantSelector';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product?.id || '');
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants?.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product?.variants, selectedVariantId]);

  const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId);

  // Use variant price if selected, otherwise product price
  const basePriceBDT = selectedVariant 
    ? (selectedVariant.sale_price_bdt || selectedVariant.price_bdt)
    : (product?.sale_price_bdt || product?.price_bdt || 0);
  
  const basePriceUSD = selectedVariant 
    ? (selectedVariant.sale_price || selectedVariant.price)
    : (product?.sale_price || product?.price || 0);
  
  const originalPriceBDT = selectedVariant 
    ? selectedVariant.price_bdt 
    : (product?.price_bdt || 0);

  const originalPriceUSD = selectedVariant 
    ? selectedVariant.price 
    : (product?.price || 0);

  const hasDiscount = basePriceBDT < originalPriceBDT;

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;

  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate({ 
        productId: product.id, 
        variantId: selectedVariantId || undefined,
        quantity: 1
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart.mutate({ 
        productId: product.id, 
        variantId: selectedVariantId || undefined,
        quantity: 1
      }, {
        onSuccess: () => {
          navigate('/checkout');
        }
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
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
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
          <title>Product Not Found | Golden Bumps</title>
        </Helmet>
        <div className="container py-16 text-center">
          <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
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
        <title>{product.name} | Golden Bumps</title>
        <meta name="description" content={product.short_description || product.description || `Buy ${product.name} at Golden Bumps`} />
      </Helmet>

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image - Kryptomate Style */}
          <div className="relative">
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
              {/* Delivery Time Badge */}
              <div className="flex items-center gap-2 text-primary mb-4">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  {product.delivery_time || 'Instant Delivery'}
                </span>
              </div>

              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/50">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}

                {/* Validity Badge */}
                <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground border-0">
                  Validity : 3000
                </Badge>

                {/* Wishlist Button on Image */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={!user || toggleWishlist.isPending}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-background/90 transition-colors disabled:opacity-50"
                >
                  <Heart className={cn('h-4 w-4', isInWishlist && 'fill-red-500 text-red-500')} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>

          {/* Product Info - Kryptomate Style */}
          <div className="flex flex-col">
            {/* Product Title - Clean & Smaller */}
            <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
              {product.name}
            </h1>

            {/* Preset Values / Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Preset Values</p>
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />
              </div>
            )}

            {/* Action Buttons - Side by Side like Kryptomate */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {user ? (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-border/50 hover:bg-muted/50 font-medium"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending || currentStock <= 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 bg-primary hover:bg-primary/90 font-medium"
                    onClick={handleBuyNow}
                    disabled={addToCart.isPending || currentStock <= 0}
                  >
                    Buy Now!
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-border/50 hover:bg-muted/50 font-medium"
                    asChild
                  >
                    <Link to="/auth">Add to Cart</Link>
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 bg-primary hover:bg-primary/90 font-medium"
                    asChild
                  >
                    <Link to="/auth">Buy Now!</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Estimated Price */}
            <div className="text-center mb-8">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Estimated Price: </span>
              <span className="text-lg font-bold">{formatPrice(basePriceBDT, basePriceUSD)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(originalPriceBDT, originalPriceUSD)}
                </span>
              )}
            </div>

            {/* Product Details Card */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Product Details</p>
                <p className="text-sm text-muted-foreground">Discover key information before you redeem or share this card.</p>
              </div>

              {/* About Section */}
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">About</p>
                <p className="text-sm text-foreground">
                  {product.short_description || product.description || '—'}
                </p>
              </div>

              {/* How to Redeem Section */}
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">How to Redeem/Use</p>
                <div className="text-sm text-foreground space-y-1">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <>
                      <p>1. After purchase, you will receive your code via email.</p>
                      <p>2. Go to the official redemption page.</p>
                      <p>3. Enter your code and enjoy!</p>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                {currentStock > 0 ? (
                  <span className="text-primary font-medium">In Stock ({currentStock} available)</span>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* Related Products */}
        <RelatedProducts 
          productId={product.id}
          categoryId={product.category_id} 
        />
      </div>
    </Layout>
  );
}
