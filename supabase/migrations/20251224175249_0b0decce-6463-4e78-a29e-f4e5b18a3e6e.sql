-- Create site_settings table for managing all site-wide configurations
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'text', -- text, json, boolean, number
  category text NOT NULL DEFAULT 'general', -- general, branding, contact, social, footer, navigation
  label text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view site settings (needed for frontend)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label, description, sort_order) VALUES
-- Branding
('site_name', 'GOLDEN BUMPS', 'text', 'branding', 'Site Name', 'The name of your website', 1),
('site_tagline', 'Your trusted source for digital gaming products, gift cards, and game top-ups.', 'text', 'branding', 'Tagline', 'Short description shown in footer', 2),
('logo_url', '', 'text', 'branding', 'Logo URL', 'URL to your site logo image', 3),
('favicon_url', '', 'text', 'branding', 'Favicon URL', 'URL to your favicon', 4),

-- Contact
('contact_email', 'support@goldenbumps.com', 'text', 'contact', 'Support Email', 'Main support email address', 1),
('contact_phone', '+1 (555) 123-4567', 'text', 'contact', 'Phone Number', 'Contact phone number', 2),
('contact_address', 'Available Worldwide', 'text', 'contact', 'Address', 'Physical or virtual address', 3),
('support_hours', '10AM - 2AM Everyday', 'text', 'contact', 'Support Hours', 'Customer support availability', 4),

-- Social Links (JSON)
('social_facebook', '', 'text', 'social', 'Facebook URL', 'Your Facebook page URL', 1),
('social_twitter', '', 'text', 'social', 'Twitter/X URL', 'Your Twitter/X profile URL', 2),
('social_instagram', '', 'text', 'social', 'Instagram URL', 'Your Instagram profile URL', 3),
('social_discord', '', 'text', 'social', 'Discord URL', 'Your Discord server invite URL', 4),
('social_youtube', '', 'text', 'social', 'YouTube URL', 'Your YouTube channel URL', 5),
('social_tiktok', '', 'text', 'social', 'TikTok URL', 'Your TikTok profile URL', 6),

-- Footer
('footer_copyright', '© {year} GoldenBumps. All rights reserved.', 'text', 'footer', 'Copyright Text', 'Copyright notice (use {year} for current year)', 1),
('footer_disclaimer', 'Digital products are non-refundable once the code has been revealed.', 'text', 'footer', 'Refund Disclaimer', 'Refund policy disclaimer', 2);

-- Create brands admin table enhancement (add description field if missing)
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS description text;