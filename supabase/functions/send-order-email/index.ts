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

    const body = await req.json();
    const { orderId, customerEmail, customerName, orderNumber, items, subtotal, tax, total, pickupTime, pickupType } = body;

    if (!orderId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'orderId and customerEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email body
    const itemsList = (items || []).map((item: any) => 
      `• ${item.name} x${item.quantity} — $${(item.unitPrice * item.quantity).toFixed(2)}`
    ).join('\n');

    const emailBody = `
Hi ${customerName || 'there'},

Thank you for your order at Stonebridge Bagels! 🥯

Order #${orderNumber}
${pickupType === 'dine_in' ? 'Dine-in' : 'Pickup'} Time: ${pickupTime || 'ASAP'}

Items:
${itemsList}

Subtotal: $${(subtotal || 0).toFixed(2)}
Tax: $${(tax || 0).toFixed(2)}
Total: $${(total || 0).toFixed(2)}

We'll have your order ready for you. See you soon!

— Stonebridge Bagels
`.trim();

    // Send email via GoHighLevel
    const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'Email',
        email: customerEmail,
        subject: `Order Confirmation — #${orderNumber} | Stonebridge Bagels`,
        message: emailBody,
      }),
    });

    const ghlResult = await ghlResponse.json();

    if (!ghlResponse.ok) {
      console.error('GoHighLevel email error:', ghlResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: 'ghl_error',
          message: ghlResult.message || 'Failed to send email via GoHighLevel'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order confirmation email sent via GoHighLevel to', customerEmail);

    return new Response(
      JSON.stringify({ success: true, to: customerEmail }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending order email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send order confirmation email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
