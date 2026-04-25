## Guest Order Lookup — Order # + Email

A friendly, step-by-step lookup flow at `/order/lookup`, gated by order number + the email used at checkout. Shows full order details with a one-tap "Reorder these items" button.

### How it works

1. Customer clicks **"Look up your order"** in the footer.
2. Step 1 of 2: enters their **order number** (placeholder shows `SB-YYMMDD-XXXX` format with helper text "Find this in your confirmation email or text").
3. Step 2 of 2: enters the **email address used at checkout**.
4. On submit we call a server function that returns the order **only if both fields match** (case-insensitive email). 
5. Success → full order details page (items, qty, totals, pickup time, status, customer name) with a sticky **"Reorder these items"** button that adds everything back to the cart and routes to `/order/checkout`.
6. Failure → friendly inline error: "We couldn't find an order with that number and email. Double-check both fields, or call us at (609) 738-3222." No info leaked about which field was wrong.

### Security model

- A `SECURITY DEFINER` Postgres function `lookup_guest_order(p_order_number text, p_email text)` does the matching. RLS on `orders` stays strict — no anonymous SELECT.
- The function does a case-insensitive comparison on both fields and only returns rows where **both match exactly**. No "fuzzy" matching.
- **Rate limiting** to prevent brute-forcing order numbers: track lookup attempts per IP in a small `order_lookup_attempts` table; the function blocks after 10 failed attempts in 15 minutes from the same IP and returns a generic "too many attempts" error.
- Wholesale orders are excluded from this guest lookup (they go through the wholesale portal).

### UX details (the "refined" part)

**Lookup page (`/order/lookup`)**
- Two-step wizard with a clear progress indicator ("Step 1 of 2 · Order Number").
- Each step has: heading, one input, helper text below, one primary button, "Back" link on step 2.
- Live validation: order number is normalized to uppercase and pattern-checked (`SB-` prefix expected) before allowing step 2.
- Email is trim+lowercased before submit.
- On error, focus returns to the first field and a non-dismissible inline message appears above step 1.
- Loading state on the submit button ("Looking up your order...").
- "Need help? Call (609) 738-3222" footer below the form.

**Result view (same page, swapped after success)**
- Big green check + "Order found" heading + order number + status pill (Pending / Preparing / Ready / Picked up / Cancelled).
- Pickup time, pickup type, customer name, contact info.
- Itemized list with quantities and per-line price; subtotal / tax / total.
- Sticky bottom bar (mobile) and inline button (desktop): **"Reorder these items"** → repopulates cart, toast "Items added to your cart", navigates to `/order/checkout`.
- Secondary buttons: "Look up another order" and "Back to menu".

**Confirmation page tweak (`/order/confirmation/:orderNumber`)**
- Add a small "Save this link or look it up later at /order/lookup" hint so customers know how to come back.

**Footer**
- Add a "Look up your order" link in the Quick Links section.

### Files changed / created

- **Migration**:
  - `lookup_guest_order(text, text)` function (SECURITY DEFINER, returns full order row)
  - `order_lookup_attempts` table + cleanup logic + rate-limit check inside the function
  - `GRANT EXECUTE ... TO anon, authenticated`
- **New** `src/pages/OrderLookup.tsx` — two-step wizard + result view
- `src/App.tsx` — add `/order/lookup` route
- `src/components/layout/Footer.tsx` — add "Look up your order" link
- `src/pages/OrderConfirmation.tsx` — add small lookup hint
- `src/hooks/useCart.tsx` — verify `addItem`/bulk-add path supports a "reorder" helper (add one if missing)
