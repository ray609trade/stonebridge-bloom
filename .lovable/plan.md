## What this fixes

1. **Bagels need a spread choice.** Today the "Spread" option on bagel products is marked optional, so customers can add a bagel without picking. We'll make it required, and we'll force the modal to open (instead of a silent quick-add) on every bagel — even when the customer taps the small "+" button on the row.
2. **Last menu items get hidden on mobile.** On `/order` the bottom mobile nav (64px) plus the floating "View Cart" button (~56px at `bottom-20`) overlap the last 1–2 product rows so they can't be tapped or read. We'll add enough bottom padding to the page when the floating cart is visible.

## Changes

### 1. Require spread on all bagel products (database)

Update the three bagel products (`One Bagel`, `1/2 Dozen Bagels`, `Dozen Bagels`) so the existing "Spread" option has `required: true`. Spread choices already exist (Plain, Butter, Cream Cheese, etc.) — only the flag changes.

### 2. Enforce required options in the product modal

`src/components/menu/ProductModal.tsx`:
- Disable the "Add" button (both desktop and mobile sticky footer) until every option flagged `required: true` has a selection.
- When disabled, show a subtle hint under the Add button on mobile: "Pick a spread to continue".
- Keep the existing star indicator on required option headings.

### 3. Quick-add on the menu row should always open the modal for bagels

`src/components/menu/ProductCard.tsx`:
- Quick-add already opens the modal when a product has options, so bagels will route through the modal automatically once they're marked required. No behavior change needed beyond the data update — confirming this works after step 1.

### 4. Stop the floating cart bar from covering menu items

`src/pages/Order.tsx`:
- When the floating "View Cart" button is showing on mobile, increase the page bottom padding from `pb-20` to `pb-44` so the last product cards clear both the cart bar and the bottom nav.
- Keep `pb-20` when the cart is empty (only the bottom nav is visible).

## Technical notes

- Required-option enforcement is purely client-side gating; the server-side `recalculate_order_totals` trigger continues to recompute prices, so add-on prices for spreads remain authoritative.
- The DB update is a small `UPDATE products SET options = ...` for the three bagel rows; no schema change.
- No changes to wholesale flow — wholesale uses its own menu/cart components.

## Out of scope

- No redesign of the modal layout or menu cards.
- No changes to other categories' option requirements (sandwiches, breakfast, etc.).
