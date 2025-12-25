-- Create custom pages table
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  menu_location TEXT DEFAULT 'header',
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page sections/blocks table
CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.custom_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'text', 'image', 'cta', 'features', 'faq', 'products', 'testimonials', 'custom_html'
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  background_color TEXT,
  text_color TEXT,
  extra_data JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FAQ items table for FAQ sections
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.page_sections(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feature items table for feature sections
CREATE TABLE public.feature_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.page_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_items ENABLE ROW LEVEL SECURITY;

-- Policies for custom_pages
CREATE POLICY "Published pages viewable by everyone" ON public.custom_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage pages" ON public.custom_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for page_sections
CREATE POLICY "Sections of published pages viewable by everyone" ON public.page_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.custom_pages WHERE id = page_sections.page_id AND is_published = true)
  );

CREATE POLICY "Admins can manage sections" ON public.page_sections
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for faq_items
CREATE POLICY "FAQ items viewable by everyone" ON public.faq_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQ items" ON public.faq_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for feature_items
CREATE POLICY "Feature items viewable by everyone" ON public.feature_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage feature items" ON public.feature_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();