import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewNotificationRequest {
  customerEmail: string;
  customerName: string;
  productName: string;
  reviewTitle: string;
  notificationType: 'approved' | 'featured';
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let customerEmail = '';

  try {
    const { customerEmail: email, customerName, productName, reviewTitle, notificationType }: ReviewNotificationRequest = await req.json();
    customerEmail = email;

    console.log(`Sending review ${notificationType} notification to ${customerEmail}`);

    if (!customerEmail) {
      return new Response(JSON.stringify({ success: false, message: "No customer email provided" }), {
        status: 400,
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

    const isApproved = notificationType === 'approved';
    const isFeatured = notificationType === 'featured';

    const subject = isFeatured 
      ? `🌟 Your Review Has Been Featured! | Golden Bumps`
      : `✅ Your Review Has Been Approved! | Golden Bumps`;

    const headerTitle = isFeatured ? 'Your Review is Featured!' : 'Review Approved!';
    const headerColor = isFeatured ? '#D4AF37' : '#22c55e';

    const bodyContent = isFeatured
      ? `Congratulations! Your review for <strong>"${productName}"</strong> has been selected as a featured review on our website. Your feedback is now highlighted for other customers to see!`
      : `Great news! Your review for <strong>"${productName}"</strong> has been approved and is now visible on our website. Thank you for sharing your experience!`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}CC 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .review-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${headerColor}; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
    .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
    .cta { display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headerTitle}</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>${bodyContent}</p>
      ${reviewTitle ? `
      <div class="review-box">
        <p style="margin: 0; font-style: italic;">"${reviewTitle}"</p>
      </div>
      ` : ''}
      <p>Thank you for being a valued customer and sharing your feedback!</p>
      <p style="margin-top: 25px;">Best regards,<br><strong>Golden Bumps Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Golden Bumps.</p>
    </div>
  </div>
</body>
</html>`;

    await client.send({
      from: `Golden Bumps <${hostingerEmail}>`,
      to: customerEmail,
      subject: subject,
      content: `Your review for ${productName} has been ${notificationType}!`,
      html: emailHtml,
    });
    await client.close();

    // Log the email
    await supabase.from('email_logs').insert({
      template_type: `review_${notificationType}`,
      recipient_email: customerEmail,
      subject: subject,
      status: 'sent'
    });

    console.log(`Review ${notificationType} notification sent to ${customerEmail}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error sending review notification:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
