const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShipStationRequest {
  action: string;
  data?: Record<string, unknown>;
}

const SHIPSTATION_BASE_URL = 'https://ssapi.shipstation.com';

async function makeShipStationRequest(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('SHIPSTATION_API_KEY');
  if (!apiKey) {
    throw new Error('SHIPSTATION_API_KEY not configured');
  }

  // ShipStation expects API_KEY:API_SECRET format for Basic auth
  const headers: Record<string, string> = {
    'Authorization': `Basic ${btoa(apiKey)}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SHIPSTATION_BASE_URL}${endpoint}`, options);
  
  // Check Content-Type before attempting to parse as JSON
  const contentType = response.headers.get('content-type');
  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`ShipStation API error - Status: ${response.status}, Body: ${responseText.substring(0, 500)}`);
    throw new Error(`ShipStation API error: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  if (!contentType?.includes('application/json')) {
    console.error(`Expected JSON but got: ${contentType}`);
    console.error(`Response preview: ${responseText.substring(0, 200)}`);
    
    // Check for common HTML patterns
    if (responseText.trim().startsWith('<!') || responseText.includes('<html')) {
      throw new Error(
        `ShipStation returned HTML instead of JSON. This usually indicates: ` +
        `auth issues, server error, or rate limiting. Status: ${response.status}`
      );
    }
    
    throw new Error(`Unexpected response format: ${contentType}`);
  }
  
  // Parse the JSON from the text we already read
  return JSON.parse(responseText);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json() as ShipStationRequest;

    let result;

    switch (action) {
      // Carriers
      case 'listCarriers': {
        result = await makeShipStationRequest('/carriers');
        break;
      }

      case 'getCarrierServices': {
        const carrierId = data?.carrierId as string;
        if (!carrierId) throw new Error('carrierId required');
        result = await makeShipStationRequest(`/carriers/listservices?carrierCode=${carrierId}`);
        break;
      }

      // Rates
      case 'getRates': {
        result = await makeShipStationRequest('/shipments/getrates', 'POST', data as Record<string, unknown>);
        break;
      }

      // Labels
      case 'createLabel': {
        result = await makeShipStationRequest('/shipments/createlabel', 'POST', data as Record<string, unknown>);
        break;
      }

      case 'voidLabel': {
        const shipmentId = data?.shipmentId as string;
        if (!shipmentId) throw new Error('shipmentId required');
        result = await makeShipStationRequest('/shipments/voidlabel', 'POST', { shipmentId });
        break;
      }

      // Shipments
      case 'listShipments': {
        const params = new URLSearchParams();
        if (data?.shipDateStart) params.append('shipDateStart', data.shipDateStart as string);
        if (data?.shipDateEnd) params.append('shipDateEnd', data.shipDateEnd as string);
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        result = await makeShipStationRequest(`/shipments${queryString}`);
        break;
      }

      case 'getShipment': {
        const shipmentId = data?.shipmentId as string;
        if (!shipmentId) throw new Error('shipmentId required');
        result = await makeShipStationRequest(`/shipments/${shipmentId}`);
        break;
      }

      // Orders
      case 'listOrders': {
        const params = new URLSearchParams();
        if (data?.orderStatus) params.append('orderStatus', data.orderStatus as string);
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        result = await makeShipStationRequest(`/orders${queryString}`);
        break;
      }

      // Warehouses (ship from locations)
      case 'listWarehouses': {
        result = await makeShipStationRequest('/warehouses');
        break;
      }

      // Stores
      case 'listStores': {
        result = await makeShipStationRequest('/stores');
        break;
      }

      // Products
      case 'listProducts': {
        const params = new URLSearchParams();
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        result = await makeShipStationRequest(`/products${queryString}`);
        break;
      }

      // Fulfillments (completed shipments)
      case 'listFulfillments': {
        const params = new URLSearchParams();
        if (data?.fulfillmentId) params.append('fulfillmentId', data.fulfillmentId as string);
        if (data?.orderId) params.append('orderId', String(data.orderId));
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        result = await makeShipStationRequest(`/fulfillments${queryString}`);
        break;
      }

      // Customers
      case 'listCustomers': {
        const params = new URLSearchParams();
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        result = await makeShipStationRequest(`/customers${queryString}`);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ShipStation API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
