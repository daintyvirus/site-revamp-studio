import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';

export default function Wishlist() {
  const { user } = useAuth();
  const { data: wishlist, isLoading } = useWishlist();

  const products = wishlist?.map(item => item.product).filter(Boolean) ?? [];

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-6">Save your favorite items for later</p>
          <Button asChild className="glow-purple">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Wishlist</h1>
        
        {!products.length && !isLoading ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Browse products and add your favorites</p>
            <Button asChild className="glow-purple">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products as any} isLoading={isLoading} />
        )}
      </div>
    </Layout>
  );
}
