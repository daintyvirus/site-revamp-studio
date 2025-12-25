-- Create coupons table for discount codes
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Active coupons viewable by authenticated users" ON public.coupons
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Coupon usage policies
CREATE POLICY "Admins can view all coupon usage" ON public.coupon_usage
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add coupon_code to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Create trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount - 10% off your first order', 'percentage', 10, 100, true),
  ('SAVE50', 'Save ৳50 on orders over ৳500', 'fixed', 50, 500, true);