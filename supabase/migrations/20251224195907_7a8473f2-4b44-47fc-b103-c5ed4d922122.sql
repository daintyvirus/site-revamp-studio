-- Add currency column to orders to track what currency was used at checkout
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BDT';

-- Add admin_notification_email setting to site_settings
INSERT INTO public.site_settings (setting_key, label, setting_value, category, setting_type, description, sort_order)
VALUES ('admin_notification_email', 'Admin Notification Email', NULL, 'notifications', 'text', 'Email address to receive new order notifications', 1)
ON CONFLICT (setting_key) DO NOTHING;