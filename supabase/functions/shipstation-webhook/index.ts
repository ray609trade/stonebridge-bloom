import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ShipStationWebhookPayload {
  resource_url?: string;
  resource_type?: string;
}

interface ShipmentInfo {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  trackingNumber: string;
  carrierCode: string;
  shipDate: string;
  shipmentId: number;
}

/**
 * Validates the webhook request using a secret token.
 * The token should be configured in ShipStation's webhook URL as a query parameter.
 * SECURITY: Token validation is MANDATORY - requests are rejected if token is not configured.
 */
function validateWebhookToken(req: Request): boolean {
  const webhookToken = Deno.env.get('SHIPSTATION_WEBHOOK_TOKEN');
  
  // SECURITY: Reject all requests if token is not configured
  // This prevents unauthenticated access to the webhook endpoint
  if (!webhookToken) {
    console.error('SHIPSTATION_WEBHOOK_TOKEN not configured - rejecting webhook request');
    return false;
  }
  
  const url = new URL(req.url);
  const providedToken = url.searchParams.get('token');
  
  if (!providedToken) {
    console.warn('Webhook request missing token parameter');
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  if (providedToken.length !== webhookToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < providedToken.length; i++) {
    result |= providedToken.charCodeAt(i) ^ webhookToken.charCodeAt(i);
  }
  
  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook authentication token
    if (!validateWebhookToken(req)) {
      console.error('Unauthorized webhook request - invalid or missing token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipstationApiKey = Deno.env.get('SHIPSTATION_API_KEY');
    if (!shipstationApiKey) {
      console.error('SHIPSTATION_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: ShipStationWebhookPayload = await req.json();
    console.log('Received authenticated ShipStation webhook:', payload.resource_type);

    // ShipStation sends a resource_url that we need to fetch
    if (!payload.resource_url) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the shipment details from ShipStation
    const shipmentResponse = await fetch(payload.resource_url, {
      headers: {
        'Authorization': `Basic ${btoa(shipstationApiKey)}`,
      },
    });

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      console.error('Failed to fetch shipment details:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch shipment details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipmentData = await shipmentResponse.json();
    console.log('Shipment data:', JSON.stringify(shipmentData));

    // Handle ORDER_NOTIFY (Sales Orders Imported) events
    if (payload.resource_type === 'ORDER_NOTIFY') {
      const orders = shipmentData.orders || [shipmentData];
      console.log(`Received ${orders.length} imported orders`);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          type: 'ORDER_NOTIFY',
          ordersReceived: orders.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle SHIP_NOTIFY (Shipment Shipped) events
    const shipments: ShipmentInfo[] = shipmentData.shipments || [shipmentData];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results: Array<{ orderKey: string; success: boolean; error?: string }> = [];

    for (const shipment of shipments) {
      if (!shipment.orderKey && !shipment.orderId) {
        console.log('Skipping shipment without order reference');
        continue;
      }

      // orderKey is our order.id
      const orderId = shipment.orderKey;
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          tracking_number: shipment.trackingNumber,
          carrier_code: shipment.carrierCode,
          shipped_at: shipment.shipDate || new Date().toISOString(),
          status: 'ready', // Mark as ready/shipped
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Failed to update order ${orderId}:`, updateError);
        results.push({ orderKey: orderId, success: false, error: updateError.message });
      } else {
        console.log(`Updated order ${orderId} with tracking: ${shipment.trackingNumber}`);
        results.push({ orderKey: orderId, success: true });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return generic error message to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: 'Processing error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
