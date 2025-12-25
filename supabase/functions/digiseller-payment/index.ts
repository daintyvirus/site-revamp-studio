import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigisellerPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  returnUrl: string;
  failUrl: string;
  // Product-based checkout fields
  digisellerId?: number;
  quantity?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("DIGISELLER_API_KEY");
    const sellerId = Deno.env.get("DIGISELLER_SELLER_ID");

    if (!apiKey || !sellerId) {
      console.error("Missing Digiseller credentials");
      return new Response(
        JSON.stringify({ error: "Digiseller not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: DigisellerPaymentRequest = await req.json();
    console.log("Digiseller payment request:", body);

    let paymentUrl: string;

    // Check if this is a product-based checkout (has digisellerId)
    if (body.digisellerId) {
      // Product-based checkout - use the registered product ID
      console.log("Using product-based checkout with Digiseller ID:", body.digisellerId);
      
      const baseUrl = "https://www.digiseller.market/asp2/pay_wm.asp";
      const params = new URLSearchParams({
        id_d: body.digisellerId.toString(),
        lang: 'en-US',
        email: body.customerEmail,
        failpage: body.failUrl,
        agent: body.orderId,
      });
      
      // Add quantity if more than 1
      if (body.quantity && body.quantity > 1) {
        params.set('cnt', body.quantity.toString());
      }
      
      paymentUrl = `${baseUrl}?${params.toString()}`;
    } else {
      // Flexible price checkout - use seller ID with custom amount
      console.log("Using flexible price checkout");
      
      const amount = Math.round(body.amount * 100) / 100;
      const baseUrl = "https://www.digiseller.market/asp2/pay_wm.asp";
      
      const params = new URLSearchParams({
        id_d: sellerId,
        lang: 'en-US',
        amount: amount.toString(),
        curr: body.currency || 'USD',
        email: body.customerEmail,
        failpage: body.failUrl,
        agent: body.orderId,
      });

      paymentUrl = `${baseUrl}?${params.toString()}`;
    }

    console.log("Generated Digiseller payment URL:", paymentUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentUrl,
        message: "Payment URL generated successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error processing Digiseller payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
