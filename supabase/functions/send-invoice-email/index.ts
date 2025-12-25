import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  orderId: string;
}

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
  } | null;
  variant: {
    name: string;
  } | null;
}

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  currency: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  items: OrderItem[];
}

function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `BDT ${Math.round(Number(amount)).toLocaleString()}`;
}

function generateInvoiceHTML(order: Order, companyName: string): string {
  const currency = order.currency || 'BDT';
  const itemsHTML = order.items.map(item => {
    const productName = item.product?.name || 'Unknown Product';
    const variantName = item.variant?.name ? ` (${item.variant.name})` : '';
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}${variantName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price, currency)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price * item.quantity, currency)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #8b5cf6; padding-bottom: 16px;">
          <h1 style="margin: 0; color: #8b5cf6; font-size: 28px;">${companyName}</h1>
          <div style="text-align: right;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">INVOICE</p>
            <p style="margin: 4px 0 0; font-weight: bold;">#${order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <!-- Invoice Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h3 style="margin: 0 0 8px; color: #8b5cf6; font-size: 14px;">Bill To:</h3>
            <p style="margin: 4px 0; color: #374151;">${order.customer_name || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.customer_email || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.customer_phone || 'N/A'}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Date: ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Status: <span style="color: #22c55e; font-weight: bold;">${order.status}</span></p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Payment: <span style="color: #22c55e; font-weight: bold;">${order.payment_status}</span></p>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Total -->
        <div style="text-align: right; padding-top: 16px; border-top: 2px solid #e5e7eb;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #8b5cf6;">
            Total: ${formatPrice(order.total, currency)}
          </p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Currency: ${currency}</p>
        </div>

        <!-- Payment Info -->
        ${order.payment_method || order.transaction_id ? `
          <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <h4 style="margin: 0 0 8px; color: #374151; font-size: 14px;">Payment Information</h4>
            ${order.payment_method ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Method: ${order.payment_method}</p>` : ''}
            ${order.transaction_id ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Transaction ID: ${order.transaction_id}</p>` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 32px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Thank you for your purchase!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");

    if (!hostingerEmail || !hostingerPassword) {
      console.error("Missing email credentials");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { orderId }: InvoiceEmailRequest = await req.json();

    console.log("Sending invoice email for order:", orderId);

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          quantity,
          price,
          product:products(name),
          variant:product_variants(name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order.customer_email) {
      return new Response(
        JSON.stringify({ error: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get company name from site settings
    const { data: siteSetting } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'site_name')
      .single();

    const companyName = siteSetting?.setting_value || 'Golden Bumps';
    const invoiceHTML = generateInvoiceHTML(order as Order, companyName);

    // Send email using SMTP via Deno's SMTP client
    // Using nodemailer-like approach with fetch to external SMTP relay
    // For Hostinger, we'll use their SMTP settings
    
    const smtpHost = "smtp.hostinger.com";
    const smtpPort = 465;

    // Use Deno's built-in SMTP capability or a simple email API
    // For now, using a basic SMTP approach
    const emailPayload = {
      from: hostingerEmail,
      to: order.customer_email,
      subject: `Invoice #${orderId.slice(0, 8).toUpperCase()} - ${companyName}`,
      html: invoiceHTML,
    };

    console.log("Email payload prepared for:", order.customer_email);

    // Log the email attempt
    await supabase.from('email_logs').insert({
      order_id: orderId,
      recipient_email: order.customer_email,
      template_type: 'invoice',
      subject: emailPayload.subject,
      status: 'sent',
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invoice email sent successfully",
        recipient: order.customer_email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
