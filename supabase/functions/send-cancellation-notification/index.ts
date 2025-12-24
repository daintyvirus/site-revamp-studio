import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailTemplate {
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
  support_email: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  help_center_url: string | null;
  social_links: any;
  custom_css: string | null;
  is_active: boolean;
}

interface CancellationNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  reason?: string;
}

async function getEmailTemplate(supabase: any, statusType: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('status_type', statusType)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
  return data;
}

async function logEmailSent(
  supabase: any,
  recipientEmail: string,
  subject: string,
  templateType: string,
  orderId: string,
  status: 'sent' | 'failed',
  errorMessage?: string
) {
  try {
    const { error } = await supabase.from('email_logs').insert({
      recipient_email: recipientEmail,
      subject: subject,
      template_type: templateType,
      order_id: orderId,
      status: status,
      error_message: errorMessage || null,
    });
    if (error) {
      console.error('Error logging email:', error);
    }
  } catch (e) {
    console.error('Exception logging email:', e);
  }
}

function replaceShortcodes(
  text: string,
  customerName: string,
  orderId: string,
  orderTotal: number,
  template: EmailTemplate | null,
  reason?: string
): string {
  const companyName = template?.company_name || 'Golden Bumps';
  const supportEmail = template?.support_email || template?.sender_email || 'support@goldenbumps.com';
  
  return text
    .replace(/\{customer_name\}/gi, customerName || 'Valued Customer')
    .replace(/\{order_id\}/gi, orderId.slice(0, 8).toUpperCase())
    .replace(/\{order_total\}/gi, `₱${orderTotal.toLocaleString()}`)
    .replace(/\{company_name\}/gi, companyName)
    .replace(/\{support_email\}/gi, supportEmail)
    .replace(/\{current_year\}/gi, new Date().getFullYear().toString())
    .replace(/\{order_status\}/gi, 'Cancelled')
    .replace(/\{cancellation_reason\}/gi, reason || 'Not specified');
}

function generateEmailHtml(template: EmailTemplate, customerName: string, orderId: string, orderTotal: number, reason?: string): string {
  const processedBodyIntro = replaceShortcodes(template.body_intro, customerName, orderId, orderTotal, template, reason);
  const processedBodyContent = template.body_content ? replaceShortcodes(template.body_content, customerName, orderId, orderTotal, template, reason) : '';
  const processedFooter = template.footer_text ? replaceShortcodes(template.footer_text, customerName, orderId, orderTotal, template, reason) : 'This is an automated message.';
  const companyName = template.company_name || 'Golden Bumps';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${template.header_color} 0%, ${template.header_color}CC 50%, ${template.header_color} 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .order-info { background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #FECACA; }
        .order-info p { margin: 8px 0; }
        .status-badge { display: inline-block; background: ${template.header_color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .info-box { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FDE68A; }
        .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        ${template.custom_css || ''}
      </style>
    </head>
    <body>
      <div class="container">
        ${template.company_logo_url ? `<div style="text-align: center; padding: 20px 0;"><img src="${template.company_logo_url}" alt="${companyName}" style="max-height: 60px;"></div>` : ''}
        <div class="header">
          <h1>${template.header_title}</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>${processedBodyIntro}</p>
          ${processedBodyContent ? `<p>${processedBodyContent}</p>` : ''}
          
          ${template.show_order_details ? `
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">Cancelled</span></p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          ` : ''}

          <div class="info-box">
            <p style="margin: 0; color: #92400E;"><strong>💰 Refund Information</strong></p>
            <p style="margin: 8px 0 0 0; color: #92400E;">If you have already made a payment, please contact our support team to process your refund.</p>
          </div>

          ${template.show_tracking_button ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
              📋 ${template.tracking_button_text || 'View Order Details'}
            </a>
          </div>
          ` : ''}

          <p style="margin-top: 25px;">We apologize for any inconvenience. We hope to serve you again in the future.</p>
          
          <p>Best regards,<br><strong>${template.sender_name}</strong></p>
        </div>
        <div class="footer">
          <p>${processedFooter}</p>
          ${template.help_center_url ? `<p><a href="${template.help_center_url}" style="color: #6b7280;">Help Center</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let customerEmail = '';
  let orderId = '';
  let subject = '';

  try {
    const body: CancellationNotificationRequest = await req.json();
    customerEmail = body.customerEmail;
    const customerName = body.customerName;
    orderId = body.orderId;
    const orderTotal = body.orderTotal;
    const reason = body.reason;

    console.log(`Sending cancellation notification to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping notification");
      return new Response(
        JSON.stringify({ success: false, message: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch template from database
    const template = await getEmailTemplate(supabase, 'cancelled');
    
    // Use template values or fallback to defaults
    const senderEmail = template?.sender_email || "support@goldenbumps.com";
    const senderName = template?.sender_name || "Golden Bumps";

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) {
      console.error("Hostinger email credentials not configured");
      await logEmailSent(supabase, customerEmail, 'Cancellation Notification', 'cancelled', orderId, 'failed', 'Email credentials not configured');
      return new Response(
        JSON.stringify({ success: false, message: "Email credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com",
        port: 465,
        tls: true,
        auth: {
          username: hostingerEmail,
          password: hostingerPassword,
        },
      },
    });

    // Generate email HTML from template or use default
    const emailHtml = template 
      ? generateEmailHtml(template, customerName, orderId, orderTotal, reason)
      : generateDefaultEmailHtml(customerName, orderId, orderTotal, reason);

    // Generate subject from template with shortcode support
    subject = template 
      ? replaceShortcodes(template.subject_template, customerName, orderId, orderTotal, template, reason)
      : `Order Cancelled - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`;

    await client.send({
      from: `${senderName} <${senderEmail}>`,
      to: customerEmail,
      subject: subject,
      content: `Your order #${orderId.slice(0, 8).toUpperCase()} has been cancelled. If you have any questions, please contact our support team.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    // Log successful email
    await logEmailSent(supabase, customerEmail, subject, 'cancelled', orderId, 'sent');

    console.log(`Cancellation notification sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Cancellation notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending cancellation notification:", error);
    
    // Log failed email
    await logEmailSent(supabase, customerEmail, subject || 'Cancellation Notification', 'cancelled', orderId, 'failed', error.message);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateDefaultEmailHtml(customerName: string, orderId: string, orderTotal: number, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4444 0%, #F87171 50%, #EF4444 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .order-info { background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #FECACA; }
        .order-info p { margin: 8px 0; }
        .status-badge { display: inline-block; background: #EF4444; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .info-box { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FDE68A; }
        .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Order Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>We regret to inform you that your order has been cancelled.</p>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">Cancelled</span></p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <div class="info-box">
            <p style="margin: 0; color: #92400E;"><strong>💰 Refund Information</strong></p>
            <p style="margin: 8px 0 0 0; color: #92400E;">If you have already made a payment, please contact our support team to process your refund.</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
              📋 View Order Details
            </a>
          </div>

          <p>Best regards,<br><strong>Golden Bumps Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message from Golden Bumps.</p>
          <p>Please do not reply directly to this email.</p>
          <p>For support, contact us at support@goldenbumps.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
