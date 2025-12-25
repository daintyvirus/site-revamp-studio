import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCheckout } from '@/hooks/useCheckout';
import { useActivePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCurrency } from '@/hooks/useCurrency';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import PaymentInstructions from '@/components/checkout/PaymentInstructions';

const STORE_NAME = 'GameStore';

type Step = 'info' | 'method' | 'payment';

export default function Checkout() {
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { data: paymentMethods, isLoading: methodsLoading } = useActivePaymentMethods();
  const { currency, formatPrice } = useCurrency();
  const checkout = useCheckout();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('info');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [selectedMethodSlug, setSelectedMethodSlug] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const selectedMethod = paymentMethods?.find(m => m.slug === selectedMethodSlug);

  // Filter payment methods by current currency
  const filteredPaymentMethods = useMemo(() => {
    if (!paymentMethods) return [];
    return paymentMethods.filter(m => {
      const currencies = m.available_currencies || ['BDT', 'USD'];
      return currencies.includes(currency);
    });
  }, [paymentMethods, currency]);

  // Calculate total in BDT (base currency)
  const totalBDT = cart?.reduce((sum, item) => {
    const priceBDT = item.product?.price_bdt || (item.product?.price || 0) * 110;
    return sum + priceBDT * item.quantity;
  }, 0) ?? 0;

  // Calculate total in USD
  const totalUSD = cart?.reduce((sum, item) => {
    const priceUSD = item.product?.sale_price || item.product?.price || 0;
    return sum + priceUSD * item.quantity;
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

  if (isLoading || methodsLoading) {
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

  const canProceedFromInfo = customerInfo.name && customerInfo.email && customerInfo.phone;
  const canProceedFromMethod = selectedMethodSlug !== null;
  const canSubmit = transactionId.trim().length > 0;

  const handleSubmit = async () => {
    if (!selectedMethodSlug) return;
    
    try {
      const result = await checkout.mutateAsync({
        customerInfo,
        paymentMethod: selectedMethodSlug,
        transactionId: transactionId.trim()
      });
      // Navigate to order confirmation page with order details
      navigate('/order-confirmation', { 
        state: result.orderDetails,
        replace: true 
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/cart">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/cart">
                    <X className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Store Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <h1 className="font-bold text-lg">{STORE_NAME}</h1>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">Support</span>
                        <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">FAQ</span>
                        <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">Details</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary Mini */}
                {step !== 'info' && (
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {cart.length} item{cart.length > 1 ? 's' : ''} • {customerInfo.name}
                      </span>
                      <span className="font-bold text-primary">{formatPrice(totalBDT, totalUSD)}</span>
                    </div>
                  </div>
                )}

                {/* Step: Customer Info */}
                {step === 'info' && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="font-bold text-xl">Your Information</h2>
                      <p className="text-muted-foreground text-sm mt-1">Enter your details to continue</p>
                    </div>
                    
                    <CustomerInfoForm info={customerInfo} onChange={setCustomerInfo} />
                    
                    <Button
                      onClick={() => setStep('method')}
                      disabled={!canProceedFromInfo}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step: Payment Method */}
                {step === 'method' && filteredPaymentMethods && (
                  <div className="space-y-6">
                    <PaymentMethodSelector 
                      methods={filteredPaymentMethods} 
                      selected={selectedMethodSlug} 
                      onSelect={setSelectedMethodSlug} 
                    />
                    
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep('payment')}
                        disabled={!canProceedFromMethod}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Pay {formatPrice(totalBDT, totalUSD)}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step: Payment Instructions */}
                {step === 'payment' && selectedMethod && (
                  <div className="space-y-6">
                    <Button variant="ghost" onClick={() => setStep('method')} className="mb-2">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Change Payment Method
                    </Button>
                    
                    <PaymentInstructions
                      method={selectedMethod}
                      amount={currency === 'BDT' ? totalBDT : totalUSD}
                      transactionId={transactionId}
                      onTransactionIdChange={setTransactionId}
                      storeName={STORE_NAME}
                    />
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || checkout.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {checkout.isPending ? 'Verifying...' : 'VERIFY'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
