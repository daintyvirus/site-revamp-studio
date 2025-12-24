-- Add countdown timer fields to promotional banners
ALTER TABLE public.promotional_banners
ADD COLUMN countdown_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN countdown_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN countdown_label TEXT DEFAULT 'Offer ends in:';