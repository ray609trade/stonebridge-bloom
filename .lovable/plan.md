

## Add SEO Head Tags to Bulk Orders & Checkout Pages

### Changes

Add the `SEOHead` component to the 4 remaining pages that lack it:

1. **`src/pages/Wholesale.tsx`** — "Buy by the Dozen — Bulk Bagel Orders" with path `/wholesale`
2. **`src/pages/WholesaleLogin.tsx`** — "Wholesale Login" with path `/wholesale/login`
3. **`src/pages/WholesaleCheckout.tsx`** — "Wholesale Checkout" with path `/wholesale/checkout`
4. **`src/pages/Checkout.tsx`** — "Checkout — Place Your Pickup Order" with path `/checkout`

Each page gets an import of `SEOHead` and a `<SEOHead>` tag placed right after the outermost wrapper div opens, with a relevant title and description.

### Files Changed
- `src/pages/Wholesale.tsx`
- `src/pages/WholesaleLogin.tsx`
- `src/pages/WholesaleCheckout.tsx`
- `src/pages/Checkout.tsx`

