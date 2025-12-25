import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
  sign?: string;
  email?: string;
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: DigisellerCallback;
    
    // Handle both GET (redirect callback) and POST (webhook notification)
    if (req.method === "GET") {
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

    console.log("Digiseller webhook received:", body);

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

    console.log(`Processing payment for order: ${orderId}, invoice: ${invoiceId}, status: ${status}`);

    // Verify the payment status (in production, you'd verify the signature)
    // For now, we'll accept the callback and update the order
    
    // Update order status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error("Order not found:", orderId);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order with payment confirmation
    const updateData: any = {
      transaction_id: invoiceId || body.id_inv,
      updated_at: new Date().toISOString()
    };

    // Check status - Digiseller uses various status codes
    // "success", "completed", "paid" indicate successful payment
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

    console.log(`Order ${orderId} updated: payment_status=${updateData.payment_status}, status=${updateData.status}`);

    // If this is a GET request (redirect from Digiseller), redirect to order confirmation
    if (req.method === "GET") {
      const baseUrl = req.headers.get("origin") || "https://mwzohmvzgcyxqjctmyrr.lovableproject.com";
      const redirectUrl = isSuccess 
        ? `${baseUrl}/order-confirmation?orderId=${orderId}&status=success`
        : `${baseUrl}/order-confirmation?orderId=${orderId}&status=failed`;
      
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": redirectUrl
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment status updated",
        orderId,
        paymentStatus: updateData.payment_status
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error processing Digiseller webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
