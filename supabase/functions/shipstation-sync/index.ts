import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  options?: Record<string, string>;
}

interface ShipStationOrder {
  orderNumber: string;
  orderKey: string;
  orderDate: string;
  orderStatus: string;
  customerEmail: string;
  billTo: {
    name: string;
    company?: string;
    street1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  shipTo: {
    name: string;
    company?: string;
    street1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    options?: Array<{ name: string; value: string }>;
  }>;
  amountPaid: number;
  tagIds?: number[];
  internalNotes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check admin or staff role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'staff'])
      .limit(1);

    if (!roleData || roleData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin or Staff role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipstationApiKey = Deno.env.get('SHIPSTATION_API_KEY');
    if (!shipstationApiKey) {
      return new Response(
        JSON.stringify({ error: 'ShipStation API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, wholesale_accounts(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.shipstation_order_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Order already synced to ShipStation',
          shipstationOrderId: order.shipstation_order_id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse items
    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

    // Get shipping address from wholesale account or order
    const shippingAddress = order.ship_to_address || 
      (order.wholesale_accounts?.shipping_address) || 
      {};

    // Transform to ShipStation format
    const shipstationOrder: ShipStationOrder = {
      orderNumber: order.order_number,
      orderKey: order.id,
      orderDate: order.created_at || new Date().toISOString(),
      orderStatus: 'awaiting_shipment',
      customerEmail: order.customer_email,
      billTo: {
        name: order.customer_name,
        phone: order.customer_phone || undefined,
        street1: shippingAddress.street1 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'US',
      },
      shipTo: {
        name: shippingAddress.name || order.customer_name,
        company: shippingAddress.company || (order.wholesale_accounts?.business_name),
        phone: shippingAddress.phone || order.customer_phone || undefined,
        street1: shippingAddress.street1 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'US',
      },
      items: items.map((item) => ({
        sku: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        options: item.options 
          ? Object.entries(item.options).map(([name, value]) => ({ name, value }))
          : undefined,
      })),
      amountPaid: order.total,
      internalNotes: order.notes || undefined,
    };

    // Add tag for order type
    if (order.order_type === 'wholesale') {
      shipstationOrder.internalNotes = `[WHOLESALE] ${shipstationOrder.internalNotes || ''}`;
    }

    // Send to ShipStation API
    const shipstationResponse = await fetch('https://ssapi.shipstation.com/orders/createorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${shipstationApiKey}`,
      },
      body: JSON.stringify(shipstationOrder),
    });

    if (!shipstationResponse.ok) {
      const errorText = await shipstationResponse.text();
      console.error('ShipStation API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create order in ShipStation',
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipstationResult = await shipstationResponse.json();

    // Update order with ShipStation order ID using service role for update
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: updateError } = await serviceClient
      .from('orders')
      .update({ 
        shipstation_order_id: String(shipstationResult.orderId),
        status: 'confirmed'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        shipstationOrderId: shipstationResult.orderId,
        orderNumber: order.order_number
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing order:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
