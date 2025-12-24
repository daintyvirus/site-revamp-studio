import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCart, useClearCart } from './useCart';
import { toast } from '@/hooks/use-toast';

interface CheckoutData {
  notes?: string;
  paymentMethod: 'whatsapp';
}

export function useCheckout() {
  const { user } = useAuth();
  const { data: cart } = useCart();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notes, paymentMethod }: CheckoutData) => {
      if (!user || !cart?.length) {
        throw new Error('No items in cart');
      }

      const total = cart.reduce((sum, item) => {
        const price = item.product?.sale_price || item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          notes,
          payment_method: paymentMethod,
          status: 'pending',
          payment_status: 'pending'
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

      return { order, cart };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order placed!',
        description: 'Your order has been created successfully.'
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

export function generateWhatsAppMessage(
  cart: Array<{ product?: { name: string; sale_price?: number | null; price: number }; quantity: number }>,
  orderId: string,
  notes?: string
) {
  const items = cart.map(item => 
    `• ${item.product?.name} x${item.quantity} - $${((item.product?.sale_price || item.product?.price || 0) * item.quantity).toFixed(2)}`
  ).join('\n');

  const total = cart.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  let message = `🎮 *New Order* #${orderId.slice(0, 8)}\n\n`;
  message += `*Items:*\n${items}\n\n`;
  message += `*Total:* $${total.toFixed(2)}\n`;
  if (notes) {
    message += `\n*Notes:* ${notes}`;
  }

  return encodeURIComponent(message);
}
