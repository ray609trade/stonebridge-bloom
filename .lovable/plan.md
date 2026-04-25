# Wholesale Portal Responsive Polish

Goal: make the entire bulk-order flow feel intentional and easy to use on any device — from the public account application all the way through checkout. No new features, no logic changes, only layout, spacing, and breakpoint tuning.

## Pages & components in scope

1. **Wholesale account application** (`/wholesale` — `src/pages/Wholesale.tsx`)
2. **Wholesale login / signup** (`/wholesale/login` — `src/pages/WholesaleLogin.tsx`)
3. **Wholesale portal** (`/wholesale/portal` — `src/pages/WholesalePortal.tsx`)
4. **Wholesale menu** (`src/components/wholesale/WholesaleMenu.tsx`)
5. **Wholesale cart drawer** (`src/components/wholesale/WholesaleCartDrawer.tsx`)
6. **Wholesale checkout** (`/wholesale/checkout` — `src/pages/WholesaleCheckout.tsx`) — this is the recurring-template-style order form
7. **Order history card** (`src/components/wholesale/OrderHistoryCard.tsx`)

## Targets

- Mobile (≤640px): 16px inputs (no iOS zoom), `h-12` thumb-friendly controls, sticky CTAs above MobileBottomNav with safe-area padding, no horizontal scroll, content not hidden behind sticky bars.
- Tablet (641–1024px): 2-column form layouts where natural, generous gutters.
- Desktop (≥1025px): max-width caps (forms `max-w-2xl`, page shell `max-w-6xl`), sticky 2-col layout for checkout (form 2/3, summary 1/3).
- Consistency: same heading scale, button heights, card radii sitewide.

## Specific changes

### Wholesale (account application)
- Cap form card width and align with site rhythm.
- Tighten hero top padding on mobile so headline doesn't push too low.
- Application form: ensure 2-col fields collapse to 1-col under `sm`, all inputs already `h-12` — verify and add `text-base` where missing.
- Submit button: full-width on mobile, auto-width right-aligned on `sm+`; add safe-area bottom padding on the page so the button isn't covered by `MobileBottomNav`.
- Benefits grid: keep 2-col mobile / 4-col desktop but tighten gap on small phones.

### WholesaleLogin
- Cap card to `max-w-md` (already), but reduce top padding on mobile (`pt-20 md:pt-28`).
- Make tab triggers larger tap targets on mobile.
- OAuth buttons: keep stacked, add subtle spacing.
- Forgot-password inline panel: ensure it doesn't overflow the card on 320px screens.

### WholesalePortal
- Account header: stack avatar/name and Sign Out vertically on mobile (already does), but reduce vertical padding so the menu starts higher on phones.
- Tabs row: add horizontal scroll fallback and consistent active underline thickness; increase tap height to 48px on mobile.
- Stats grid: 2-col mobile / 4-col desktop (already), tighten label/value font size scaling.
- Search input: full-width on mobile, `max-w-md` on desktop (already).
- Floating cart button: ensure it sits above `MobileBottomNav` (raise `bottom-24` on mobile) and respects safe-area inset.

### WholesaleMenu
- Product cards: confirm 1/2/3 column grid, consistent gap (`gap-3 md:gap-4`).
- Card internal layout: image + info + qty controls — on very narrow screens (≤360px), let qty controls and Add button stack to two rows so nothing clips.
- Category pills: confirm horizontal scroll with `scrollbar-hide` and `snap-x`.

### WholesaleCartDrawer
- Sheet: full-width on mobile, `sm:max-w-md` on tablet+ (already).
- Footer "Proceed to Checkout" button: add `pb-[calc(1.25rem+env(safe-area-inset-bottom))]` on the footer wrapper for notched phones.
- Item rows: ensure long product names truncate cleanly; price column never wraps.

### WholesaleCheckout (recurring-template-style order form)
- Page shell: cap to `max-w-6xl mx-auto`.
- Layout: 1-col mobile, 3-col grid on `lg+` (form `lg:col-span-2`, summary `lg:col-span-1` sticky `top-24`) — already in place; tighten padding and fix order of summary on tablet.
- Step indicator: on mobile, show only icons (already hides label `<sm`); make pill heights uniform `h-10`.
- Address fields: City/State on one row at `sm+`, ZIP/Country on one row at `sm+`, all inputs `h-12 text-base`.
- Notes textarea: `min-h-[100px]`, full width.
- Mobile collapsible summary: ensure the chevron and total stay aligned on 320px screens; add `truncate` on item names inside the expanded list.
- Sticky mobile "Place Order" bar: add safe-area bottom padding and increase bottom inset so it sits above `MobileBottomNav`. Add matching `pb-40` to the page so the form's last field isn't hidden.
- Desktop submit button inside the form (already `hidden md:flex`): keep, ensure it appears only when sticky bar is hidden.

### OrderHistoryCard
- Header row on mobile: order number + status badge can wrap (already `flex-wrap`); ensure total stays right-aligned and chevron doesn't get pushed off.
- Expanded status timeline: ensure step labels don't overlap on 320px — shorten to abbreviations under `sm`.
- Tracking + Ship-To grid: 1-col mobile / 2-col `md+` (already).

## Technical Details

- All changes are Tailwind class adjustments and a few small wrapper restructures. No new dependencies, no DB or RLS changes, no business-logic edits.
- No changes to `useWholesaleCart`, routing, or Supabase queries.
- After edits, spot-check at 320px, 375px, 768px, 1024px, and 1440px viewports for: horizontal scroll, sticky-bar overlap with bottom nav, input zoom on iOS, card alignment.

## Out of scope

- New features (e.g., true recurring-order scheduling backend).
- Visual redesign (colors, fonts, illustrations).
- Admin-side wholesale tools.
