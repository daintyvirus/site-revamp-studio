import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  paymentStatus: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, orderTotal, paymentStatus }: PaymentNotificationRequest = await req.json();

    console.log(`Sending payment notification to ${customerEmail} for order ${orderId}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping notification");
      return new Response(
        JSON.stringify({ success: false, message: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hostingerEmail = Deno.env.get("HOSTINGER_EMAIL");
    const hostingerPassword = Deno.env.get("HOSTINGER_EMAIL_PASSWORD");
    // Use alias for sending, authenticate with main email
    const senderEmail = "paymentverify@goldenbumps.com";

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

    const statusMessage = paymentStatus === "paid" 
      ? "Your payment has been verified and confirmed!" 
      : paymentStatus === "failed"
      ? "Unfortunately, there was an issue with your payment."
      : "Your payment is currently being processed.";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .status-paid { color: #059669; font-weight: bold; }
          .status-failed { color: #DC2626; font-weight: bold; }
          .status-pending { color: #D97706; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Update</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName || "Valued Customer"},</p>
            <p>${statusMessage}</p>
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Order Total:</strong> ₱${orderTotal.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> <span class="status-${paymentStatus}">${paymentStatus.toUpperCase()}</span></p>
            </div>
            ${paymentStatus === "paid" 
              ? "<p>Thank you for your purchase! Your order is now being processed.</p>" 
              : paymentStatus === "failed"
              ? "<p>Please contact our support team if you need assistance.</p>"
              : "<p>We will notify you once your payment has been verified.</p>"
            }
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: `Golden Bumps Payment <${senderEmail}>`,
      to: customerEmail,
      subject: `Payment ${paymentStatus === "paid" ? "Confirmed" : paymentStatus === "failed" ? "Failed" : "Update"} - Order #${orderId.slice(0, 8).toUpperCase()}`,
      content: statusMessage,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Golden Bumps Store",
        "Reply-To": senderEmail,
      },
    });

    await client.close();

    console.log(`Payment notification sent successfully to ${customerEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending payment notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
