import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, ShoppingCart, Zap, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const isInWishlist = useIsInWishlist(product?.id || '');

  const hasDiscount = product?.sale_price && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product?.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate({ productId: product.id });
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
              {hasDiscount && (
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

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-foreground">
                ${displayPrice?.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-4 w-4 text-muted-foreground" />
              {product.stock > 0 ? (
                <span className="text-sm text-green-500 font-medium">
                  In Stock ({product.stock} available)
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
                    className="flex-1 glow-purple"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending || product.stock <= 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
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

            {/* Variants (if any) */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display font-semibold text-foreground mb-4">Available Options</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <div 
                      key={variant.id}
                      className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <p className="font-medium text-foreground text-sm">{variant.name}</p>
                      <p className="text-primary font-display font-semibold">
                        ${(variant.sale_price || variant.price).toFixed(2)}
                      </p>
                      {variant.stock <= 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">Out of Stock</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
