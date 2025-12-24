import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

interface OrderConfirmationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  paymentMethod: string;
  transactionId: string;
  items: OrderItem[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      orderId, 
      orderTotal, 
      paymentMethod,
      transactionId,
      items 
    }: OrderConfirmationRequest = await req.json();

    console.log(`Sending order confirmation to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping confirmation");
      return new Response(
        JSON.stringify({ success: false, message: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");
    const senderEmail = "support@goldenbumps.com";

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

    const emailHtml = `
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
            <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
            <p>Thank you for your order! We've received your order and it's now being processed.</p>
            
            <div class="order-info">
              <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
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
                  <td style="padding: 15px 12px; text-align: right;">₱${orderTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

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

    await client.send({
      from: `Golden Bumps <${senderEmail}>`,
      to: customerEmail,
      subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`,
      content: `Thank you for your order! Order ID: ${orderId.slice(0, 8).toUpperCase()}, Total: ₱${orderTotal.toLocaleString()}. Your payment is being verified.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Order confirmation sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
