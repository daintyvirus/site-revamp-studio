import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Clock, Mail, ArrowRight, Home, ShoppingBag, Copy, Check, XCircle, Loader2, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderDetails {
  orderId: string;
  total: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export default function OrderConfirmation() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderDetailsFromState = location.state as OrderDetails | null;
  const [copied, setCopied] = useState(false);

  // Get orderId and status from URL params (for callback)
  const orderIdFromUrl = searchParams.get('orderId');
  const statusFromUrl = searchParams.get('status');
  const isFromCallback = !!orderIdFromUrl;
  const isPaymentFailed = statusFromUrl === 'failed';

  // Fetch order details if coming from callback
  const { data: fetchedOrder, isLoading } = useQuery({
    queryKey: ['order', orderIdFromUrl],
    queryFn: async () => {
      if (!orderIdFromUrl) return null;
      
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name),
            variant:product_variants (name)
          )
        `)
        .eq('id', orderIdFromUrl)
        .single();

      if (error) throw error;
      return order;
    },
    enabled: !!orderIdFromUrl
  });

  // Construct order details from fetched data
  const orderDetails: OrderDetails | null = orderDetailsFromState || (fetchedOrder ? {
    orderId: fetchedOrder.id,
    total: fetchedOrder.total,
    currency: fetchedOrder.currency || 'USD',
    paymentMethod: fetchedOrder.payment_method || 'manual',
    transactionId: fetchedOrder.transaction_id || 'Pending',
    customerName: fetchedOrder.customer_name || 'Customer',
    customerEmail: fetchedOrder.customer_email || '',
    items: fetchedOrder.order_items?.map((item: any) => ({
      name: item.product?.name || 'Product',
      quantity: item.quantity,
      price: item.price,
      variant: item.variant?.name
    })) || []
  } : null);

  useEffect(() => {
    // Trigger confetti on mount only for successful payments
    if (isPaymentFailed) return;
    
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4AF37', '#22c55e', '#ec4899']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4AF37', '#22c55e', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isPaymentFailed]);

  const copyOrderId = () => {
    const id = orderDetails?.orderId || orderIdFromUrl;
    if (id) {
      navigator.clipboard.writeText(id.slice(0, 8).toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `৳${Math.round(amount).toLocaleString()}`;
  };

  // Loading state for callback
  if (isFromCallback && isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Payment failed state
  if (isPaymentFailed) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 max-w-md"
          >
            <div className="w-24 h-24 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2 text-red-500">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">
              Your payment could not be processed. Please try again or choose a different payment method.
            </p>
            {orderIdFromUrl && (
              <p className="text-sm text-muted-foreground mb-4">
                Order ID: <span className="font-mono text-foreground">{orderIdFromUrl.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline" className="border-border/50">
                <Link to="/profile">View Orders</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/checkout">Try Again</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // If no order details, show generic success
  if (!orderDetails) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-6">Thank you for your order</p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline" className="border-border/50">
                <Link to="/profile">View Orders</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] py-8 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Order Placed Successfully!
              </span>
            </h1>
            <p className="text-muted-foreground">
              Thank you, {orderDetails.customerName}! Your order is being processed.
            </p>
          </motion.div>

          {/* Order Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg">
                      #{orderDetails.orderId.slice(0, 8).toUpperCase()}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50" onClick={copyOrderId}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {isFromCallback && statusFromUrl === 'success' ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Payment Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Timeline */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-green-400">
                  <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">Placed</span>
                </div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-yellow-500" />
                <div className="flex items-center gap-1 text-yellow-400">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">Verifying</span>
                </div>
                <div className="w-8 h-0.5 bg-muted" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">Delivery</span>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-xl p-4 border border-border/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {formatPrice(item.price * item.quantity, orderDetails.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Payment Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium capitalize">{orderDetails.paymentMethod}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                  <p className="font-mono font-medium text-primary">{orderDetails.transactionId}</p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total Amount ({orderDetails.currency})</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatPrice(orderDetails.total, orderDetails.currency)}
                  </span>
                </div>
              </div>

              {/* Email Notice */}
              <div className="flex items-start gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-400">Confirmation Email Sent</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent order details to <strong className="text-foreground">{orderDetails.customerEmail}</strong>. 
                    You'll receive another email once your payment is verified.
                  </p>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">What's Next?</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Our team will verify your payment within 30 minutes</li>
                  <li>You'll receive an email confirmation once verified</li>
                  <li>Your digital product will be delivered to your account</li>
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1 border-border/50 hover:bg-muted/50">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/profile">
                  View My Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
