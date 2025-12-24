-- Add more customizable fields to email_templates
ALTER TABLE public.email_templates
ADD COLUMN IF NOT EXISTS greeting_format text DEFAULT 'Dear {customer_name},' NOT NULL,
ADD COLUMN IF NOT EXISTS closing_text text DEFAULT 'Best regards,' NOT NULL,
ADD COLUMN IF NOT EXISTS signature_name text DEFAULT '{company_name}' NOT NULL,
ADD COLUMN IF NOT EXISTS order_id_label text DEFAULT 'Order ID:' NOT NULL,
ADD COLUMN IF NOT EXISTS order_total_label text DEFAULT 'Order Total:' NOT NULL,
ADD COLUMN IF NOT EXISTS status_label text DEFAULT 'Status:' NOT NULL;