import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  refundAmount?: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, orderTotal, refundAmount }: RefundNotificationRequest = await req.json();

    console.log(`Sending refund notification to ${customerEmail} for order ${orderId}`);

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

    const displayRefundAmount = refundAmount || orderTotal;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #8B5CF6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .order-info { background: #F5F3FF; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #DDD6FE; }
          .order-info p { margin: 8px 0; }
          .status-badge { display: inline-block; background: #8B5CF6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          .refund-amount { background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #10B981 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .refund-amount .amount { font-size: 32px; font-weight: bold; margin: 10px 0; }
          .info-box { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FDE68A; }
          .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💸 Refund Processed</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${customerName || "Valued Customer"}</strong>,</p>
            <p>Good news! We have processed your refund for your order. The funds should be returned to your original payment method shortly.</p>
            
            <div class="refund-amount">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Refund Amount</p>
              <p class="amount">₱${displayRefundAmount.toLocaleString()}</p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">Processing time: 3-7 business days</p>
            </div>

            <div class="order-info">
              <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Original Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
              <p><strong>Status:</strong> <span class="status-badge">Refunded</span></p>
            </div>

            <div class="info-box">
              <p style="margin: 0; color: #92400E;"><strong>⏳ When Will I Receive My Refund?</strong></p>
              <p style="margin: 8px 0 0 0; color: #92400E;">Refunds typically take 3-7 business days to appear in your account, depending on your bank or payment provider. If you don't see the refund after this period, please contact us.</p>
            </div>

            <!-- View Order Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://goldenbumps.com/track-order?id=${orderId.slice(0, 8)}" class="cta">
                📋 View Order Details
              </a>
            </div>

            <div style="background: #EFF6FF; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #BFDBFE;">
              <p style="margin: 0; color: #1E40AF;"><strong>🛍️ Shop Again?</strong></p>
              <p style="margin: 8px 0 0 0; color: #1E40AF;">We'd love to have you back! Check out our latest products and enjoy shopping with Golden Bumps.</p>
            </div>

            <p style="margin-top: 25px;">Thank you for your patience. We hope to serve you again soon!</p>
            
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
      subject: `Refund Processed - ₱${displayRefundAmount.toLocaleString()} - #${orderId.slice(0, 8).toUpperCase()} | Golden Bumps`,
      content: `Your refund of ₱${displayRefundAmount.toLocaleString()} for order #${orderId.slice(0, 8).toUpperCase()} has been processed. The funds should appear in your account within 3-7 business days.`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Refund notification sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Refund notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending refund notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
