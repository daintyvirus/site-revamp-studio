-- Create email_logs table to track sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  template_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all email logs
CREATE POLICY "Admins can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert email logs (for edge functions via service role)
CREATE POLICY "Service role can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);

-- Add support_email field to email_templates
ALTER TABLE public.email_templates 
ADD COLUMN support_email TEXT DEFAULT 'support@goldenbumps.com',
ADD COLUMN company_name TEXT DEFAULT 'Golden Bumps',
ADD COLUMN company_logo_url TEXT DEFAULT NULL,
ADD COLUMN help_center_url TEXT DEFAULT NULL,
ADD COLUMN social_links JSONB DEFAULT '{}',
ADD COLUMN custom_css TEXT DEFAULT NULL;

-- Update footer_text to be more customizable
UPDATE public.email_templates SET footer_text = 'This is an automated message from {company_name}.

Please do not reply directly to this email.

For support, contact us at {support_email}' WHERE footer_text IS NULL OR footer_text = 'This is an automated message from Golden Bumps.';