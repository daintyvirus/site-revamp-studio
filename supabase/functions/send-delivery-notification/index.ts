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
  is_active: boolean;
}

interface DeliveryNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
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

function generateEmailHtml(template: EmailTemplate, customerName: string, orderId: string, orderTotal: number): string {
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
        .order-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0; }
        .order-info p { margin: 8px 0; }
        .status-badge { display: inline-block; background: #059669; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
        .review-box { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #F59E0B; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .thank-you { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${template.header_title}</h1>
        </div>
        <div class="content">
          <div class="celebration">🎊✨🛍️✨🎊</div>
          
          <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>${template.body_intro}</p>
          ${template.body_content ? `<p>${template.body_content}</p>` : ''}
          
          ${template.show_order_details ? `
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">✓ Delivered</span></p>
          </div>
          ` : ''}

          ${template.show_tracking_button ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
              📋 ${template.tracking_button_text || 'View Order Details'}
            </a>
          </div>
          ` : ''}

          <div class="review-box">
            <p style="margin: 0 0 10px 0; font-size: 18px;"><strong>⭐ We'd Love Your Feedback!</strong></p>
            <p style="margin: 0; color: #92400E;">Your opinion matters to us! Share your experience and help other customers make informed decisions.</p>
          </div>

          <p style="margin-top: 25px;" class="thank-you">Thank You for Shopping with ${template.sender_name}!</p>
          
          <p>Warm regards,<br><strong>${template.sender_name}</strong></p>
        </div>
        <div class="footer">
          <p>${template.footer_text || 'This is an automated message.'}</p>
          <p>Please do not reply directly to this email.</p>
          <p>For support, contact us at ${template.sender_email}</p>
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

  try {
    const { customerEmail, customerName, orderId, orderTotal }: DeliveryNotificationRequest = await req.json();

    console.log(`Sending delivery confirmation to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping notification");
      return new Response(
        JSON.stringify({ success: false, message: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client to fetch template
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch template from database
    const template = await getEmailTemplate(supabase, 'delivery');
    
    // Use template values or fallback to defaults
    const senderEmail = template?.sender_email || "support@goldenbumps.com";
    const senderName = template?.sender_name || "Golden Bumps";

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) {
      console.error("Hostinger email credentials not configured");
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
      ? generateEmailHtml(template, customerName, orderId, orderTotal)
      : generateDefaultEmailHtml(customerName, orderId, orderTotal);

    // Generate subject from template
    const subject = template 
      ? template.subject_template.replace('{ORDER_ID}', orderId.slice(0, 8).toUpperCase()).replace('#{ORDER_ID}', `#${orderId.slice(0, 8).toUpperCase()}`)
      : `Your Order Has Been Delivered! 🎉 - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`;

    await client.send({
      from: `${senderName} <${senderEmail}>`,
      to: customerEmail,
      subject: subject,
      content: `Great news! Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered. Thank you for shopping with us!`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Delivery confirmation sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Delivery confirmation sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending delivery confirmation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateDefaultEmailHtml(customerName: string, orderId: string, orderTotal: number): string {
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
        .order-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0; }
        .order-info p { margin: 8px 0; }
        .status-badge { display: inline-block; background: #059669; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Delivered!</h1>
        </div>
        <div class="content">
          <div class="celebration">🎊✨🛍️✨🎊</div>
          
          <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>Wonderful news! Your order has been successfully delivered.</p>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">✓ Delivered</span></p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
              📋 View Order Details
            </a>
          </div>

          <p>Warm regards,<br><strong>Golden Bumps Team</strong></p>
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