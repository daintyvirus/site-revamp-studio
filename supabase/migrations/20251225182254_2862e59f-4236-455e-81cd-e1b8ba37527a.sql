-- Add digiseller_id column to products table for product-based checkout
ALTER TABLE public.products 
ADD COLUMN digiseller_id integer NULL;

-- Add digiseller_id column to product_variants table as well
ALTER TABLE public.product_variants 
ADD COLUMN digiseller_id integer NULL;

-- Add index for faster lookups
CREATE INDEX idx_products_digiseller_id ON public.products(digiseller_id) WHERE digiseller_id IS NOT NULL;
CREATE INDEX idx_product_variants_digiseller_id ON public.product_variants(digiseller_id) WHERE digiseller_id IS NOT NULL;

COMMENT ON COLUMN public.products.digiseller_id IS 'Digiseller product ID for product-based checkout';
COMMENT ON COLUMN public.product_variants.digiseller_id IS 'Digiseller product ID for variant-based checkout';