-- Add delivery information fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_info TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'code',
ADD COLUMN IF NOT EXISTS delivery_platform TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_email_sent BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.delivery_info IS 'Encrypted delivery content: redeem code, account credentials, or other digital items';
COMMENT ON COLUMN public.orders.delivery_type IS 'Type of delivery: code, account, other';
COMMENT ON COLUMN public.orders.delivery_platform IS 'Platform: steam, playstation, xbox, nintendo, itunes, netflix, roblox, google, razer_gold, discord, chatgpt, other';
COMMENT ON COLUMN public.orders.delivery_instructions IS 'Custom redemption instructions for the customer';

-- Create delivery_logs table to track all delivery attempts
CREATE TABLE IF NOT EXISTS public.delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'sent', 'viewed', 'resent', 'replaced', 'failed'
  delivery_info_snapshot TEXT, -- What was delivered (for audit)
  performed_by UUID, -- Admin who performed action
  customer_ip TEXT, -- IP when customer viewed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on delivery_logs
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery_logs
CREATE POLICY "Admins can view all delivery logs"
  ON public.delivery_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert delivery logs"
  ON public.delivery_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert delivery logs"
  ON public.delivery_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own delivery logs"
  ON public.delivery_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = delivery_logs.order_id
    AND orders.user_id = auth.uid()
  ));

-- Add more customizable fields to email_templates for colors
ALTER TABLE public.email_templates
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#D4AF37',
ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '#1a1a1a',
ADD COLUMN IF NOT EXISTS footer_background_color TEXT DEFAULT '#f9fafb',
ADD COLUMN IF NOT EXISTS refund_policy TEXT DEFAULT 'Refunds are processed within 24-48 hours after verification.',
ADD COLUMN IF NOT EXISTS delivery_disclaimer TEXT DEFAULT 'Digital products are delivered instantly via email and your account dashboard.',
ADD COLUMN IF NOT EXISTS support_hours TEXT DEFAULT '10AM - 2AM Everyday';