-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'mobile_banking',
  account_number TEXT NOT NULL,
  account_name TEXT,
  logo_url TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Everyone can view active payment methods
CREATE POLICY "Active payment methods are viewable by everyone"
ON public.payment_methods
FOR SELECT
USING (is_active = true);

-- Admins can view all payment methods
CREATE POLICY "Admins can view all payment methods"
ON public.payment_methods
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert payment methods
CREATE POLICY "Admins can insert payment methods"
ON public.payment_methods
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update payment methods
CREATE POLICY "Admins can update payment methods"
ON public.payment_methods
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete payment methods
CREATE POLICY "Admins can delete payment methods"
ON public.payment_methods
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment methods
INSERT INTO public.payment_methods (name, slug, type, account_number, account_name, instructions, sort_order) VALUES
('bKash Personal', 'bkash', 'mobile_banking', '01XXXXXXXXX', 'Your Name', 'Go to your bKash Mobile App. Choose: Send Money. Enter the number and amount. Enter your bKash PIN to confirm.', 1),
('Nagad Personal', 'nagad', 'mobile_banking', '01XXXXXXXXX', 'Your Name', 'Go to your Nagad Mobile App. Choose: Send Money. Enter the number and amount. Enter your Nagad PIN to confirm.', 2),
('Rocket Personal', 'rocket', 'mobile_banking', '01XXXXXXXXX', 'Your Name', 'Go to your Rocket Mobile App. Choose: Send Money. Enter the number and amount. Enter your Rocket PIN to confirm.', 3),
('Upay Personal', 'upay', 'mobile_banking', '01XXXXXXXXX', 'Your Name', 'Go to your Upay Mobile App. Choose: Send Money. Enter the number and amount. Enter your Upay PIN to confirm.', 4);