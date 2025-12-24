import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, orderTotal }: ShippingNotificationRequest = await req.json();

    console.log(`Sending shipping notification to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping notification");
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

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #10B981 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .order-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0; }
          .order-info p { margin: 8px 0; }
          .status-badge { display: inline-block; background: #10B981; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          .tracking-box { background: #f9fafb; border: 2px dashed #d1d5db; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
          .cta { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #10B981 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
          .highlight { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
            <p>Great news! Your order is on its way to you. We've carefully packed your items and handed them over to our shipping partner.</p>
            
            <div class="order-info">
              <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
              <p><strong>Status:</strong> <span class="status-badge">Shipped</span></p>
            </div>

            <!-- Track Order Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
                📦 Track Your Order
              </a>
            </div>

            <div class="tracking-box">
              <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>🚚 What to Expect</strong></p>
              <p style="margin: 0; color: #6b7280;">Your package is typically delivered within 3-7 business days, depending on your location. You may receive SMS updates from our courier partner.</p>
            </div>

            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #92400E;"><strong>📍 Delivery Tips</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400E;">
                <li>Ensure someone is available to receive the package</li>
                <li>Check that your delivery address is accurate</li>
                <li>Keep your phone nearby for courier updates</li>
              </ul>
            </div>

            <p style="margin-top: 25px;">If you have any questions about your shipment, please don't hesitate to reach out to us.</p>
            
            <p>Thank you for shopping with us!</p>
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
      subject: `Your Order Has Shipped! 📦 - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`,
      content: `Great news! Your order #${orderId.slice(0, 8).toUpperCase()} has been shipped and is on its way to you.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Shipping notification sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Shipping notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending shipping notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
