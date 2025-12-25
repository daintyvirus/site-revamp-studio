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

    // Round amount to 2 decimal places
    const amount = Math.round(body.amount * 100) / 100;

    // Generate payment URL using Digiseller's purchase form
    // Using the correct endpoint format for DigiSeller payment
    const baseUrl = "https://www.digiseller.market/asp2/pay_wm.asp";
    
    const params = new URLSearchParams({
      id_d: sellerId,
      lang: 'en-US',
      amount: amount.toString(),
      curr: body.currency || 'USD',
      email: body.customerEmail,
      failpage: body.failUrl,
      agent: body.orderId, // Use agent field to pass order ID
    });

    const paymentUrl = `${baseUrl}?${params.toString()}`;

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
