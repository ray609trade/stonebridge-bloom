
# Fix: Ordering Works on Mobile but Not on Web

## Root Cause Analysis

After investigating the codebase, I've identified why ordering works on mobile but not on web/desktop:

### Problem 1: useIsMobile Hook Hydration Race Condition
The `useIsMobile` hook initializes with `undefined` and only gets the correct value after mount. This causes:
- Initial render: `!!undefined = false` (treats everything as desktop)
- After mount: Correct value is set
- This creates a flash where mobile UI shows desktop behavior or vice versa

```typescript
// Current - causes hydration issues
const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
// ...
return !!isMobile; // undefined becomes false on first render
```

### Problem 2: Desktop Quick-Add Button Visibility
On desktop, the quick-add "+" button in `ProductCard` is **hidden by default** and only shows on hover:

```typescript
isMobile 
  ? "opacity-100"  // Mobile: always visible
  : isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2" // Desktop: only on hover
```

If the hover state doesn't register (due to touch events, certain browsers, or the hydration issue), the button stays invisible.

### Problem 3: ProductModal Not Opening on Click
When users click the product card on desktop (not the + button), it should open `ProductModal`. However:
- The card click triggers `onSelect()` which sets `selectedProduct`
- The `ProductModal` component uses `useIsMobile()` internally
- If there's a render timing issue, the modal may not display correctly

---

## Solution

### Fix 1: Improve useIsMobile Hook Initialization
Change the hook to initialize with a safe default that matches SSR expectations and prevents the flash:

**File:** `src/hooks/use-mobile.tsx`

```typescript
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with null to indicate "not yet determined"
  // This prevents the flash of wrong content
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false; // Default for SSR
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Set initial value on mount to ensure accuracy
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
```

### Fix 2: Make Desktop Quick-Add Button More Accessible
Ensure the + button is always visible on desktop, not just on hover. This improves usability and avoids relying on hover states that may not work correctly.

**File:** `src/components/menu/ProductCard.tsx`

Change the button visibility logic:
```typescript
// Instead of hiding on desktop, always show but with subtle styling
className={cn(
  "absolute bottom-3 right-3 rounded-full shadow-lg transition-all duration-300",
  "bg-accent hover:bg-amber-dark text-accent-foreground",
  "h-12 w-12 md:h-10 md:w-10",
  "active:scale-90",
  // Always visible, but slightly more prominent on hover (desktop only)
  "opacity-100",
  !isMobile && isHovered && "scale-110",
  isAdding && "scale-110"
)}
```

### Fix 3: Add Defensive Check for ProductModal Rendering
Ensure ProductModal always renders correctly regardless of timing:

**File:** `src/pages/Order.tsx`

Add a key to force re-mount when product changes:
```typescript
{selectedProduct && (
  <ProductModal
    key={selectedProduct.id}  // Force fresh mount
    product={selectedProduct}
    onClose={() => setSelectedProduct(null)}
  />
)}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/use-mobile.tsx` | Initialize with immediate window check to prevent hydration mismatch |
| `src/components/menu/ProductCard.tsx` | Make quick-add button always visible on all devices |
| `src/pages/Order.tsx` | Add key prop to ProductModal for reliable rendering |

---

## Technical Details

### Why Mobile Works But Desktop Doesn't
1. **Mobile path**: The "+" button is always visible via `opacity-100`, so users can always tap it
2. **Desktop path**: The "+" button requires `isHovered === true`, which:
   - May not trigger correctly if there's a hydration mismatch
   - May not trigger if touch events are involved (touchscreen laptops)
   - May have timing issues with the React state update

### After These Fixes
- The useIsMobile hook will correctly determine device type on first render
- The quick-add button will be visible on all devices without relying on hover
- ProductModal will reliably open when clicking products
- Users will be able to add items to cart on both mobile and desktop

---

## Additional Recommendation

Consider adding a "fallback" add-to-cart mechanism inside the product card content itself (e.g., a text link "Add to Cart" in the card footer) so even if the floating button has issues, users have another way to add items.
