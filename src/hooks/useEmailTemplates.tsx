import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface EmailTemplate {
  id: string;
  status_type: string;
  sender_email: string;
  sender_name: string;
  subject_template: string;
  header_title: string;
  header_color: string;
  body_intro: string;
  body_content: string | null;
  show_order_details: boolean;
  show_tracking_button: boolean;
  tracking_button_text: string | null;
  footer_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const statusTypeLabels: Record<string, string> = {
  order_confirmation: 'Order Confirmation',
  payment_paid: 'Payment Verified',
  payment_failed: 'Payment Failed',
  shipping: 'Order Shipped',
  delivery: 'Order Delivered',
  cancelled: 'Order Cancelled',
  refunded: 'Order Refunded',
};

export function useEmailTemplates() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('status_type');

      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: isAdmin,
  });
}

export function useEmailTemplate(statusType: string) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['email-template', statusType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('status_type', statusType)
        .maybeSingle();

      if (error) throw error;
      return data as EmailTemplate | null;
    },
    enabled: isAdmin && !!statusType,
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template'] });
    },
  });
}
