import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

interface EmailTemplate { id: string; status_type: string; sender_email: string; sender_name: string; subject_template: string; header_title: string; header_color: string; body_intro: string; body_content: string | null; show_order_details: boolean; show_tracking_button: boolean; tracking_button_text: string | null; footer_text: string | null; support_email: string | null; company_name: string | null; company_logo_url: string | null; greeting_format: string; closing_text: string; signature_name: string; order_id_label: string; order_total_label: string; status_label: string; text_color: string; background_color: string; button_color: string; button_text_color: string; footer_background_color: string; refund_policy: string | null; delivery_disclaimer: string | null; support_hours: string | null; is_active: boolean; }

function replaceShortcodes(text: string, data: Record<string, string>): string { let result = text; for (const [key, value] of Object.entries(data)) { result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), value || ''); } return result; }

async function getEmailTemplate(supabase: any, statusType: string): Promise<EmailTemplate | null> { const { data, error } = await supabase.from('email_templates').select('*').eq('status_type', statusType).eq('is_active', true).maybeSingle(); if (error) { console.error('Error fetching email template:', error); return null; } return data; }

async function logEmail(supabase: any, data: { order_id: string | null; template_type: string; recipient_email: string; subject: string; status: string; error_message?: string; }) { try { await supabase.from('email_logs').insert(data); } catch (error) { console.error('Failed to log email:', error); } }

function generateEmailHtml(template: EmailTemplate, shortcodeData: Record<string, string>): string {
  const headerTitle = replaceShortcodes(template.header_title, shortcodeData);
  const bodyIntro = replaceShortcodes(template.body_intro, shortcodeData);
  const bodyContent = template.body_content ? replaceShortcodes(template.body_content, shortcodeData) : '';
  const footerText = template.footer_text ? replaceShortcodes(template.footer_text, shortcodeData) : '';
  const buttonText = template.tracking_button_text ? replaceShortcodes(template.tracking_button_text, shortcodeData) : 'View Order Details';
  const companyName = template.company_name || 'Golden Bumps';
  const greetingFormat = replaceShortcodes(template.greeting_format || 'Dear {customer_name},', shortcodeData);
  const closingText = replaceShortcodes(template.closing_text || 'Best regards,', shortcodeData);
  const signatureName = replaceShortcodes(template.signature_name || template.sender_name, shortcodeData);
  const orderIdLabel = template.order_id_label || 'Order ID:';
  const orderTotalLabel = template.order_total_label || 'Order Total:';
  const statusLabel = template.status_label || 'Status:';
  const textColor = template.text_color || '#333333';
  const bgColor = template.background_color || '#ffffff';
  const headerColor = template.header_color || '#EF4444';
  const buttonColor = template.button_color || '#D4AF37';
  const buttonTextColor = template.button_text_color || '#1a1a1a';
  const footerBgColor = template.footer_background_color || '#f9fafb';
  const supportHours = template.support_hours || '10AM - 2AM Everyday';
  const refundPolicy = template.refund_policy || 'Refunds are processed within 24-48 hours after verification.';
  const deliveryDisclaimer = template.delivery_disclaimer || 'Digital products are delivered instantly via email and your account dashboard.';

  const styles = `body{font-family:Arial,sans-serif;line-height:1.6;color:${textColor};margin:0;padding:0;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,${headerColor} 0%,${headerColor}CC 100%);color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}.header h1{margin:0;font-size:28px}.content{background:${bgColor};padding:30px;border:1px solid #e5e7eb}.order-info{background:#FEF2F2;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #FECACA}.order-info p{margin:8px 0}.status-badge{display:inline-block;background:${headerColor};color:white;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600}.info-box{background:#FEF3C7;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #FDE68A}.cta{display:inline-block;background:${buttonColor};color:${buttonTextColor};padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px}.footer{background:${footerBgColor};padding:20px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none}.footer p{margin:5px 0;color:#6b7280;font-size:12px}`;

  const logoHtml = template.company_logo_url ? `<div style="text-align:center;padding:20px 0"><img src="${template.company_logo_url}" alt="${companyName}" style="max-height:60px"></div>` : '';
  const orderDetailsHtml = template.show_order_details ? `<div class="order-info"><p><strong>${orderIdLabel}</strong> #${shortcodeData.order_id}</p><p><strong>${orderTotalLabel}</strong> $${shortcodeData.order_total}</p><p><strong>${statusLabel}</strong> <span class="status-badge">Cancelled</span></p>${shortcodeData.cancellation_reason ? `<p><strong>Reason:</strong> ${shortcodeData.cancellation_reason}</p>` : ''}</div>` : '';
  const refundInfoHtml = `<div class="info-box"><p style="margin:0;color:#92400E"><strong>Refund Information</strong></p><p style="margin:8px 0 0 0;color:#92400E">If you have already made a payment, please contact our support team to process your refund.</p></div>`;
  const trackingButtonHtml = template.show_tracking_button ? `<div style="text-align:center;margin:25px 0"><a href="${shortcodeData.tracking_url}" class="cta">${buttonText}</a></div>` : '';
  const legalFooter = `<div style="border-top:1px solid #e5e7eb;margin-top:20px;padding-top:15px;font-size:11px;color:#9ca3af"><p><strong>Refund Policy:</strong> ${refundPolicy}</p><p><strong>Delivery:</strong> ${deliveryDisclaimer}</p><p><strong>Support Hours:</strong> ${supportHours}</p></div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${styles}</style></head><body><div class="container">${logoHtml}<div class="header"><h1>${headerTitle}</h1></div><div class="content"><p>${greetingFormat}</p><p>${bodyIntro}</p>${bodyContent ? `<p>${bodyContent}</p>` : ''}${orderDetailsHtml}${refundInfoHtml}${trackingButtonHtml}<p style="margin-top:25px">We apologize for any inconvenience. We hope to serve you again in the future.</p><p>${closingText}<br><strong>${signatureName}</strong></p></div><div class="footer"><p>${footerText}</p>${legalFooter}</div></div></body></html>`;
}

