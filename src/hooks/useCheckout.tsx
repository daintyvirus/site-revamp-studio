import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCart, useClearCart } from './useCart';
import { toast } from '@/hooks/use-toast';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutData {
  customerInfo: CustomerInfo;
  paymentMethod: string;
  transactionId: string;
  notes?: string;
}

export function useCheckout() {
  const { user } = useAuth();
  const { data: cart } = useCart();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerInfo, paymentMethod, transactionId, notes }: CheckoutData) => {
      if (!user || !cart?.length) {
        throw new Error('No items in cart');
      }

      if (!transactionId.trim()) {
        throw new Error('Transaction ID is required');
      }

      const total = cart.reduce((sum, item) => {
        const price = item.product?.sale_price || item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0);

      // Create order with customer info and transaction ID
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          notes,
          payment_method: paymentMethod,
          status: 'pending',
          payment_status: 'pending',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          transaction_id: transactionId
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product?.sale_price || item.product?.price || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart.mutateAsync();

      // Send order confirmation email
      try {
        const orderItems = cart.map(item => ({
          name: item.product?.name || 'Product',
          quantity: item.quantity,
          price: item.product?.sale_price || item.product?.price || 0,
          variant: item.variant?.name
        }));

        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            orderId: order.id,
            orderTotal: total,
            paymentMethod,
            transactionId,
            items: orderItems
          }
        });
        console.log('Order confirmation email sent');
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      return { order, cart };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order placed!',
        description: 'Your payment is being verified. You will receive confirmation soon.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
