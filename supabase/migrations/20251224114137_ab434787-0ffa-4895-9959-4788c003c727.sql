-- Create email templates table for full customization
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status_type TEXT NOT NULL UNIQUE,
  sender_email TEXT NOT NULL DEFAULT 'support@goldenbumps.com',
  sender_name TEXT NOT NULL DEFAULT 'Golden Bumps',
  subject_template TEXT NOT NULL,
  header_title TEXT NOT NULL,
  header_color TEXT NOT NULL DEFAULT '#8B5CF6',
  body_intro TEXT NOT NULL,
  body_content TEXT,
  show_order_details BOOLEAN NOT NULL DEFAULT true,
  show_tracking_button BOOLEAN NOT NULL DEFAULT true,
  tracking_button_text TEXT DEFAULT 'Track Your Order',
  footer_text TEXT DEFAULT 'This is an automated message from Golden Bumps.',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can view all email templates
CREATE POLICY "Admins can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert email templates
CREATE POLICY "Admins can insert email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update email templates
CREATE POLICY "Admins can update email templates" 
ON public.email_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete email templates
CREATE POLICY "Admins can delete email templates" 
ON public.email_templates 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates for all status types
INSERT INTO public.email_templates (status_type, subject_template, header_title, header_color, body_intro, body_content, show_tracking_button, tracking_button_text) VALUES
('order_confirmation', 'Order Confirmed - #{ORDER_ID} | Golden Bumps', '🎉 Order Confirmed!', '#8B5CF6', 'Thank you for your order! We have received your order and will process it shortly.', 'Please complete your payment using the payment method you selected. Once we verify your payment, we will start processing your order.', true, 'Track Your Order'),
('payment_paid', 'Payment Verified - #{ORDER_ID} | Golden Bumps', '✅ Payment Verified', '#10B981', 'Great news! Your payment has been verified and your order is now being processed.', 'We will notify you once your order has been shipped. Thank you for shopping with us!', true, 'Track Your Order'),
('payment_failed', 'Payment Issue - #{ORDER_ID} | Golden Bumps', '❌ Payment Issue', '#EF4444', 'Unfortunately, we were unable to verify your payment for this order.', 'Please contact our support team or try making the payment again. If you believe this is an error, please reach out to us.', true, 'View Order Details'),
('shipping', 'Your Order is On Its Way! - #{ORDER_ID} | Golden Bumps', '🚚 Order Shipped!', '#3B82F6', 'Great news! Your order has been shipped and is on its way to you.', 'You can track your order using the button below. Estimated delivery time is 3-5 business days.', true, 'Track Your Order'),
('delivery', 'Order Delivered - #{ORDER_ID} | Golden Bumps', '📦 Order Delivered!', '#10B981', 'Your order has been successfully delivered!', 'We hope you love your purchase! If you have any questions or concerns, please don''t hesitate to contact us.', true, 'View Order Details'),
('cancelled', 'Order Cancelled - #{ORDER_ID} | Golden Bumps', '❌ Order Cancelled', '#EF4444', 'Your order has been cancelled as requested.', 'If you did not request this cancellation or have any questions, please contact our support team immediately.', true, 'View Order Details'),
('refunded', 'Refund Processed - #{ORDER_ID} | Golden Bumps', '💸 Refund Processed', '#8B5CF6', 'Good news! We have processed your refund for your order.', 'The funds should be returned to your original payment method within 3-7 business days.', true, 'View Order Details')
ON CONFLICT (status_type) DO NOTHING;