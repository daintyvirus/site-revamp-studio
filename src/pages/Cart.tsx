import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';

export default function Cart() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  // Calculate totals in both currencies
  const totalBDT = cart?.reduce((sum, item) => {
    const priceBDT = item.product?.sale_price_bdt || item.product?.price_bdt || 0;
    return sum + priceBDT * item.quantity;
  }, 0) ?? 0;

  const totalUSD = cart?.reduce((sum, item) => {
    const priceUSD = item.product?.sale_price || item.product?.price || 0;
    return sum + priceUSD * item.quantity;
  }, 0) ?? 0;

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Sign in to view your cart</h1>
            <p className="text-muted-foreground mb-6">Keep track of your items across devices</p>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading cart...</div>
        </div>
      </Layout>
    );
  }

  if (!cart?.length) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some gaming goodies to get started</p>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Shopping Cart
          <span className="text-sm font-normal text-muted-foreground">({cart.length} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                  {item.product?.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.product?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.product?.category?.name}</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatPrice(item.product?.sale_price_bdt || item.product?.price_bdt || 0, item.product?.sale_price || item.product?.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cart.length} items)</span>
                  <span>{formatPrice(totalBDT, totalUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-success">Instant</span>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatPrice(totalBDT, totalUSD)}
                  </span>
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base" 
                size="lg"
              >
                <Link to="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout with instant digital delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
