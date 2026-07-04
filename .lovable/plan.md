# Hard guard for row-level "+" quick-add

The previous change to `src/components/menu/ProductCard.tsx` already routes any product with options through the modal. This plan adds a stricter guard so the quick-add path can never bypass required options, even in edge cases (missing `onSelect`, malformed options data, future callers).

## Change
Update `handleQuickAdd` in `src/components/menu/ProductCard.tsx`:

1. Normalize `product.options` defensively — treat non-array or empty as "no options".
2. If any option has `required === true`:
   - Always call `onSelect()` when provided.
   - If `onSelect` is missing, show `toast.error("Please choose options for {product.name}")` and return. Never call `addItem`.
3. If options exist but none are required:
   - Prefer `onSelect()` (opens modal so the user can pick).
   - Only allow the direct quick-add fallback when neither options nor `onSelect` are present.
4. Also guard the card-level `onClick={onSelect}`: no behavior change, but confirm it's the only other add path.

## Verification
- Typecheck.
- Playwright on mobile viewport: tap "+" on a bagel → spread modal opens; "Add" stays disabled until a spread is picked.
- Tap "+" on a product with no options → adds directly as today.
