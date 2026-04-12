

## Send Email on Wholesale Application Approval/Rejection

### Overview
When an admin approves or rejects a wholesale application in the Leads tab, send an email notification to the applicant via GoHighLevel (matching the existing email pattern used for order confirmations).

### Changes

**1. New Edge Function: `supabase/functions/send-wholesale-status-email/index.ts`**
- Accepts `email`, `contactName`, `businessName`, and `status` (approved/rejected)
- Sends email via GHL API (same pattern as `send-order-email`)
- Approved email: congratulates them, tells them they can now log in at the wholesale portal
- Rejected email: politely informs them the application was not approved at this time
- Set `verify_jwt = false` in `supabase/config.toml`

**2. Update `src/components/admin/shipping/LeadsTab.tsx`**
- After the `updateStatus` mutation succeeds, call `supabase.functions.invoke('send-wholesale-status-email', ...)` with the account's email, contact name, business name, and new status
- Show a toast on email success/failure (non-blocking — status update still succeeds even if email fails)

### Email Content

**Approved:**
> Subject: Your Wholesale Application Has Been Approved! | Stonebridge Bagels
>
> Hi [Contact Name], Great news! Your wholesale application for [Business Name] has been approved. You can now log in to our wholesale portal to browse products and place orders. — Stonebridge Bagels

**Rejected:**
> Subject: Wholesale Application Update | Stonebridge Bagels
>
> Hi [Contact Name], Thank you for your interest in partnering with Stonebridge Bagels. Unfortunately, we're unable to approve your wholesale application for [Business Name] at this time. If you have questions, please reach out to us. — Stonebridge Bagels

