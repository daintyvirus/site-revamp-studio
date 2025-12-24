-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  product_name TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotional banners table
CREATE TABLE public.promotional_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  link_url TEXT,
  background_color TEXT DEFAULT '#D4AF37',
  text_color TEXT DEFAULT '#1a1a1a',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Testimonials policies
CREATE POLICY "Testimonials viewable by everyone" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Promotional banners policies
CREATE POLICY "Active banners viewable by everyone" ON public.promotional_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promotional banners" ON public.promotional_banners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotional_banners_updated_at BEFORE UPDATE ON public.promotional_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.testimonials (customer_name, rating, review_text, product_name, is_featured, sort_order) VALUES
('Ahmed Rahman', 5, 'Super fast delivery! Got my PUBG UC within minutes. Will definitely buy again.', 'PUBG Mobile UC', true, 1),
('Sarah Khan', 5, 'Best prices for Steam gift cards in Bangladesh. Trusted seller!', 'Steam Gift Card', true, 2),
('Mohammad Ali', 5, 'Amazing service! The Netflix subscription was activated instantly.', 'Netflix Premium', true, 3),
('Fatima Begum', 5, 'Very reliable. I always buy my gaming credits from here.', 'Free Fire Diamonds', true, 4);

INSERT INTO public.promotional_banners (text, link_url, background_color, text_color, sort_order) VALUES
('🎮 Special Offer: Get 10% OFF on all PUBG UC purchases! Use code: PUBG10', '/shop?category=pubg', '#D4AF37', '#1a1a1a', 1),
('⚡ Flash Sale: Steam Gift Cards at lowest prices - Limited Time Only!', '/shop?category=steam', '#8B5CF6', '#ffffff', 2),
('🎁 Free delivery on orders above ৳1000 - Shop Now!', '/shop', '#10B981', '#ffffff', 3);