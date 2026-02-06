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
): Promise<Response> {
  const apiKey = Deno.env.get('SHIPSTATION_API_KEY');
  if (!apiKey) {
    throw new Error('SHIPSTATION_API_KEY not configured');
  }

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
  return response;
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
        const response = await makeShipStationRequest('/carriers');
        result = await response.json();
        break;
      }

      case 'getCarrierServices': {
        const carrierId = data?.carrierId as string;
        if (!carrierId) throw new Error('carrierId required');
        const response = await makeShipStationRequest(`/carriers/listservices?carrierCode=${carrierId}`);
        result = await response.json();
        break;
      }

      // Rates
      case 'getRates': {
        const response = await makeShipStationRequest('/shipments/getrates', 'POST', data as Record<string, unknown>);
        result = await response.json();
        break;
      }

      // Labels
      case 'createLabel': {
        const response = await makeShipStationRequest('/shipments/createlabel', 'POST', data as Record<string, unknown>);
        result = await response.json();
        break;
      }

      case 'voidLabel': {
        const shipmentId = data?.shipmentId as string;
        if (!shipmentId) throw new Error('shipmentId required');
        const response = await makeShipStationRequest('/shipments/voidlabel', 'POST', { shipmentId });
        result = await response.json();
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
        const response = await makeShipStationRequest(`/shipments${queryString}`);
        result = await response.json();
        break;
      }

      case 'getShipment': {
        const shipmentId = data?.shipmentId as string;
        if (!shipmentId) throw new Error('shipmentId required');
        const response = await makeShipStationRequest(`/shipments/${shipmentId}`);
        result = await response.json();
        break;
      }

      // Orders
      case 'listOrders': {
        const params = new URLSearchParams();
        if (data?.orderStatus) params.append('orderStatus', data.orderStatus as string);
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await makeShipStationRequest(`/orders${queryString}`);
        result = await response.json();
        break;
      }

      // Warehouses (ship from locations)
      case 'listWarehouses': {
        const response = await makeShipStationRequest('/warehouses');
        result = await response.json();
        break;
      }

      // Stores
      case 'listStores': {
        const response = await makeShipStationRequest('/stores');
        result = await response.json();
        break;
      }

      // Products
      case 'listProducts': {
        const params = new URLSearchParams();
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await makeShipStationRequest(`/products${queryString}`);
        result = await response.json();
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
        const response = await makeShipStationRequest(`/fulfillments${queryString}`);
        result = await response.json();
        break;
      }

      // Customers
      case 'listCustomers': {
        const params = new URLSearchParams();
        if (data?.page) params.append('page', String(data.page));
        if (data?.pageSize) params.append('pageSize', String(data.pageSize || 100));
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await makeShipStationRequest(`/customers${queryString}`);
        result = await response.json();
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
