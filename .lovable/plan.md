

# Wholesale Portal Premium Enhancement

## Overview
Upgrade the wholesale portal's order history with itemized product details, tracking info, and delivery status. Enhance the overall wholesale UI/UX to feel premium and polished.

## Changes

### 1. Enhanced Order History with Expandable Order Details (`src/pages/WholesalePortal.tsx`)
- Replace the flat order list with expandable order cards that reveal:
  - **Itemized products**: parse the `items` JSONB to show each product name, quantity, unit price, and line total
  - **Tracking info**: show `tracking_number` and `carrier_code` when available, with a "Track Package" link
  - **Delivery status**: show `shipped_at` date, shipping address, and a visual status timeline (Pending → Confirmed → Preparing → Shipped → Completed)
- Add order status filter pills (All, Pending, In Transit, Completed)
- Add a summary stats bar at the top: total orders, total spent, last order date

### 2. Premium UI Polish Across Wholesale Pages
- **WholesalePortal.tsx**: Upgrade the account header with a subtle gradient background, refined typography hierarchy, and better spacing. Add a skeleton loading state instead of plain "Loading..." text.
- **WholesaleMenu.tsx**: Add hover elevation transitions on product cards, subtle gradient overlays on images, and smoother quantity stepper animations. Improve the empty state illustration.
- **WholesaleCartDrawer.tsx**: Add a subtle progress indicator, improve spacing and typography, polish the footer with a more prominent CTA.
- **WholesaleLogin.tsx**: Add a branded illustration/icon in the header area, refine form field styling with focus ring animations.
- **WholesaleCheckout.tsx**: Add step indicators (Account → Shipping → Review), improve card styling with subtle shadows.

### 3. New Component: Order Detail Accordion (`src/components/wholesale/OrderHistoryCard.tsx`)
- Reusable expandable card component showing:
  - Collapsed: order number, date, total, status badge, item count
  - Expanded: full item list table, shipping address, tracking link, status timeline, notes
- Uses Framer Motion for smooth expand/collapse
- Responsive: stacks vertically on mobile with touch-friendly tap targets

## Technical Details

**Files modified:**
- `src/pages/WholesalePortal.tsx` — order history section rewrite, premium header, stats bar
- `src/components/wholesale/WholesaleMenu.tsx` — card hover effects, polish
- `src/components/wholesale/WholesaleCartDrawer.tsx` — UI refinements
- `src/pages/WholesaleLogin.tsx` — premium form styling
- `src/pages/WholesaleCheckout.tsx` — step indicators, card shadows

**Files created:**
- `src/components/wholesale/OrderHistoryCard.tsx` — expandable order detail component

**No database changes required.** All data (`items`, `tracking_number`, `carrier_code`, `shipped_at`, `ship_to_address`, `status`) already exists in the `orders` table.

**Design tokens used:** Existing warm cream/espresso/amber palette from `index.css`. Card shadows use `--card-shadow` and `--card-shadow-hover` custom properties already defined.

