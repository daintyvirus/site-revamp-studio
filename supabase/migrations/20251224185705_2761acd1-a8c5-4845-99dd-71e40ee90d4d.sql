
-- Add currency support to payment_methods table
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS available_currencies text[] DEFAULT ARRAY['BDT', 'USD']::text[];

-- Insert currency settings into site_settings if they don't exist
INSERT INTO public.site_settings (setting_key, setting_value, label, description, category, setting_type, sort_order)
VALUES 
  ('usd_to_bdt_rate', '110', 'USD to BDT Rate', 'Exchange rate for converting USD to BDT', 'currency', 'number', 1),
  ('default_currency', 'BDT', 'Default Currency', 'Default currency for the store (BDT or USD)', 'currency', 'text', 2),
  ('show_currency_toggle', 'true', 'Show Currency Toggle', 'Show currency toggle on the site', 'currency', 'boolean', 3)
ON CONFLICT (setting_key) DO NOTHING;
