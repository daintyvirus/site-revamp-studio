-- Create hero_images table for managing carousel images
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Public can view active hero images
CREATE POLICY "Anyone can view active hero images"
ON public.hero_images
FOR SELECT
USING (is_active = true);

-- Only admins can manage hero images
CREATE POLICY "Admins can manage hero images"
ON public.hero_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_hero_images_updated_at
BEFORE UPDATE ON public.hero_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default hero images
INSERT INTO public.hero_images (image_url, title, subtitle, sort_order) VALUES
('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80', 'Gaming Essentials', 'Top-up your favorite games instantly', 0),
('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80', 'Gift Cards', 'Perfect gifts for gamers', 1),
('https://images.unsplash.com/photo-1493711662062-fa541f7f5d0a?w=1920&q=80', 'Premium Subscriptions', 'Access exclusive content', 2);