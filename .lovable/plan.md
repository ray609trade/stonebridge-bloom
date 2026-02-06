

# Configure ShipStation Sandbox for Stonebridge

## Overview
Set up the ShipStation sandbox environment for the Stonebridge bakery project using your provided sandbox API key.

## Changes Required

### 1. Update Edge Function to Use Sandbox URL
**File: `supabase/functions/shipstation-api/index.ts`**

```typescript
// Change from:
const SHIPSTATION_BASE_URL = 'https://ssapi.shipstation.com';

// Change to:
const SHIPSTATION_BASE_URL = 'https://ssapi-sandbox.shipstation.com';
```

### 2. Update API Key Secret
Store your Stonebridge sandbox API key:

**Key:** `TEST_zJh6EW4FRpBC/aROFzo660+zPENbTBKa40V2R+/MiXk`

### 3. Deploy and Test
- Redeploy the edge function with sandbox configuration
- Navigate to the Shipping tab in Admin
- Verify carriers and test data load correctly

## Summary

| Setting | Value |
|---------|-------|
| Environment | Sandbox |
| API Endpoint | `ssapi-sandbox.shipstation.com` |
| API Key | Stonebridge sandbox key |

## After Approval
Once implemented, your Shipping Dashboard will connect to ShipStation's sandbox with test data for:
- Carrier services
- Rate shopping
- Label creation (without real charges)

