# Sync to latest, then harden quick-add

## Step 1 — Sync
Pull the latest project state before making changes so the edit applies cleanly on top of current `ProductCard.tsx`.

## Step 2 — Harden the row-level "+" quick-add
Update `src/components/menu/ProductCard.tsx` so any product with options (bagels included) can never be added to the cart without going through the configuration modal.

### Technical details
In `handleQuickAdd`:
- Compute `hasRequiredOptions` from `product.options`.
- If the product has options:
  - If `onSelect` is provided → call `onSelect()` to open the modal (current behavior).
  - If `onSelect` is missing but a required option exists → show `toast.error("Please choose options for {product.name}")` and return.
  - Never fall through to `addItem` when options exist.
- Non-option products continue to quick-add as today.

No changes to `ProductModal.tsx`, cart logic, or database — required-option gating in the modal is already in place from the prior change.

## Verification
- Typecheck.
- Confirm on mobile: tapping "+" on a bagel opens the spread modal; "Add" stays disabled until a spread is chosen.
