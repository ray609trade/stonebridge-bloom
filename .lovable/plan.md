
# Mobile-First Optimization Plan for Stonebridge Bagels

## Overview
Since 80%+ of customers will access the site on mobile devices, we need to ensure a truly mobile-first experience while maintaining an excellent desktop experience. This plan focuses on touch-friendly interactions, optimized layouts, improved tap targets, and streamlined mobile navigation.

---

## 1. Header & Navigation Improvements

### Mobile Enhancements
- Increase header height on mobile for better tap targets (h-16 → h-14 with better padding)
- Make the hamburger menu icon larger (5×5 → 6×6) for easier tapping
- Add a sticky "Order Now" button in mobile header for quick access
- Improve mobile menu drawer with full-screen overlay, larger touch targets, and smooth animations
- Add bottom navigation bar for mobile with Home, Order, Cart, and Menu icons (common pattern for food ordering apps)

### Desktop Preservation
- Keep current horizontal navigation
- Maintain logo sizing and positioning

---

## 2. Hero Section Mobile Optimization

### Mobile Changes
- Reduce hero height on mobile (`min-h-[85vh]` instead of `min-h-screen`) to show content "below the fold" hint
- Increase text size hierarchy for mobile readability (`text-4xl` on mobile, scaling up)
- Make CTA buttons full-width on mobile for easier tapping
- Stack buttons vertically on mobile instead of side-by-side
- Reduce animation intensity on mobile for better performance
- Hide scroll indicator on mobile (takes up valuable space)

### Desktop Preservation
- Keep parallax effects and full animations
- Maintain current sizing and layout

---

## 3. Product Cards & Menu Page

### Mobile-First Cards
- Single column layout on mobile (currently jumps to 2 cols too early)
- Larger touch targets for the "Add to Cart" button
- Make entire card tappable (not just the + button)
- Add swipe gestures for quick add-to-cart on mobile
- Reduce image aspect ratio on mobile (`aspect-[3/2]` → `aspect-[16/9]`) for more compact view
- Show price more prominently on mobile

### Order Page Improvements
- Horizontal scrolling category pills with larger touch targets
- Sticky search bar when scrolling on mobile
- Add a floating cart button with item count (visible without scrolling)
- Implement "pull to refresh" pattern for mobile

---

## 4. Product Modal Mobile Experience

### Bottom Sheet Design (Mobile)
- Convert modal to full bottom sheet on mobile (already partially implemented)
- Make it draggable to dismiss
- Larger option selection buttons with better spacing
- Sticky "Add to Order" button at bottom
- Simplify quantity controls with larger touch targets

### Desktop
- Keep current centered modal behavior

---

## 5. Cart Drawer Mobile Optimization

### Mobile Changes
- Full-screen cart on mobile instead of side drawer
- Larger quantity adjustment buttons
- Swipe-to-delete items
- Sticky checkout button at bottom
- Add haptic-style visual feedback on interactions

---

## 6. Checkout Page Mobile UX

### Form Optimization
- Single-column layout throughout on mobile
- Larger form inputs (`h-12` → `h-14`) for easier tapping
- Radio buttons converted to large tappable cards
- Time slot picker as horizontal scrollable pills
- Sticky order summary that expands on tap
- Progress indicator at top showing checkout steps

---

## 7. Footer Mobile Layout

### Compact Mobile Footer
- Collapse sections into accordions on mobile
- Prominent "Call" and "Directions" buttons at top
- Reduce vertical spacing
- Social icons in a horizontal row

---

## 8. Global Mobile Improvements

### Touch Interactions
- Increase all button min-heights to 44px (Apple's recommended minimum)
- Add `active:scale-95` feedback on all interactive elements
- Increase spacing between clickable elements
- Add `-webkit-tap-highlight-color: transparent` and proper touch feedback

### Performance
- Reduce/simplify Framer Motion animations on mobile
- Lazy load images with blur placeholders
- Reduce parallax effects on mobile (or disable)

### Typography
- Slightly increase base font size on mobile (16px minimum)
- Improve line heights for touch readability
- Ensure adequate contrast ratios

---

## 9. New Mobile-Specific Components

### Bottom Navigation Bar
Create a fixed bottom navigation bar for mobile with:
- Home icon
- Order/Menu icon
- Cart icon (with badge)
- Account/More icon

This is standard for food ordering apps and provides one-thumb navigation.

### Floating Cart Button
When not on Order page, show a floating cart button on mobile to encourage ordering.

---

## Technical Approach

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Header.tsx` | Mobile nav improvements, sticky order button |
| `src/components/layout/Footer.tsx` | Accordion collapse for mobile |
| `src/components/home/Hero.tsx` | Mobile height, button stacking, reduced animations |
| `src/components/home/FeaturedProducts.tsx` | Mobile grid tweaks |
| `src/components/home/HowItWorks.tsx` | Mobile step layout |
| `src/components/home/Testimonials.tsx` | Horizontal scroll on mobile |
| `src/components/home/LocationSection.tsx` | Stacked layout, larger buttons |
| `src/components/menu/ProductCard.tsx` | Larger touch targets, mobile sizing |
| `src/components/menu/ProductModal.tsx` | Full bottom sheet, sticky add button |
| `src/components/cart/CartDrawer.tsx` | Full screen on mobile, swipe gestures |
| `src/pages/Order.tsx` | Sticky search, floating cart, category pills |
| `src/pages/Checkout.tsx` | Single column forms, larger inputs |
| `src/index.css` | Global mobile utilities, touch feedback |
| `tailwind.config.ts` | Add safe-area utilities for notched phones |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/layout/MobileBottomNav.tsx` | Bottom navigation bar component |
| `src/components/ui/FloatingCartButton.tsx` | Floating cart indicator |

---

## Implementation Priority

1. **Phase 1 - Critical Mobile UX** (highest impact)
   - Bottom navigation bar
   - Product card touch targets
   - Cart drawer full-screen mode
   - CTA button improvements

2. **Phase 2 - Form Experience**
   - Checkout form optimization
   - Wholesale form mobile layout

3. **Phase 3 - Visual Polish**
   - Animation performance
   - Footer accordions
   - Testimonial carousel

---

## Expected Outcomes

- Faster ordering flow on mobile (fewer taps to checkout)
- Better touch ergonomics for one-handed use
- Improved conversion rates for mobile visitors
- Consistent premium feel across devices
- Reduced accidental taps and frustration
