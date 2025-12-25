import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, ShoppingBag, Gift, ChevronDown, ChevronUp, CreditCard, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/types/database';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  processing: 'bg-muted/50 text-foreground border-border/50',
  shipped: 'bg-muted/50 text-foreground border-border/50',
  completed: 'bg-primary/20 text-primary border-primary/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  refunded: 'bg-muted/50 text-muted-foreground border-border/50',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  paid: 'bg-primary/20 text-primary border-primary/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  refunded: 'bg-muted/50 text-muted-foreground border-border/50',
};

const paymentStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  paid: <CheckCircle className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
  refunded: <CreditCard className="h-3 w-3" />,
};

function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `৳${Math.round(Number(amount)).toLocaleString()}`;
}

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-6">Track your order history</p>
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
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!orders?.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">No orders yet</h1>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button asChild className="glow-purple">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const orderCurrency = (order as any).currency || 'BDT';
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Order ID & Date */}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[order.status] || statusColors.pending}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={paymentStatusColors[order.payment_status] || paymentStatusColors.pending}>
                        {paymentStatusIcons[order.payment_status]}
                        <span className="ml-1">{order.payment_status}</span>
                      </Badge>
                    </div>
                    
                    {/* Total & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total ({orderCurrency})</p>
                        <p className="font-bold text-lg text-primary">
                          {formatPrice(order.total, orderCurrency)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => generateInvoicePDF(order)}
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Items Preview */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <div>
                          <span className="text-sm font-medium">{item.product?.name}</span>
                          {item.variant && (
                            <span className="text-xs text-muted-foreground ml-1">({item.variant.name})</span>
                          )}
                          <span className="text-xs text-muted-foreground ml-1">×{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <span className="text-sm text-muted-foreground self-center">
                        +{(order.items?.length ?? 0) - 3} more
                      </span>
                    )}
                  </div>

                  {/* Delivery Button */}
                  {(order as any).delivery_info && order.status === 'completed' && (
                    <Button asChild size="sm" className="mt-2">
                      <Link to={`/orders/${order.id}/delivery`}>
                        <Gift className="h-4 w-4 mr-2" />
                        View Delivery
                      </Link>
                    </Button>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Payment Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                          <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                        </div>
                        {order.transaction_id && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                            <p className="font-mono text-sm text-primary">{order.transaction_id}</p>
                          </div>
                        )}
                      </div>

                      {/* All Items */}
                      <div>
                        <p className="text-sm font-medium mb-2">Order Items</p>
                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                {item.product?.image_url && (
                                  <img src={item.product.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                                )}
                                <div>
                                  <p className="font-medium">{item.product?.name ?? 'Unknown Product'}</p>
                                  {item.variant && (
                                    <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold">{formatPrice(item.price * item.quantity, orderCurrency)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Order Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Order Details Dialog with Timeline */}
      <OrderDetailsDialog
        order={viewingOrder}
        open={!!viewingOrder}
        onOpenChange={() => setViewingOrder(null)}
      />
    </Layout>
  );
}
