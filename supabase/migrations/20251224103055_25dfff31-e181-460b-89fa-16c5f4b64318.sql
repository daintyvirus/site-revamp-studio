-- Add customer info and transaction fields to orders
ALTER TABLE public.orders
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN transaction_id TEXT;