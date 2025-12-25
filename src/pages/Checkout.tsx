import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowLeft, ArrowRight, Shield, Zap, CreditCard, Ticket, Loader2, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCheckout } from '@/hooks/useCheckout';
import { useActivePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCurrency } from '@/hooks/useCurrency';
import { useValidateCoupon, Coupon } from '@/hooks/useCoupons';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import PaymentInstructions from '@/components/checkout/PaymentInstructions';
import { cn } from '@/lib/utils';

const STORE_NAME = 'GameStore';

type Step = 'info' | 'method' | 'payment';

export default function Checkout() {
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { data: paymentMethods, isLoading: methodsLoading } = useActivePaymentMethods();
  const { currency, formatPrice } = useCurrency();
  const checkout = useCheckout();
  const validateCoupon = useValidateCoupon();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('info');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [selectedMethodSlug, setSelectedMethodSlug] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

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
  const subtotalBDT = cart?.reduce((sum, item) => {
    const priceBDT = item.product?.sale_price_bdt || item.product?.price_bdt || (item.product?.price || 0) * 110;
    return sum + priceBDT * item.quantity;
  }, 0) ?? 0;

  // Calculate total in USD
  const subtotalUSD = cart?.reduce((sum, item) => {
    const priceUSD = item.product?.sale_price || item.product?.price || 0;
    return sum + priceUSD * item.quantity;
  }, 0) ?? 0;

  // Final totals after discount
  const totalBDT = Math.max(0, subtotalBDT - couponDiscount);
  const totalUSD = Math.max(0, subtotalUSD - (couponDiscount / 110)); // Approximate USD discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode,
        orderTotal: subtotalBDT,
      });
      
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setCouponCode('');
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">Sign in to checkout</h1>
              <p className="text-muted-foreground mb-6">You need an account to place orders</p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || methodsLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart?.length) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">Add some items before checking out</p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </div>
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
        transactionId: transactionId.trim(),
        couponCode: appliedCoupon?.code,
        discountAmount: couponDiscount,
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

  const steps = [
    { key: 'info', label: 'Your Info', icon: Shield },
    { key: 'method', label: 'Payment', icon: CreditCard },
    { key: 'payment', label: 'Verify', icon: Zap },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/cart" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cart
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/cart">
                  <X className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  return (
                    <div key={s.key} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                          isActive && "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30",
                          isCompleted && "bg-success/20 text-success border border-success/30",
                          !isActive && !isCompleted && "bg-card border border-border text-muted-foreground"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={cn("text-xs mt-2 font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                          {s.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={cn("h-0.5 flex-1 mx-2 mb-6 transition-colors", isCompleted ? "bg-success" : "bg-border")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
              {/* Store Info Header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-card to-card/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-xl">{STORE_NAME}</h1>
                      <p className="text-sm text-muted-foreground">Secure Checkout</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-success">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">SSL Secured</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Order Summary Mini */}
                {step !== 'info' && (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-6 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            {cart.length} item{cart.length > 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-muted-foreground">{customerInfo.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-xl text-primary">{formatPrice(totalBDT, totalUSD)}</span>
                        {couponDiscount > 0 && (
                          <span className="block text-xs text-success">-৳{couponDiscount} discount</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Customer Info */}
                {step === 'info' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="font-display font-bold text-2xl mb-2">Your Information</h2>
                      <p className="text-muted-foreground">Enter your details to continue</p>
                    </div>
                    
                    <CustomerInfoForm info={customerInfo} onChange={setCustomerInfo} />
                    
                    {/* Coupon Code Section */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Have a coupon code?</span>
                      </div>
                      
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-success" />
                            <div>
                              <code className="font-mono text-sm font-medium">{appliedCoupon.code}</code>
                              <p className="text-xs text-muted-foreground">
                                {appliedCoupon.discount_type === 'percentage' 
                                  ? `${appliedCoupon.discount_value}% off`
                                  : `৳${appliedCoupon.discount_value} off`
                                } - Saving ৳{couponDiscount}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-destructive hover:text-destructive">
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 uppercase"
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || validateCoupon.isPending}
                          >
                            {validateCoupon.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {couponError && (
                        <p className="text-xs text-destructive mt-2">{couponError}</p>
                      )}
                    </div>
                    
                    {/* Order Total */}
                    <div className="bg-card/50 rounded-xl p-4 border border-border space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotalBDT, subtotalUSD)}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-success">
                          <span>Discount ({appliedCoupon?.code})</span>
                          <span>-৳{couponDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="font-medium">Total</span>
                        <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {formatPrice(totalBDT, totalUSD)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setStep('method')}
                      disabled={!canProceedFromInfo}
                      className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-lg"
                      size="lg"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5 ml-2" />
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
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('info')} 
                        className="flex-1 h-12 border-border hover:bg-card/50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep('payment')}
                        disabled={!canProceedFromMethod}
                        className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold"
                      >
                        Pay {formatPrice(totalBDT, totalUSD)}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step: Payment Instructions */}
                {step === 'payment' && selectedMethod && (
                  <div className="space-y-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep('method')} 
                      className="mb-2 text-muted-foreground hover:text-foreground"
                    >
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
                      className="w-full h-14 bg-gradient-to-r from-success to-success/80 hover:opacity-90 font-semibold text-lg"
                      size="lg"
                    >
                      {checkout.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        'VERIFY PAYMENT'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Safe Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}