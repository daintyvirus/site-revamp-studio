import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Search, CheckCircle, Clock, Truck, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderData {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string | null;
    } | null;
  }[];
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: MapPin },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Try to find order by full ID or partial ID
      const searchId = orderId.trim().toUpperCase();
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          payment_status,
          total,
          created_at,
          updated_at,
          customer_name,
          items:order_items(
            id,
            quantity,
            price,
            product:products(name, image_url)
          )
        `)
        .or(`id.eq.${searchId},id.ilike.${searchId}%`)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to fetch order');
        setOrder(null);
      } else if (data) {
        setOrder(data);
        // Update URL with order ID
        navigate(`/track-order?id=${data.id.slice(0, 8)}`, { replace: true });
      } else {
        setOrder(null);
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index === -1 ? 0 : index;
  };

  return (
    <Layout>
      <Helmet>
        <title>Track Your Order | Golden Bumps</title>
        <meta name="description" content="Track your Golden Bumps order status in real-time. Enter your order ID to see shipping updates and delivery information." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order ID to view the current status of your order
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter Order ID (e.g., A1B2C3D4)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="pl-12 h-12 text-lg bg-muted/50 border-border/50 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={loading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
              >
                {loading ? 'Searching...' : 'Track'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              You can find your order ID in your order confirmation email or in your order history.
            </p>
          </div>

          {/* Order Not Found */}
          {searched && !order && !loading && (
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 border-dashed p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Order Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find an order with ID "{orderId}". Please check your order ID and try again.
                </p>
                <Button asChild variant="outline" className="border-border/50">
                  <Link to="/profile">View My Orders</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Order Found */}
          {order && (
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <h2 className="font-display text-xl font-bold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[order.status] || statusColors.pending}>
                        {order.status === 'completed' ? 'Delivered' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={paymentStatusColors[order.payment_status] || paymentStatusColors.pending}>
                        {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Progress Tracker */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-8">
                      <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%` 
                            }}
                          />
                        </div>

                        {/* Steps */}
                        <div className="relative flex justify-between">
                          {statusSteps.map((step, index) => {
                            const isCompleted = index <= getCurrentStepIndex(order.status);
                            const isCurrent = index === getCurrentStepIndex(order.status);
                            const Icon = step.icon;

                            return (
                              <div key={step.key} className="flex flex-col items-center">
                                <div 
                                  className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                    ${isCompleted 
                                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' 
                                      : 'bg-muted text-muted-foreground'
                                    }
                                    ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}
                                  `}
                                >
                                  {isCompleted && index < getCurrentStepIndex(order.status) ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <Icon className="h-5 w-5" />
                                  )}
                                </div>
                                <span className={`
                                  mt-2 text-xs font-medium text-center
                                  ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                                `}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Status */}
                  {order.status === 'cancelled' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="font-semibold text-red-400">Order Cancelled</p>
                          <p className="text-sm text-muted-foreground">
                            This order has been cancelled. Please contact support if you have questions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border-t border-border/50 pt-6">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                            {item.product?.image_url ? (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            ৳{Number(item.price).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ৳{Number(order.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you have any questions about your order, feel free to reach out to our support team.
                    </p>
                    <Button variant="outline" size="sm" asChild className="border-border/50">
                      <a href="mailto:support@goldenbumps.com">Contact Support</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
