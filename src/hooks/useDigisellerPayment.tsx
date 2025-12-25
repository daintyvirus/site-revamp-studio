import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCart, useClearCart } from './useCart';
import { useCurrency } from './useCurrency';
import { toast } from '@/hooks/use-toast';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface DigisellerPaymentData {
  customerInfo: CustomerInfo;
  notes?: string;
}

export function useDigisellerPayment() {
  const { user } = useAuth();
  const { data: cart } = useCart();
  const { currency, formatPriceValue } = useCurrency();
  const clearCart = useClearCart();

  return useMutation({
    mutationFn: async (data: DigisellerPaymentData) => {
      if (!user || !cart?.length) {
        throw new Error('No items in cart');
      }

      const { customerInfo, notes } = data;

      // Calculate total in USD for Digiseller (they primarily use USD)
      const totalUSD = cart.reduce((sum, item) => {
        const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
        return sum + priceUSD * item.quantity;
      }, 0);

      // Calculate total in current currency for display
      const total = cart.reduce((sum, item) => {
        const priceBDT = item.variant?.sale_price_bdt || item.variant?.price_bdt || item.product?.sale_price_bdt || item.product?.price_bdt || 0;
        const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
        const price = formatPriceValue(priceBDT, priceUSD);
        return sum + price * item.quantity;
      }, 0);

      // Create order first with pending payment status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          notes,
          payment_method: 'digiseller',
          status: 'pending',
          payment_status: 'pending',
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          currency: currency
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => {
        const priceBDT = item.variant?.sale_price_bdt || item.variant?.price_bdt || item.product?.sale_price_bdt || item.product?.price_bdt || 0;
        const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
        return {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: formatPriceValue(priceBDT, priceUSD)
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Check if we have a single product with a Digiseller ID for product-based checkout
      let digisellerId: number | undefined;
      let totalQuantity = 1;

      if (cart.length === 1) {
        const item = cart[0];
        // Check variant first, then product for digiseller_id
        const variantDigisellerId = (item.variant as any)?.digiseller_id;
        const productDigisellerId = (item.product as any)?.digiseller_id;
        
        digisellerId = variantDigisellerId || productDigisellerId;
        totalQuantity = item.quantity;
      }

      // Generate product name for Digiseller
      const productName = cart.length === 1 
        ? cart[0].product?.name || 'Order'
        : `Order with ${cart.length} items`;

      // Get the base URL for callbacks
      const baseUrl = window.location.origin;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Call edge function to generate Digiseller payment URL
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('digiseller-payment', {
        body: {
          orderId: order.id,
          amount: totalUSD, // Digiseller uses USD
          currency: 'USD',
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          productName,
          returnUrl: `${supabaseUrl}/functions/v1/digiseller-webhook?order_id=${order.id}`,
          failUrl: `${baseUrl}/order-confirmation?orderId=${order.id}&status=failed`,
          // Product-based checkout fields
          digisellerId,
          quantity: totalQuantity
        }
      });

      if (paymentError) {
        // Cancel the order if payment URL generation fails
        await supabase.from('orders').update({ 
          status: 'cancelled',
          payment_status: 'failed'
        }).eq('id', order.id);
        throw paymentError;
      }

      // Clear cart before redirecting
      await clearCart.mutateAsync();

      return {
        order,
        paymentUrl: paymentData.paymentUrl,
        orderId: order.id
      };
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
