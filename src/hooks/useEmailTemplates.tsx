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
  support_email: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  help_center_url: string | null;
  social_links: Record<string, string> | null;
  custom_css: string | null;
  greeting_format: string;
  closing_text: string;
  signature_name: string;
  order_id_label: string;
  order_total_label: string;
  status_label: string;
  text_color: string;
  background_color: string;
  button_color: string;
  button_text_color: string;
  footer_background_color: string;
  refund_policy: string | null;
  delivery_disclaimer: string | null;
  support_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  order_id: string | null;
  template_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message: string | null;
  sent_at: string;
  created_at: string;
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

// Available shortcodes for email templates
export const availableShortcodes = [
  { code: '{customer_name}', description: 'Customer full name' },
  { code: '{customer_email}', description: 'Customer email address' },
  { code: '{order_id}', description: 'Order ID (short format)' },
  { code: '{order_number}', description: 'Full order number' },
  { code: '{order_total}', description: 'Order total amount' },
  { code: '{order_date}', description: 'Order date' },
  { code: '{payment_method}', description: 'Payment method used' },
  { code: '{transaction_id}', description: 'Transaction ID' },
  { code: '{company_name}', description: 'Your company name' },
  { code: '{support_email}', description: 'Support email address' },
  { code: '{tracking_url}', description: 'Order tracking URL' },
  { code: '{shop_url}', description: 'Shop homepage URL' },
  { code: '{refund_amount}', description: 'Refund amount (for refunds)' },
  { code: '{delivery_type}', description: 'Delivery type name (e.g., Code, Account, Gift Card)' },
];

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

export function useEmailLogs() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as EmailLog[];
    },
    enabled: isAdmin,
  });
}
