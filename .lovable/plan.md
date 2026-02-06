

# Order Ready Text Notifications

## Overview
Send customers a text message (SMS) when their order is marked as "Ready" for pickup. Email notifications are excluded - text only.

---

## What You'll Get

- **Instant Text Alerts**: Customers receive an SMS the moment their order is ready
- **Simple Admin Flow**: Notification sends automatically when status changes to "Ready"
- **Manual Resend**: Option to resend notification if needed

---

## How It Will Work

1. Staff updates order status to "Ready" in the admin panel
2. Customer receives a text message:
   > "Your Stonebridge Bagels order #SB-260206-0127 is ready for pickup! 🥯"
3. Admin sees confirmation that the text was sent

---

## Implementation Steps

### Step 1: Set Up Twilio Account
Twilio is the industry standard for business SMS. You'll need:
- Account SID (your account identifier)
- Auth Token (your password)
- A phone number to send from

I'll guide you through getting these from twilio.com.

### Step 2: Create Notification Edge Function
A backend function that:
- Receives order ID when status changes
- Looks up customer phone number
- Sends SMS via Twilio API
- Returns success/failure

### Step 3: Update Admin Panel
When order status changes to "Ready":
- Automatically call the notification function
- Show "Text sent" confirmation
- Handle cases where customer has no phone number

---

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/send-order-notification/index.ts` | SMS sending logic |

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio authentication |
| `TWILIO_PHONE_NUMBER` | The "from" phone number (e.g., +16095551234) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Admin.tsx` | Trigger notification on status change to "Ready" |
| `src/components/admin/OrderDetailModal.tsx` | Add notification status indicator |

### SMS Message

```text
Your Stonebridge Bagels order #{order_number} is ready for pickup! 🥯
```

---

## Setup Steps

1. **Create Twilio Account**:
   - Go to twilio.com and sign up (free trial available)
   - From the Console Dashboard, copy your Account SID and Auth Token
   - Buy a phone number ($1/month) or use trial number for testing

2. **Add Credentials**:
   - I'll request each credential securely when we implement

3. **Test**:
   - Place a test order with your phone number
   - Mark it as "Ready"
   - Verify you receive the text

---

## Notes

- SMS costs ~$0.0079 per message with Twilio
- Trial accounts can only text verified phone numbers (upgrade for production)
- Orders without a phone number will skip notification (no error shown)
- Phone numbers in database should include country code (e.g., +1 for US)

