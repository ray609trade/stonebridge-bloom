

# Fix and Test ShipStation "Sales Orders Imported" Webhook

## Issue Found

The webhook is returning **401 Unauthorized** because of an authentication format mismatch:

| Function | Auth Format |
|----------|-------------|
| `shipstation-api` | `Basic ${btoa(apiKey)}` (base64 encoded) |
| `shipstation-webhook` | `Basic ${apiKey}` (raw, not encoded) |

ShipStation requires the API credentials to be base64-encoded for Basic Authentication.

## Changes Required

### 1. Fix Authentication in Webhook
**File: `supabase/functions/shipstation-webhook/index.ts`**

Update line 51 to encode the API key:
```typescript
// Change from:
'Authorization': `Basic ${shipstationApiKey}`,

// Change to:
'Authorization': `Basic ${btoa(shipstationApiKey)}`,
```

### 2. Add Support for ORDER_NOTIFY Events
The current webhook only handles shipment data. Add handling for imported orders:

```typescript
// After fetching resource data, detect webhook type
if (payload.resource_type === 'ORDER_NOTIFY') {
  // Handle imported orders
  const orders = shipmentData.orders || [shipmentData];
  console.log(`Received ${orders.length} imported orders`);
  
  // For now, just log and acknowledge - 
  // order sync would update shipstation_order_id on matching orders
  return new Response(
    JSON.stringify({ 
      success: true,
      type: 'ORDER_NOTIFY',
      ordersReceived: orders.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Existing shipment handling continues for SHIP_NOTIFY...
```

### 3. Deploy and Verify
- Redeploy webhook function
- Send test POST to verify 401 is resolved
- Confirm order import acknowledgment works

## Technical Summary

| Step | Action |
|------|--------|
| 1 | Add `btoa()` encoding to fix 401 error |
| 2 | Add ORDER_NOTIFY branch for order imports |
| 3 | Deploy and test with simulated payload |

