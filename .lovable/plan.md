# Responsive Polish Pass — Mobile, Tablet & Desktop

Goal: make every customer-facing page feel intentional at any screen size — no cramped buttons on phones, no awkward stretched columns on desktops, and consistent spacing/typography across the site. No new features, no behavior changes.

## Scope (pages we'll touch)

1. **OrderLookup** (`/order/lookup`) — your current page
2. **Order menu** (`/order`)
3. **Checkout** (`/order/checkout`)
4. **OrderConfirmation** (`/order/confirmation`)
5. **CartDrawer**
6. **Header** + **Footer** + **MobileBottomNav**
7. **Home** (Hero, FeaturedProducts, LocationSection, Testimonials)
8. **About**

## What "perfect" means here

- **Mobile (≤640px)**: 16px+ tap targets, 16px font on inputs (prevents iOS zoom), no horizontal scroll, sticky CTAs don't cover content, safe-area padding for notched phones, bottom-nav clearance.
- **Tablet (641–1024px)**: 2-column layouts where appropriate (item lists, forms with summary), generous gutters, no orphaned single columns.
- **Desktop (≥1025px)**: max-width caps so text/forms don't stretch absurdly wide, clear hierarchy, hover states.
- **Consistency**: same heading scale, button heights, card radii, and section padding rhythm sitewide.

## Specific fixes

### OrderLookup
- Tighten top padding (`pt-28 md:pt-32` → `pt-24 md:pt-28`) so heading isn't pushed too low on phones.
- Ensure all inputs use `text-base` (already done) and `h-12` for thumb-friendly targets.
- Result view: stack status + pickup vertically on `<sm`, side-by-side on `≥sm` (currently uses `flex-wrap` which can look uneven). Add `min-w-0` and truncation on long emails.
- Sticky mobile reorder bar: add `pb-[calc(...+env(safe-area-inset-bottom))]` (already present) and ensure result content has matching bottom padding so the last total row isn't hidden behind it.
- Desktop: cap card to `max-w-xl` (already), but lift action buttons row to align nicely; add subtle divider above totals.

### Order menu (`/order`)
- Verify category tabs scroll horizontally on mobile without clipping; add `scrollbar-hide` and snap.
- Product cards: 1 col mobile, 2 col `sm`, 3 col `lg`; equalize image aspect ratios.

### Checkout
- On mobile, place order summary in a collapsible drawer/accordion at the top so the form is reachable.
- Desktop: 2-column layout (form left 2/3, sticky summary right 1/3) capped at `max-w-6xl`.
- All inputs `h-12`, full-width, with clear labels above (not floating).

### OrderConfirmation
- Center column capped `max-w-xl`; ensure the new "Look up your order" hint sits inside the card with consistent padding.
- Action buttons stack on mobile, inline on `≥sm`.

### CartDrawer
- Full-height sheet on mobile with sticky checkout button at bottom respecting safe area.
- Desktop: 420px wide right-side drawer.

### Header
- Logo: `h-10 md:h-16 lg:h-20` (current `h-12 md:h-20 lg:h-24` is oversized on small phones and pushes layout).
- Mobile menu: ensure full-screen overlay clears the header (currently `top-14` ✓) and content is scrollable.

### Footer
- Mobile accordion already in place; tighten vertical rhythm and ensure quick-action call/directions buttons don't wrap.
- Desktop: keep 4-column grid; verify `Look up your order` link wraps cleanly on narrow desktop widths.

### MobileBottomNav
- Confirm 64px height + safe-area; verify it doesn't overlap sticky page CTAs (lookup page reorder bar should sit above it on mobile).

### Home page
- Hero: clamp title with `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`; ensure CTA buttons stack on mobile.
- FeaturedProducts: 1/2/3 column grid by breakpoint with consistent gap.
- LocationSection map: aspect-ratio container so it doesn't collapse on mobile.
- Testimonials: snap-x carousel on mobile, 3-up grid on desktop.

### Global
- Add a small `.container` review pass: most pages should use `container mx-auto px-4 md:px-6` consistently.
- Confirm `body` font sizes don't shrink below 14px anywhere.
- Add `overflow-x-hidden` safety on `<html>`/`<body>` to prevent rogue horizontal scroll.

## Technical Details

- All changes are Tailwind class adjustments + a few small wrapper structure tweaks. No new dependencies.
- No database, RLS, or edge function changes.
- No changes to `useCart`, routing, or business logic.
- QA: after edits, spot-check each page at 375px, 768px, 1024px, 1440px viewports.

## Out of Scope

- Admin pages, Wholesale portal, Auth pages (unless quick win surfaces).
- Visual redesign / new components / color or font changes.
- Dark mode polish.
