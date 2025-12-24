-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate reviews
ALTER TABLE public.product_reviews ADD CONSTRAINT unique_user_product_review UNIQUE (product_id, user_id);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Anyone can view approved reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.product_reviews
  FOR SELECT
  USING (is_approved = true);

-- Users can view their own reviews (even if not approved)
CREATE POLICY "Users can view their own reviews"
  ON public.product_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.product_reviews
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending reviews
CREATE POLICY "Users can update their own pending reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false);

-- Admins can update any review (for moderation)
CREATE POLICY "Admins can update any review"
  ON public.product_reviews
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON public.product_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any review
CREATE POLICY "Admins can delete any review"
  ON public.product_reviews
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved);