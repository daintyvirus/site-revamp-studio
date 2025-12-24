import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminOrders, useUpdateOrderStatus, useUpdatePaymentStatus } from '@/hooks/useOrders';
import type { Order } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  processing: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-600 border-green-500/30',
  failed: 'bg-red-500/20 text-red-600 border-red-500/30',
  refunded: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
};

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const sendPaymentNotification = async (order: Order, paymentStatus: string) => {
    if (!order.customer_email) {
      console.log('No customer email, skipping notification');
      return;
    }

    try {
      setSendingNotification(true);
      const { data, error } = await supabase.functions.invoke('send-payment-notification', {
        body: {
          customerEmail: order.customer_email,
          customerName: order.customer_name || 'Valued Customer',
          orderId: order.id,
          orderTotal: order.total,
          paymentStatus: paymentStatus,
        },
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('Failed to send email notification');
      } else {
        console.log('Notification sent:', data);
        toast.success('Email notification sent to customer');
      }
    } catch (error) {
      console.error('Error invoking notification function:', error);
    } finally {
      setSendingNotification(false);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ orderId, paymentStatus });
      // Update selected order state if it's open
      if (selectedOrder?.id === orderId) {
        const updatedOrder = { ...selectedOrder, payment_status: paymentStatus };
        setSelectedOrder(updatedOrder);
        
        // Send email notification when payment is verified
        if (paymentStatus === 'paid' || paymentStatus === 'failed') {
          await sendPaymentNotification(updatedOrder, paymentStatus);
        }
      }
      toast.success(`Payment marked as ${paymentStatus}`);
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{order.items?.length ?? 0} items</TableCell>
                    <TableCell className="font-bold">${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={statusColors[order.status] ?? 'secondary'}>
                            {order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[order.payment_status] || paymentStatusColors.pending}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              {(selectedOrder.customer_name || selectedOrder.customer_phone || selectedOrder.customer_email) && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-sm">Customer Info</p>
                  {selectedOrder.customer_name && <p className="text-sm">{selectedOrder.customer_name}</p>}
                  {selectedOrder.customer_email && <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>}
                  {selectedOrder.customer_phone && <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedOrder.created_at), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <Badge className={paymentStatusColors[selectedOrder.payment_status] || paymentStatusColors.pending}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
                {selectedOrder.payment_method && (
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="capitalize">{selectedOrder.payment_method}</p>
                  </div>
                )}
                {selectedOrder.transaction_id && (
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded inline-block">
                      {selectedOrder.transaction_id}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-semibold mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product?.name ?? 'Unknown'} × {item.quantity}</span>
                      <span>${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${Number(selectedOrder.total).toFixed(2)}</span>
              </div>

              {selectedOrder.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Payment Verification Actions */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold mb-3">Payment Verification</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedOrder.payment_status === 'paid' ? 'default' : 'outline'}
                    className={selectedOrder.payment_status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, 'paid')}
                    disabled={updatePaymentStatus.isPending || sendingNotification}
                  >
                    {sendingNotification ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Verified / Paid
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.payment_status === 'pending' ? 'default' : 'outline'}
                    className={selectedOrder.payment_status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, 'pending')}
                    disabled={updatePaymentStatus.isPending || sendingNotification}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.payment_status === 'failed' ? 'destructive' : 'outline'}
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, 'failed')}
                    disabled={updatePaymentStatus.isPending || sendingNotification}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Failed
                  </Button>
                </div>
                {selectedOrder.customer_email && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Email notification will be sent to {selectedOrder.customer_email}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
