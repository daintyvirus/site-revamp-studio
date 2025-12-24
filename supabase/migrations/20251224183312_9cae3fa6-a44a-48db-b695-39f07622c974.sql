-- Add flash sale fields to products
ALTER TABLE public.products
ADD COLUMN flash_sale_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN sale_end_date TIMESTAMP WITH TIME ZONE;