function generateDefaultEmailHtml(shortcodeData: Record<string, string>): string {
  const styles = `body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#EF4444 0%,#F87171 50%,#EF4444 100%);color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}.header h1{margin:0;font-size:28px}.content{background:#ffffff;padding:30px;border:1px solid #e5e7eb}.order-info{background:#FEF2F2;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #FECACA}.order-info p{margin:8px 0}.status-badge{display:inline-block;background:#EF4444;color:white;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600}.info-box{background:#FEF3C7;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #FDE68A}.cta{display:inline-block;background:#D4AF37;color:#1a1a1a;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px}.footer{background:#f9fafb;padding:20px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none}.footer p{margin:5px 0;color:#6b7280;font-size:12px}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${styles}</style></head><body><div class="container"><div class="header"><h1>Order Cancelled</h1></div><div class="content"><p>Dear <strong>${shortcodeData.customer_name}</strong>,</p><p>We regret to inform you that your order has been cancelled.</p><div class="order-info"><p><strong>Order ID:</strong> #${shortcodeData.order_id}</p><p><strong>Order Total:</strong> $${shortcodeData.order_total}</p><p><strong>Status:</strong> <span class="status-badge">Cancelled</span></p>${shortcodeData.cancellation_reason ? `<p><strong>Reason:</strong> ${shortcodeData.cancellation_reason}</p>` : ''}</div><div class="info-box"><p style="margin:0;color:#92400E"><strong>Refund Information</strong></p><p style="margin:8px 0 0 0;color:#92400E">If you have already made a payment, please contact our support team to process your refund.</p></div><div style="text-align:center;margin:25px 0"><a href="${shortcodeData.tracking_url}" class="cta">View Order Details</a></div><p>Best regards,<br><strong>Golden Bumps Team</strong></p></div><div class="footer"><p>This is an automated message from Golden Bumps.</p><p>Please do not reply directly to this email.</p><p>For support, contact us at support@goldenbumps.com</p></div></div></body></html>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") { return new Response(null, { headers: corsHeaders }); }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let customerEmail = ''; let orderId = ''; let subject = '';

  try {
    const body = await req.json();
    customerEmail = body.customerEmail;
    const customerName = body.customerName;
    orderId = body.orderId;
    const orderTotal = body.orderTotal;
    const reason = body.reason;

    console.log(`Sending cancellation notification to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) { console.log("No customer email provided, skipping notification"); return new Response(JSON.stringify({ success: false, message: "No customer email provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

    const template = await getEmailTemplate(supabase, 'cancelled');
    const orderIdShort = orderId.slice(0, 8).toUpperCase();
    const shortcodeData: Record<string, string> = { customer_name: customerName || 'Valued Customer', customer_email: customerEmail, order_id: orderIdShort, order_number: orderId, order_total: orderTotal.toLocaleString(), order_date: new Date().toLocaleDateString(), company_name: template?.company_name || 'Golden Bumps', support_email: template?.support_email || 'support@goldenbumps.com', tracking_url: `https://goldenbumps.com/track-order?id=${orderIdShort}`, shop_url: 'https://goldenbumps.com', cancellation_reason: reason || '' };

    const senderEmail = template?.sender_email || "support@goldenbumps.com";
    const senderName = template?.sender_name || "Golden Bumps";
    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) { console.error("Hostinger email credentials not configured"); await logEmail(supabase, { order_id: orderId, template_type: 'cancelled', recipient_email: customerEmail, subject: 'Cancellation Notification', status: 'failed', error_message: 'Email credentials not configured' }); return new Response(JSON.stringify({ success: false, message: "Email credentials not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

    const client = new SMTPClient({ connection: { hostname: "smtp.hostinger.com", port: 465, tls: true, auth: { username: hostingerEmail, password: hostingerPassword } } });
    const emailHtml = template ? generateEmailHtml(template, shortcodeData) : generateDefaultEmailHtml(shortcodeData);
    subject = template ? replaceShortcodes(template.subject_template, shortcodeData) : `Order Cancelled - #${orderIdShort} | Golden Bumps`;

    await client.send({ from: `${senderName} <${senderEmail}>`, to: customerEmail, subject: subject, content: `Your order #${orderIdShort} has been cancelled. If you have any questions, please contact our support team.`, html: emailHtml, headers: { "X-Priority": "1", "X-Mailer": "Golden Bumps Store", "Reply-To": senderEmail } });
    await client.close();

    await logEmail(supabase, { order_id: orderId, template_type: 'cancelled', recipient_email: customerEmail, subject: subject, status: 'sent' });
    console.log(`Cancellation notification sent successfully to ${customerEmail}`);

    return new Response(JSON.stringify({ success: true, message: "Cancellation notification sent successfully" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending cancellation notification:", error);
    await logEmail(supabase, { order_id: orderId, template_type: 'cancelled', recipient_email: customerEmail, subject: subject || 'Cancellation Notification', status: 'failed', error_message: error.message });
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});