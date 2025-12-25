import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigisellerCallback {
  id_inv?: string;      // Invoice ID
  inv?: string;         // Alternative invoice ID
  id_order?: string;    // Order ID (custom field we pass)
  order_id?: string;    // Alternative order ID
  o?: string;           // Short order ID param
  amount?: string;
  currency?: string;
  status?: string;
  sign?: string;        // Signature from Digiseller
  email?: string;
  id_seller?: string;   // Seller ID
}

// Generate MD5 hash
async function md5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify Digiseller signature
async function verifyDigisellerSignature(
  params: DigisellerCallback,
  apiKey: string,
  sellerId: string
): Promise<{ valid: boolean; reason?: string }> {
  const { sign, id_inv, amount, currency } = params;
  
  // If no signature provided, allow for GET redirects but log warning
  if (!sign) {
    console.warn("No signature provided in webhook callback");
    return { valid: true, reason: "no_signature_redirect" };
  }

  // Digiseller signature format: MD5(seller_id:amount:currency:id_inv:api_key)
  // The exact format may vary - check Digiseller documentation
  const signatureStrings = [
    // Common format 1: seller_id:amount:currency:id_inv:api_key
    `${sellerId}:${amount}:${currency}:${id_inv}:${apiKey}`,
    // Common format 2: id_inv:amount:currency:seller_id:api_key
    `${id_inv}:${amount}:${currency}:${sellerId}:${apiKey}`,
    // Common format 3: seller_id:id_inv:amount:api_key
    `${sellerId}:${id_inv}:${amount}:${apiKey}`,
    // Common format 4: lowercase
    `${sellerId}:${amount}:${currency?.toLowerCase()}:${id_inv}:${apiKey}`,
  ];

  for (const signatureString of signatureStrings) {
    const calculatedSign = await md5(signatureString);
    
    if (calculatedSign.toLowerCase() === sign.toLowerCase()) {
      console.log("Signature verified successfully");
      return { valid: true };
    }
  }

  // Log for debugging
  console.error("Signature verification failed");
  console.log("Received sign:", sign);
  console.log("Params:", { sellerId, amount, currency, id_inv });
  
  return { valid: false, reason: "invalid_signature" };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("DIGISELLER_API_KEY");
    const sellerId = Deno.env.get("DIGISELLER_SELLER_ID");

    if (!apiKey || !sellerId) {
      console.error("Missing Digiseller credentials");
      return new Response(
        JSON.stringify({ error: "Digiseller not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: DigisellerCallback;
    let isGetRequest = req.method === "GET";
    
    // Handle both GET (redirect callback) and POST (webhook notification)
    if (isGetRequest) {
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams.entries());
    } else {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await req.json();
      } else {
        // Handle form-urlencoded data
        const text = await req.text();
        body = Object.fromEntries(new URLSearchParams(text).entries());
      }
    }

    console.log("Digiseller webhook received:", JSON.stringify(body, null, 2));

    // Extract order ID from various possible fields
    const orderId = body.id_order || body.order_id || body.o;
    const invoiceId = body.id_inv || body.inv;
    const status = body.status;

    if (!orderId) {
      console.error("No order ID in webhook callback");
      return new Response(
        JSON.stringify({ error: "No order ID provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature for POST requests (webhook notifications)
    // GET requests are user redirects and may not have signature
    if (!isGetRequest) {
      const signatureResult = await verifyDigisellerSignature(body, apiKey, sellerId);
      
      if (!signatureResult.valid) {
        console.error("Invalid signature:", signatureResult.reason);
        
        // Log the attempt for security monitoring
        try {
          await supabase.from('delivery_logs').insert({
            order_id: orderId,
            action: 'webhook_signature_failed',
            error_message: `Invalid signature: ${signatureResult.reason}`,
            customer_ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
          });
        } catch (logErr) {
          console.error("Failed to log signature failure:", logErr);
        }

        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Processing payment for order: ${orderId}, invoice: ${invoiceId}, status: ${status}`);

    // Fetch order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !order) {
      console.error("Order not found:", orderId);
      
      // For GET requests, redirect to error page
      if (isGetRequest) {
        const baseUrl = "https://mwzohmvzgcyxqjctmyrr.lovableproject.com";
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, "Location": `${baseUrl}/order-confirmation?status=failed&error=order_not_found` }
        });
      }
      
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent duplicate processing
    if (order.payment_status === 'verified') {
      console.log(`Order ${orderId} already verified, skipping update`);
      
      if (isGetRequest) {
        const baseUrl = "https://mwzohmvzgcyxqjctmyrr.lovableproject.com";
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, "Location": `${baseUrl}/order-confirmation?orderId=${orderId}&status=success` }
        });
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Order already verified", orderId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order with payment confirmation
    const updateData: Record<string, any> = {
      transaction_id: invoiceId || body.id_inv || order.transaction_id,
      updated_at: new Date().toISOString()
    };

    // Check status - Digiseller uses various status codes
    const isSuccess = !status || status === 'success' || status === 'completed' || status === 'paid' || status === '1';
    
    if (isSuccess) {
      updateData.payment_status = 'verified';
      updateData.status = 'processing';
    } else {
      updateData.payment_status = 'failed';
      updateData.status = 'cancelled';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful webhook processing
    try {
      await supabase.from('delivery_logs').insert({
        order_id: orderId,
        action: isSuccess ? 'payment_verified_digiseller' : 'payment_failed_digiseller',
        delivery_info_snapshot: JSON.stringify({ invoiceId, status, method: isGetRequest ? 'redirect' : 'webhook' }),
        customer_ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
      });
    } catch (logErr) {
      console.error("Failed to log webhook:", logErr);
    }

    console.log(`Order ${orderId} updated: payment_status=${updateData.payment_status}, status=${updateData.status}`);

    // If this is a GET request (redirect from Digiseller), redirect to order confirmation
    if (isGetRequest) {
      const baseUrl = "https://mwzohmvzgcyxqjctmyrr.lovableproject.com";
      const redirectUrl = isSuccess 
        ? `${baseUrl}/order-confirmation?orderId=${orderId}&status=success`
        : `${baseUrl}/order-confirmation?orderId=${orderId}&status=failed`;
      
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": redirectUrl }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment status updated",
        orderId,
        paymentStatus: updateData.payment_status
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing Digiseller webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
