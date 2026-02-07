import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Twilio credentials
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
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

    // Verify user has admin role
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Check if customer has a phone number
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

    // Compose message
    const message = `Your Stonebridge Bagels order #${order.order_number} is ready for pickup! 🥯`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: 'twilio_error',
          message: twilioResult.message || 'Failed to send SMS'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS sent successfully:', twilioResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResult.sid,
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
