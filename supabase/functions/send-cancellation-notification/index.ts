import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  reason?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, orderTotal, reason }: CancellationNotificationRequest = await req.json();

    console.log(`Sending cancellation notification to ${customerEmail} for order ${orderId}`);

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
              <p style="margin: 8px 0 0 0; color: #92400E;">If you have already made a payment, please contact our support team to process your refund. We typically process refunds within 3-5 business days.</p>
            </div>

            <!-- View Order Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
                📋 View Order Details
              </a>
            </div>

            <div style="background: #EFF6FF; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #BFDBFE;">
              <p style="margin: 0; color: #1E40AF;"><strong>❓ Have Questions?</strong></p>
              <p style="margin: 8px 0 0 0; color: #1E40AF;">If you have any questions about this cancellation or need assistance with a new order, please don't hesitate to reach out to us.</p>
            </div>

            <p style="margin-top: 25px;">We apologize for any inconvenience this may have caused. We hope to serve you again in the future.</p>
            
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
      subject: `Order Cancelled - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`,
      content: `Your order #${orderId.slice(0, 8).toUpperCase()} has been cancelled. If you have any questions, please contact our support team.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Cancellation notification sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Cancellation notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending cancellation notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
