
-- Add BDT price columns to products (BDT will be the base price)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_bdt numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_bdt numeric;

-- Add BDT price columns to product_variants
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS price_bdt numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_bdt numeric;

-- Update existing products to have BDT prices (assuming current prices are USD, convert at rate 110)
UPDATE public.products SET 
  price_bdt = price * 110,
  sale_price_bdt = CASE WHEN sale_price IS NOT NULL THEN sale_price * 110 ELSE NULL END
WHERE price_bdt = 0 OR price_bdt IS NULL;

-- Update existing variants to have BDT prices
UPDATE public.product_variants SET 
  price_bdt = price * 110,
  sale_price_bdt = CASE WHEN sale_price IS NOT NULL THEN sale_price * 110 ELSE NULL END
WHERE price_bdt = 0 OR price_bdt IS NULL;

-- Update default currency setting to BDT
UPDATE public.site_settings SET setting_value = 'BDT' WHERE setting_key = 'default_currency';
