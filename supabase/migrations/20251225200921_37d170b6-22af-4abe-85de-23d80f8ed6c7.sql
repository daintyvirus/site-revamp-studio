-- Add delivery_time column to products table for estimated delivery time display
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS delivery_time text DEFAULT 'Instant Delivery';

COMMENT ON COLUMN public.products.delivery_time IS 'Estimated delivery time shown to customers (e.g., Instant Delivery, 1-2 Hours, etc.)';