import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCheckout, generateWhatsAppMessage } from '@/hooks/useCheckout';

const WHATSAPP_NUMBER = '1234567890'; // Replace with actual number

export default function Checkout() {
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const checkout = useCheckout();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  const total = cart?.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0) ?? 0;

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to checkout</h1>
          <p className="text-muted-foreground mb-6">You need an account to place orders</p>
          <Button asChild className="glow-purple">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!cart?.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items before checking out</p>
          <Button asChild className="glow-purple">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleWhatsAppCheckout = async () => {
    try {
      const result = await checkout.mutateAsync({ notes, paymentMethod: 'whatsapp' });
      
      // Generate WhatsApp message and open
      const message = generateWhatsAppMessage(result.cart, result.order.id, notes);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      navigate('/orders');
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.product?.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">
                    ${((item.product?.sale_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Complete Your Order</h2>
            
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or your in-game ID..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  maxLength={500}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Complete your order via WhatsApp. You'll be redirected to chat with us to confirm payment and receive your digital products.
                </p>
                
                <Button 
                  onClick={handleWhatsAppCheckout}
                  disabled={checkout.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {checkout.isPending ? 'Processing...' : 'Order via WhatsApp'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
