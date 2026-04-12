import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    if (!GHL_API_KEY) {
      throw new Error('GoHighLevel API key not configured');
    }

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: body } = await req.json().then(d => ({ data: d })).catch(() => ({ data: null }));
    
    if (!body?.orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order details using service role for full access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('order_number, customer_name, customer_phone')
      .eq('id', body.orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!order.customer_phone) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: 'no_phone',
          message: 'Customer has no phone number on file'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (ensure it has +1 for US)
    let phoneNumber = order.customer_phone.replace(/\D/g, '');
    if (phoneNumber.length === 10) {
      phoneNumber = '+1' + phoneNumber;
    } else if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const message = `Your Stonebridge Bagels order #${order.order_number} is ready for pickup! 🥯`;

    // Send SMS via GoHighLevel
    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'SMS',
        phone: phoneNumber,
        message: message,
      }),
    });

    const ghlResult = await ghlResponse.json();

    if (!ghlResponse.ok) {
      console.error('GoHighLevel error:', ghlResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: 'ghl_error',
          message: ghlResult.message || 'Failed to send SMS via GoHighLevel'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS sent via GoHighLevel successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        to: phoneNumber
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
