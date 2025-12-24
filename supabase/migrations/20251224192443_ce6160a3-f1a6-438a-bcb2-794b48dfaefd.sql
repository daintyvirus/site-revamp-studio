-- Add SKU and Tags fields to products table for WooCommerce compatibility
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS wc_id integer;

-- Add index on SKU for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Add index on wc_id for import/export matching
CREATE INDEX IF NOT EXISTS idx_products_wc_id ON public.products(wc_id);

-- Add wc_parent_id to product_variants for WooCommerce mapping
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS wc_id integer,
ADD COLUMN IF NOT EXISTS sku text;