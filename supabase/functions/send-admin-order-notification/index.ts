import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface AdminOrderNotificationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderTotal: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  items: OrderItem[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { orderId, customerName, customerEmail, customerPhone, orderTotal, currency, paymentMethod, transactionId, items }: AdminOrderNotificationRequest = await req.json();

    console.log(`Sending admin notification for new order ${orderId}`);

    // Get admin notification email from site settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_notification_email')
      .single();

    const adminEmail = settings?.setting_value;

    if (!adminEmail) {
      console.log("No admin notification email configured, skipping");
      return new Response(JSON.stringify({ success: false, message: "No admin email configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) {
      console.error("Email credentials not configured");
      return new Response(JSON.stringify({ success: false, message: "Email credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com",
        port: 465,
        tls: true,
        auth: { username: hostingerEmail, password: hostingerPassword }
      }
    });

    const orderIdShort = orderId.slice(0, 8).toUpperCase();
    const currencySymbol = currency === 'USD' ? '$' : '৳';
    const formattedTotal = `${currencySymbol}${orderTotal.toLocaleString()}`;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}${item.variant ? ` - ${item.variant}` : ''}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-box p { margin: 8px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
    .items-table th:last-child { text-align: right; }
    .total-row { font-weight: bold; font-size: 18px; background: #fef3c7; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
    .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
    .cta { display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    .badge { display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received!</h1>
    </div>
    <div class="content">
      <p>A new order has been placed on your store. Here are the details:</p>
      
      <div class="info-box">
        <p><strong>Order ID:</strong> #${orderIdShort}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Transaction ID:</strong> <span class="badge">${transactionId}</span></p>
        <p><strong>Currency:</strong> ${currency}</p>
      </div>

      <h3>Order Items</h3>
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
            <td style="padding: 15px 12px; text-align: right;">${formattedTotal}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin: 25px 0;">
        <a href="https://goldenbumps.com/admin/orders" class="cta">View Order in Dashboard</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">This order is pending payment verification. Please verify the transaction ID before processing.</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from Golden Bumps Store.</p>
      <p>Order placed at: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

    await client.send({
      from: `Golden Bumps Store <${hostingerEmail}>`,
      to: adminEmail,
      subject: `🛒 New Order #${orderIdShort} - ${formattedTotal} | Golden Bumps`,
      content: `New order received! Order ID: ${orderIdShort}, Customer: ${customerName}, Total: ${formattedTotal}`,
      html: emailHtml,
    });
    await client.close();

    // Log the email
    await supabase.from('email_logs').insert({
      order_id: orderId,
      template_type: 'admin_order_notification',
      recipient_email: adminEmail,
      subject: `New Order #${orderIdShort}`,
      status: 'sent'
    });

    console.log(`Admin notification sent to ${adminEmail} for order ${orderId}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
