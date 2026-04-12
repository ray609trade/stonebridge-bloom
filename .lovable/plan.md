

# Add Guest Order Confirmation Email + Replace Twilio with GoHighLevel for SMS/Calls

## Overview
Two changes: (1) Send order confirmation emails to guests via Lovable's built-in email, and (2) replace the existing Twilio SMS integration with GoHighLevel for SMS and calls.

## Prerequisites

### Email Domain Setup (Required First)
No email domain is configured yet. Before any email can be sent, you need to set up an email domain through Lovable. This is a one-time setup step — you'll be prompted to enter your domain and configure DNS records.

## Step 1: Set Up Email Infrastructure
- Configure an email domain (you'll see a setup dialog)
- Run email infrastructure setup (creates database tables, queues, cron jobs)
- Scaffold transactional email functions (creates the Edge Function and template system)

## Step 2: Create Order Confirmation Email Template
- Create a branded React Email template (`order-confirmation.tsx`) in the shared templates folder
- Style it to match Stonebridge Bagels branding: warm cream tones, Playfair Display headings, golden amber accents
- Template will include: order number, item list, totals, pickup time, and store info
- Register the template in the template registry

## Step 3: Wire Up Email Sending in Checkout
- After a successful order insert in `src/pages/Checkout.tsx`, invoke the `send-transactional-email` Edge Function
- Pass the customer's email, order number, items, and totals as template data
- Use an idempotency key based on order ID to prevent duplicate emails

## Step 4: Create Unsubscribe Page
- Add a simple unsubscribe page at an available route (e.g., `/unsubscribe`)
- Matches the app's existing design

## Step 5: Replace Twilio with GoHighLevel for SMS/Calls
- Update `supabase/functions/send-order-notification/index.ts` to call the GHL API instead of Twilio
- GHL API endpoint for SMS: `POST https://rest.gohighlevel.com/v1/conversations/messages`
- Add a `GHL_API_KEY` secret (you'll be prompted to enter your GoHighLevel API key)
- Remove Twilio credential references from the notification function
- Keep the same admin UI trigger — just change the backend provider

## Step 6: Deploy and Test
- Deploy all updated Edge Functions
- Test guest checkout end-to-end to verify email arrives
- Test admin "notify customer" button to verify GHL SMS works

---

## Technical Details

**Email template data passed from checkout:**
```
templateName: 'order-confirmation'
recipientEmail: formData.email
idempotencyKey: `order-confirm-${data.id}`
templateData: { name, orderNumber, items, subtotal, tax, total, pickupTime, pickupType }
```

**GHL SMS API call (replacing Twilio):**
```
POST https://rest.gohighlevel.com/v1/conversations/messages
Headers: { Authorization: Bearer GHL_API_KEY }
Body: { type: 'SMS', contactId or phone, message }
```

**Files changed:**
- `supabase/functions/_shared/transactional-email-templates/order-confirmation.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/registry.ts` (updated)
- `src/pages/Checkout.tsx` (add email invoke after order insert)
- `src/pages/Unsubscribe.tsx` (new)
- `src/App.tsx` (add unsubscribe route)
- `supabase/functions/send-order-notification/index.ts` (replace Twilio with GHL)

**New secret required:** `GHL_API_KEY` — your GoHighLevel API key (found in GHL Settings → Business Profile → API Key, or Settings → Integrations → API Keys)

