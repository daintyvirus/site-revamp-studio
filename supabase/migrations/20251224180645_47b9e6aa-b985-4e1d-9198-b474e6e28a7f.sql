-- Create navigation_menu table for managing nav links
CREATE TABLE public.navigation_menu (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES public.navigation_menu(id) ON DELETE CASCADE,
  location TEXT NOT NULL DEFAULT 'header', -- header, footer_quick_links, footer_support
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homepage_sections table for managing homepage content
CREATE TABLE public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE, -- hero, categories, featured, brands
  title TEXT,
  subtitle TEXT,
  badge_text TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  extra_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Navigation menu policies
CREATE POLICY "Navigation menu viewable by everyone" 
ON public.navigation_menu 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage navigation menu" 
ON public.navigation_menu 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Homepage sections policies
CREATE POLICY "Homepage sections viewable by everyone" 
ON public.homepage_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage homepage sections" 
ON public.homepage_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_navigation_menu_updated_at
BEFORE UPDATE ON public.navigation_menu
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default navigation menu items
INSERT INTO public.navigation_menu (title, url, location, sort_order) VALUES
('Shop', '/shop', 'header', 1),
('Gift Cards', '/shop?category=gift-cards', 'header', 2),
('Top-Ups', '/shop?category=top-ups', 'header', 3),
('Shop', '/shop', 'footer_quick_links', 1),
('Gift Cards', '/shop?category=gift-cards', 'footer_quick_links', 2),
('Game Top-Ups', '/shop?category=top-ups', 'footer_quick_links', 3),
('Subscriptions', '/shop?category=subscriptions', 'footer_quick_links', 4),
('FAQ', '/faq', 'footer_support', 1),
('Contact Us', '/contact', 'footer_support', 2),
('Terms of Service', '/terms', 'footer_support', 3),
('Privacy Policy', '/privacy', 'footer_support', 4);

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, badge_text, description, button_text, button_url, secondary_button_text, secondary_button_url, sort_order, extra_data) VALUES
('hero', 'LEVEL UP YOUR GAMING EXPERIENCE', NULL, 'Instant Digital Delivery', 'Get instant access to gift cards, game top-ups, subscriptions, and premium gaming accounts. Fast, secure, and reliable.', 'Shop Now', '/shop', 'Browse Gift Cards', '/shop?category=gift-cards', 1, '{"title_words": ["LEVEL", "UP", "YOUR"], "gradient_words": ["GAMING", "EXPERIENCE"], "stats": [{"label": "Products", "value": "10K+"}, {"label": "Happy Gamers", "value": "50K+"}, {"label": "Support", "value": "24/7"}]}'),
('categories', 'Browse by Category', NULL, 'Categories', 'Find exactly what you''re looking for in our extensive catalog', NULL, NULL, NULL, NULL, 2, '{}'),
('featured', 'Featured Products', NULL, 'Curated Selection', 'Top picks handpicked for gamers like you', NULL, NULL, NULL, NULL, 3, '{}'),
('brands', 'Trusted Brands', NULL, NULL, 'Official digital products from top gaming brands worldwide', NULL, NULL, NULL, NULL, 4, '{}');

-- Add SEO settings to site_settings if not exists
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label, description, sort_order) VALUES
('seo_title', 'GoldenBumps - Online Gaming Store | Gift Cards, Top-Ups & More', 'text', 'seo', 'SEO Title', 'Main page title for search engines', 1),
('seo_description', 'Your trusted source for digital gaming products. Buy gift cards, game top-ups, subscriptions, and gaming accounts with instant delivery.', 'textarea', 'seo', 'SEO Description', 'Meta description for search engines', 2)
ON CONFLICT (setting_key) DO NOTHING;