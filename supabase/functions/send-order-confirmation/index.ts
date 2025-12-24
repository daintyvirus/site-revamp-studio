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
  greeting_format: string;
  closing_text: string;
  signature_name: string;
  order_id_label: string;
  order_total_label: string;
  status_label: string;
  is_active: boolean;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderConfirmationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  paymentMethod: string;
  transactionId: string;
  items: OrderItem[];
}

// Replace shortcodes with actual values
function replaceShortcodes(text: string, data: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, value || '');
  }
  return result;
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

async function logEmail(supabase: any, data: {
  order_id: string | null;
  template_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message?: string;
}) {
  try {
    await supabase.from('email_logs').insert(data);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

function generateEmailHtml(
  template: EmailTemplate, 
  shortcodeData: Record<string, string>,
  items: OrderItem[]
): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name}${item.variant ? ` - ${item.variant}` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₱${item.price.toLocaleString()}
      </td>
    </tr>
  `).join('');

  const headerTitle = replaceShortcodes(template.header_title, shortcodeData);
  const bodyIntro = replaceShortcodes(template.body_intro, shortcodeData);
  const bodyContent = template.body_content ? replaceShortcodes(template.body_content, shortcodeData) : '';
  const footerText = template.footer_text ? replaceShortcodes(template.footer_text, shortcodeData) : '';
  const buttonText = template.tracking_button_text ? replaceShortcodes(template.tracking_button_text, shortcodeData) : 'Track Your Order';
  const companyName = template.company_name || 'Golden Bumps';
  const greetingFormat = replaceShortcodes(template.greeting_format || 'Dear {customer_name},', shortcodeData);
  const closingText = replaceShortcodes(template.closing_text || 'Best regards,', shortcodeData);
  const signatureName = replaceShortcodes(template.signature_name || template.sender_name, shortcodeData);
  const orderIdLabel = template.order_id_label || 'Order ID:';
  const orderTotalLabel = template.order_total_label || 'Order Total:';
  const statusLabel = template.status_label || 'Status:';

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
        .order-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-info p { margin: 8px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
        .items-table th:last-child { text-align: right; }
        .total-row { font-weight: bold; font-size: 18px; }
        .status-badge { display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; white-space: pre-line; }
        .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${template.company_logo_url ? `<img src="${template.company_logo_url}" alt="${companyName}" style="max-height: 60px; margin-bottom: 15px;" />` : ''}
          <h1>${headerTitle}</h1>
        </div>
        <div class="content">
          <p>${greetingFormat}</p>
          <p>${bodyIntro}</p>
          ${bodyContent ? `<p>${bodyContent}</p>` : ''}
          
          ${template.show_order_details ? `
          <div class="order-info">
            <p><strong>${orderIdLabel}</strong> #${shortcodeData.order_id}</p>
            <p><strong>Transaction ID:</strong> ${shortcodeData.transaction_id}</p>
            <p><strong>Payment Method:</strong> ${shortcodeData.payment_method}</p>
            <p><strong>${statusLabel}</strong> <span class="status-badge">Pending Verification</span></p>
          </div>

          <h3 style="margin-top: 25px;">Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="padding: 15px 12px; text-align: right;">${orderTotalLabel}</td>
                <td style="padding: 15px 12px; text-align: right;">₱${shortcodeData.order_total}</td>
              </tr>
            </tbody>
          </table>
          ` : ''}

          ${template.show_tracking_button ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${shortcodeData.tracking_url}" class="cta">
              📦 ${buttonText}
            </a>
          </div>
          ` : ''}

          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400E;"><strong>⏳ What's Next?</strong></p>
            <p style="margin: 8px 0 0 0; color: #92400E;">Our team will verify your payment shortly. Once verified, you'll receive another email confirming your payment status.</p>
          </div>

          <p style="margin-top: 25px;">If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <p>${closingText}<br><strong>${signatureName}</strong></p>
        </div>
        <div class="footer">
          <p>${footerText}</p>
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
  let subject = '';

  try {
    const { 
      customerEmail: email, 
      customerName, 
      orderId, 
      orderTotal, 
      paymentMethod,
      transactionId,
      items 
    }: OrderConfirmationRequest = await req.json();

    customerEmail = email;
    const orderIdShort = orderId.slice(0, 8).toUpperCase();

    console.log(`Sending order confirmation to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping confirmation");
      return new Response(
        JSON.stringify({ success: false, message: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch template from database
    const template = await getEmailTemplate(supabase, 'order_confirmation');
    
    // Prepare shortcode data
    const shortcodeData: Record<string, string> = {
      customer_name: customerName || 'Valued Customer',
      customer_email: customerEmail,
      order_id: orderIdShort,
      order_number: orderId,
      order_total: orderTotal.toLocaleString(),
      order_date: new Date().toLocaleDateString(),
      payment_method: paymentMethod,
      transaction_id: transactionId,
      company_name: template?.company_name || 'Golden Bumps',
      support_email: template?.support_email || template?.sender_email || 'support@goldenbumps.com',
      tracking_url: `https://goldenbumps.com/track-order?id=${orderIdShort}`,
      shop_url: 'https://goldenbumps.com',
    };

    // Use template values or fallback to defaults
    const senderEmail = template?.sender_email || "support@goldenbumps.com";
    const senderName = template?.sender_name || "Golden Bumps";

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) {
      console.error("Hostinger email credentials not configured");
      await logEmail(supabase, {
        order_id: orderId,
        template_type: 'order_confirmation',
        recipient_email: customerEmail,
        subject: 'Order Confirmation',
        status: 'failed',
        error_message: 'Email credentials not configured',
      });
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

    // Generate email HTML and subject from template
    const emailHtml = template 
      ? generateEmailHtml(template, shortcodeData, items)
      : generateDefaultEmailHtml(shortcodeData, items);

    subject = template 
      ? replaceShortcodes(template.subject_template, { ...shortcodeData, ORDER_ID: orderIdShort })
      : `Order Confirmed - #${orderIdShort} | Golden Bumps`;

    await client.send({
      from: `${senderName} <${senderEmail}>`,
      to: customerEmail,
      subject: subject,
      content: `Thank you for your order! Order ID: ${orderIdShort}, Total: ₱${orderTotal.toLocaleString()}. Your payment is being verified.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    // Log successful email
    await logEmail(supabase, {
      order_id: orderId,
      template_type: 'order_confirmation',
      recipient_email: customerEmail,
      subject: subject,
      status: 'sent',
    });

    console.log(`Order confirmation sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    
    // Log failed email
    await logEmail(supabase, {
      order_id: null,
      template_type: 'order_confirmation',
      recipient_email: customerEmail,
      subject: subject || 'Order Confirmation',
      status: 'failed',
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


function generateDefaultEmailHtml(
  shortcodeData: Record<string, string>,
  items: OrderItem[]
): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name}${item.variant ? ` - ${item.variant}` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₱${item.price.toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .order-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-info p { margin: 8px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
        .items-table th:last-child { text-align: right; }
        .total-row { font-weight: bold; font-size: 18px; }
        .status-badge { display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        .cta { display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${shortcodeData.customer_name}</strong>,</p>
          <p>Thank you for your order! We've received your order and it's now being processed.</p>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${shortcodeData.order_id}</p>
            <p><strong>Transaction ID:</strong> ${shortcodeData.transaction_id}</p>
            <p><strong>Payment Method:</strong> ${shortcodeData.payment_method}</p>
            <p><strong>Payment Status:</strong> <span class="status-badge">Pending Verification</span></p>
          </div>

          <h3 style="margin-top: 25px;">Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="padding: 15px 12px; text-align: right;">Total:</td>
                <td style="padding: 15px 12px; text-align: right;">₱${shortcodeData.order_total}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${shortcodeData.tracking_url}" class="cta" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              📦 Track Your Order
            </a>
          </div>

          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400E;"><strong>⏳ What's Next?</strong></p>
            <p style="margin: 8px 0 0 0; color: #92400E;">Our team will verify your payment shortly. Once verified, you'll receive another email confirming your payment status.</p>
          </div>

          <p style="margin-top: 25px;">If you have any questions about your order, please don't hesitate to contact us.</p>
          
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
