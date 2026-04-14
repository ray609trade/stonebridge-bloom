

## Option A: Update GHL API Key and Re-test

### Steps

1. **Update the `GHL_API_KEY` secret** with the correct Location API key from your GHL sub-account (Settings → Business Profile → API Key)
2. **Test the wholesale application notification** by invoking the `send-wholesale-application-notification` Edge Function with a test payload
3. **Verify logs** to confirm the GHL API accepts the new key and emails are delivered

### Important: Getting the Right Key
- Log into your GoHighLevel **sub-account** (not the agency account)
- Go to **Settings → Business Profile**
- Copy the **API Key** shown there — this is the Location API key
- Do NOT use an OAuth token or agency-level key

### No Code Changes Needed
The existing Edge Functions are already correctly coded for GHL v1 API. We just need a valid Location API key.

