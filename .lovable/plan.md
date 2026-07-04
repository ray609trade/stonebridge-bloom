# Fix desktop modal scroll + verify mobile product list

Two related layout issues to close out:

## 1. Desktop ProductModal doesn't scroll
`src/components/menu/ProductModal.tsx` outer wrapper uses `max-h-[90vh]` with `overflow-hidden`, and inner scroll uses `h-full overflow-y-auto`. Because the outer has no fixed height, `h-full` collapses and the scroll never activates — at ~590px viewport height the bottom spreads and Add-to-Cart button are unreachable.

**Fix:** convert the modal panel to a flex column and let the scroll area grow.
- Outer `motion.div`: add `flex flex-col`.
- Inner scroll wrapper: replace `h-full` with `flex-1 min-h-0 overflow-y-auto`.
- Keep mobile bottom-sheet behavior (drag handle, sticky footer) unchanged.

## 2. Verify mobile product list on `/order`
`src/pages/Order.tsx` already applies `pb-44` when `isMobile && itemCount > 0` to clear the floating cart + bottom nav. Verify across common breakpoints that:
- Every `ProductCard` is fully visible and tappable, including the last item.
- The floating "View Cart" button doesn't cover the last product's "+" button.
- Category pill row stays horizontally scrollable.

**Verification (Playwright, headless Chromium):**
- Viewports: 375×667 (iPhone SE), 390×844 (iPhone 14), 414×896 (iPhone 11 Pro Max).
- Steps: load `/order`, add one bagel via modal to force `itemCount > 0`, scroll to the bottom of the product grid, screenshot, confirm the last card's "+" button is not overlapped by the floating cart bar or bottom nav.
- If overlap is detected on any viewport, increase the mobile bottom padding (e.g. `pb-48`) or restructure the floating cart offset so the last card clears both bars.

## Scope
Frontend/presentation only — no cart logic, DB, or business-rule changes.
