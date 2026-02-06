

# Switch to ShipStation Sandbox API

## Overview
Configure the ShipStation integration to use the sandbox environment for testing. This allows you to test shipping functionality with mock data without affecting production.

## Changes Required

### 1. Update Edge Function - Use Sandbox URL
**File: `supabase/functions/shipstation-api/index.ts`**

Change the base URL from production to sandbox:

```typescript
// Change from:
const SHIPSTATION_BASE_URL = 'https://ssapi.shipstation.com';

// Change to:
const SHIPSTATION_BASE_URL = 'https://ssapi-sandbox.shipstation.com';
```

### 2. Update the API Key Secret
The sandbox API key you provided needs to be stored as the `SHIPSTATION_API_KEY` secret. 

**Your Sandbox API Key:** `TEST_wSe/SWk6ClWcO2fzcTEYcsJhJNDScHsN+nJdnufX4BE`

I'll update the existing secret with this sandbox key.

## What Changes

| Aspect | Before | After |
|--------|--------|-------|
| API Endpoint | `ssapi.shipstation.com` | `ssapi-sandbox.shipstation.com` |
| API Key | Production key | Sandbox test key |
| Data | Real shipments | Mock test data |

## Testing After Implementation
Once updated, the Shipping Dashboard will connect to ShipStation's sandbox and you can:
- List test carriers and services
- Create test shipment labels
- View mock shipment data
- Test rate shopping without real charges

## Switching Back to Production
When ready for production, we'll need to:
1. Change the URL back to `https://ssapi.shipstation.com`
2. Update the secret with your production API key

