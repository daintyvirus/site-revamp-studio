import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, Package, CreditCard, User, Phone, AtSign, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@/types/database';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import OrderTimeline from './OrderTimeline';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAdminActions?: boolean;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-primary/20 text-primary border-primary/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

const paymentStatusStyles: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  paid: 'bg-primary/20 text-primary border-primary/30',
  refunded: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
};

function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `৳${Math.round(Number(amount)).toLocaleString()}`;
}

export default function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange,
  showAdminActions = false 
}: OrderDetailsDialogProps) {
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!order) return null;

  const orderCurrency = (order as any).currency || 'BDT';
  const isCompleted = order.status === 'completed';
  const isDelivered = (order as any).delivery_info;

  const handleDownloadInvoice = () => {
    generateInvoicePDF(order);
  };

  const handleSendInvoiceEmail = async () => {
    if (!order.customer_email) {
      toast({
        title: 'No email address',
        description: 'This order does not have a customer email.',
        variant: 'destructive'
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { orderId: order.id }
      });

      if (error) throw error;

      toast({
        title: 'Invoice sent',
        description: `Invoice email sent to ${order.customer_email}`,
      });
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      toast({
        title: 'Failed to send invoice',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Order Details</DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Success Banner */}
          {isCompleted && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">COMPLETED</Badge>
                <h2 className="font-display text-2xl font-bold mb-1">Your order has been delivered</h2>
                <p className="text-muted-foreground">All set! Your order is complete and your items have been delivered. Enjoy!</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">Order items</h3>
                <p className="text-sm text-muted-foreground mb-4">Everything included in this order, along with delivery status and redemption info.</p>
              </div>

              {/* Product Cards */}
              {order.items?.map((item, idx) => (
                <div key={idx} className="bg-muted/30 rounded-2xl p-6 space-y-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-lg mb-1">{item.product?.name}</h4>
                      
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ABOUT THIS ITEM</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.product?.short_description || item.product?.description || 'Digital product ready for instant delivery.'}
                        </p>
                      </div>

                      {item.variant?.name && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Variant: <span className="text-foreground">{item.variant.name}</span>
                        </p>
                      )}

                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">DELIVERY STATUS</p>
                        <Badge className={cn(
                          "text-sm px-4 py-1",
                          isDelivered ? "bg-primary text-primary-foreground" : "bg-warning/20 text-warning border-warning/30"
                        )}>
                          {isDelivered ? 'DELIVERED' : 'PENDING'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* How to Redeem */}
                  {isCompleted && (
                    <div className="bg-background/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">HOW TO REDEEM</p>
                          <p className="text-xs text-muted-foreground">Follow these instructions to redeem your purchase without a hitch.</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        VIEW STEPS
                      </Button>
                    </div>
                  )}

                  {/* Item Price Details */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Qty</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(item.price * item.quantity, orderCurrency)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Total */}
              <div className="flex justify-between items-center py-4 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order.total, orderCurrency)}</span>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="font-display font-semibold mb-1">Order summary</h4>
                  <p className="text-xs text-muted-foreground">Quick reference details, amounts, and payment status.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER ID</p>
                    <p className="font-mono font-semibold">KM/ORDER-{order.id.slice(0, 6).toUpperCase()}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER STATUS</p>
                    <Badge className={cn("mt-1", statusStyles[order.status])}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER DATE</p>
                    <p className="font-medium">{format(new Date(order.created_at), 'MMM dd, yyyy, h:mm:ss a')}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PAYMENT STATUS</p>
                    <Badge className={cn("mt-1", paymentStatusStyles[order.payment_status])}>
                      {order.payment_status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PAYMENT METHOD</p>
                    <p className="font-medium uppercase">{order.payment_method || 'N/A'}</p>
                  </div>

                  {order.transaction_id && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">TRANSACTION ID</p>
                      <p className="font-mono text-sm text-primary break-all">{order.transaction_id}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(order.total, orderCurrency)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
                <h4 className="font-semibold text-sm">Customer Details</h4>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.customer_name || 'N/A'}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    {order.customer_email || 'N/A'}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.customer_phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                {showAdminActions && order.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSendInvoiceEmail}
                    disabled={sendingEmail || !order.customer_email}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {sendingEmail ? 'Sending...' : 'Send Invoice Email'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="pt-4">
            <OrderTimeline 
              orderId={order.id}
              orderCreatedAt={order.created_at}
              currentStatus={order.status}
              currentPaymentStatus={order.payment_status}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
