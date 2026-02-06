

# Wholesale Order System Implementation Plan

## Problem Summary

Currently, the system only supports **retail orders**. While businesses can request a wholesale account via the `/wholesale` page, there is no way for approved wholesale customers to actually **place wholesale orders**. All orders created through the checkout go to the `orders` table with `order_type: "retail"`.

## Solution Overview

Build a complete wholesale ordering experience that allows approved wholesale accounts to:
1. Log in to their wholesale portal
2. Browse wholesale-priced products
3. Place orders that get marked as `order_type: "wholesale"`
4. View their order history

---

## Implementation Steps

### Phase 1: Wholesale Authentication

**Create wholesale login page** (`/wholesale/login`)
- Email/password authentication
- Link wholesale accounts to auth users via `user_id` column

**Create wholesale portal page** (`/wholesale/portal`)
- Protected route requiring wholesale account with "approved" status
- Dashboard showing order history and quick reorder

### Phase 2: Wholesale Menu & Cart

**Create wholesale menu component**
- Display products with wholesale pricing (`wholesale_price` column)
- Show wholesale minimum quantities
- Filter categories by `visibility: "wholesale"` or `visibility: "both"`

**Create wholesale cart context**
- Separate from retail cart
- Enforce minimum order quantities
- Calculate wholesale pricing

### Phase 3: Wholesale Checkout

**Create wholesale checkout page** (`/wholesale/checkout`)
- Pre-populate from logged-in wholesale account
- Shipping address form
- Payment method: "Pay by Invoice"
- Save orders with:
  - `order_type: "wholesale"`
  - `wholesale_account_id: [account_id]`
  - `ship_to_address: { ... }`

### Phase 4: Admin Integration

**Update Admin Orders tab**
- Already shows `order_type` column
- Orders will appear with "wholesale" badge

**Update Shipping tab** (`ShipmentsTab.tsx`)
- Filter to show only `order_type: "wholesale"` orders
- Enable ShipStation sync functionality

---

## Technical Details

### Database Changes Required

None - the schema already supports wholesale orders:
- `orders.order_type` supports `"wholesale"`
- `orders.wholesale_account_id` exists for linking
- `orders.ship_to_address` (jsonb) exists for shipping info
- `wholesale_accounts.user_id` exists for auth linking

### New Files to Create

```text
src/pages/WholesaleLogin.tsx      - Login page for wholesale customers
src/pages/WholesalePortal.tsx     - Dashboard for approved wholesale accounts
src/pages/WholesaleCheckout.tsx   - Checkout flow for wholesale orders
src/hooks/useWholesaleCart.tsx    - Cart context for wholesale orders
src/components/wholesale/
  WholesaleMenu.tsx               - Product listing with wholesale prices
  WholesaleCartDrawer.tsx         - Cart drawer for wholesale
```

### Route Updates (App.tsx)

```text
/wholesale/login     - WholesaleLogin
/wholesale/portal    - WholesalePortal (protected)
/wholesale/checkout  - WholesaleCheckout (protected)
```

### RLS Policy Updates

The existing policies should work:
- `wholesale_accounts` allows users to view their own account
- `orders` allows users to view orders where `user_id = auth.uid()`

May need to add policy for wholesale users inserting orders with their `wholesale_account_id`.

---

## Estimated Effort

| Phase | Description | Complexity |
|-------|-------------|------------|
| 1 | Authentication | Medium |
| 2 | Menu & Cart | Medium |
| 3 | Checkout | Medium |
| 4 | Admin Integration | Low (mostly exists) |

---

## Alternative: Quick Fix

If you need wholesale orders to appear quickly without building the full portal, I can:
1. Add a "wholesale" toggle to the existing checkout
2. Allow manual order creation in admin

Would you like to proceed with the full wholesale portal implementation, or start with the quick fix?

