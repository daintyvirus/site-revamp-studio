-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public can view images
CREATE POLICY "Product images are viewable by everyone"
ON public.product_images
FOR SELECT
USING (true);

-- Admins can manage images
CREATE POLICY "Admins can insert product images"
ON public.product_images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images"
ON public.product_images
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images"
ON public.product_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- Add low_stock_threshold to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;

-- Insert low stock threshold site setting
INSERT INTO public.site_settings (setting_key, setting_value, label, description, category, setting_type, sort_order)
VALUES ('low_stock_threshold', '5', 'Low Stock Alert Threshold', 'Products with stock at or below this number will show alerts', 'inventory', 'number', 0)
ON CONFLICT (setting_key) DO NOTHING;