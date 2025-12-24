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

    // Create payment via Digiseller API
    // Using the Digiseller pay form method
    const paymentData = {
      seller_id: sellerId,
      product_name: body.productName,
      amount: body.amount,
      currency: body.currency === 'BDT' ? 'USD' : body.currency, // Digiseller may not support BDT directly
      email: body.customerEmail,
      order_id: body.orderId,
      success_url: body.returnUrl,
      fail_url: body.failUrl,
    };

    // Generate payment URL for Digiseller
    // The actual implementation depends on Digiseller's specific API endpoints
    // This creates a payment form URL that redirects to Digiseller
    const baseUrl = "https://www.digiseller.market/asp/pay.asp";
    const params = new URLSearchParams({
      id_d: sellerId,
      amount: body.amount.toString(),
      curr: body.currency === 'BDT' ? 'USD' : body.currency,
      email: body.customerEmail,
      lang: 'en-US',
      failpage: body.failUrl,
      o: body.orderId,
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
