import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCart, useClearCart } from './useCart';
import { useCurrency } from './useCurrency';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schema for checkout data
const customerInfoSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 characters')
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[0-9+\s()-]+$/, 'Phone contains invalid characters')
});

const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transactionId: z.string()
    .min(5, 'Transaction ID must be at least 5 characters')
    .max(50, 'Transaction ID must be less than 50 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Transaction ID contains invalid characters'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

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
  const { currency, formatPriceValue } = useCurrency();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckoutData) => {
      if (!user || !cart?.length) {
        throw new Error('No items in cart');
      }

      // Validate all input data with Zod
      const validationResult = checkoutSchema.safeParse(data);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        throw new Error(firstError.message);
      }

      const { customerInfo, paymentMethod, transactionId, notes } = validationResult.data;

      // Calculate total based on current currency
      const total = cart.reduce((sum, item) => {
        const priceBDT = item.variant?.sale_price_bdt || item.variant?.price_bdt || item.product?.sale_price_bdt || item.product?.price_bdt || 0;
        const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
        const price = formatPriceValue(priceBDT, priceUSD);
        return sum + price * item.quantity;
      }, 0);

      // Create order with customer info, transaction ID, and currency
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
          transaction_id: transactionId,
          currency: currency
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with price in the selected currency
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

      // Clear cart
      await clearCart.mutateAsync();

      // Send order confirmation email
      try {
        const emailItems = cart.map(item => {
          const priceBDT = item.variant?.sale_price_bdt || item.variant?.price_bdt || item.product?.sale_price_bdt || item.product?.price_bdt || 0;
          const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
          return {
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: formatPriceValue(priceBDT, priceUSD),
            variant: item.variant?.name
          };
        });

        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            orderId: order.id,
            orderTotal: total,
            currency: currency,
            paymentMethod,
            transactionId,
            items: emailItems
          }
        });
        console.log('Order confirmation email sent');
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      // Send admin notification email
      try {
        const adminItems = cart.map(item => {
          const priceBDT = item.variant?.sale_price_bdt || item.variant?.price_bdt || item.product?.sale_price_bdt || item.product?.price_bdt || 0;
          const priceUSD = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
          return {
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: formatPriceValue(priceBDT, priceUSD),
            variant: item.variant?.name
          };
        });

        await supabase.functions.invoke('send-admin-order-notification', {
          body: {
            orderId: order.id,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            orderTotal: total,
            currency: currency,
            paymentMethod,
            transactionId,
            items: adminItems
          }
        });
        console.log('Admin order notification sent');
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError);
        // Don't fail the order if admin email fails
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
