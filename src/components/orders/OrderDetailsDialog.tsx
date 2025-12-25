import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, Package, CreditCard, User, Phone, AtSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@/types/database';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import OrderTimeline from './OrderTimeline';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAdminActions?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  refunded: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
            <div className="flex gap-2">
              <Badge className={statusColors[order.status]}>
                {order.status}
              </Badge>
              <Badge className={paymentStatusColors[order.payment_status]}>
                {order.payment_status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Customer Details</h4>
              <div className="space-y-1">
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
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Payment Details</h4>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {order.payment_method || 'N/A'}
                </p>
                {order.transaction_id && (
                  <p className="text-sm text-muted-foreground">
                    TXN: {order.transaction_id}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Placed: {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.product?.name || 'Unknown Product'}
                    </p>
                    {item.variant?.name && (
                      <p className="text-xs text-muted-foreground">
                        Variant: {item.variant.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.price, orderCurrency)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity, orderCurrency)}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="font-semibold">Total ({orderCurrency})</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(order.total, orderCurrency)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Order Timeline */}
          <OrderTimeline 
            orderId={order.id}
            orderCreatedAt={order.created_at}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            {showAdminActions && order.status === 'completed' && (
              <Button 
                variant="outline" 
                onClick={handleSendInvoiceEmail}
                disabled={sendingEmail || !order.customer_email}
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingEmail ? 'Sending...' : 'Send Invoice Email'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
