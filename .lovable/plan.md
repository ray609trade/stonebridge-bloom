
# Fix: Clickable Order Rows in Admin Panel

## Problem
You cannot click on order rows to view details - you can only click the small Eye icon in the Actions column. This makes it difficult to quickly access orders.

## Solution
Make each order row clickable so tapping anywhere on the row opens the order details modal.

---

## Changes

### 1. Make Order Rows Clickable
**File:** `src/pages/Admin.tsx`

Add click handling to each table row:
- Add `onClick` handler to open the order detail modal when clicking anywhere on the row
- Add `cursor-pointer` styling so it's clear rows are clickable  
- Add `e.stopPropagation()` to buttons inside rows so they don't trigger the row click

**Before:**
```tsx
<tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
```

**After:**
```tsx
<tr 
  key={order.id} 
  className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer"
  onClick={() => setSelectedOrder(order)}
>
```

Action buttons will stop event propagation:
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={(e) => {
    e.stopPropagation();
    setSelectedOrder(order);
  }}
>
```

### 2. Fix Badge Console Warning
**File:** `src/components/ui/badge.tsx`

Wrap the Badge component with `React.forwardRef()` to properly handle refs and eliminate the console warning.

**Before:**
```tsx
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

**After:**
```tsx
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add row click handler on line 351, add stopPropagation to action buttons |
| `src/components/ui/badge.tsx` | Wrap with forwardRef to fix warning |

---

## Result
After these changes:
- Click anywhere on an order row to open the order details modal
- Action buttons (Eye, CheckCircle, Sync) still work independently without opening modal twice
- Console warning about refs will be resolved
