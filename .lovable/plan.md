
# Fix: Order Status Updates in Admin Panel

## Problem Identified
The `OrderDetailModal` component only displays order details - it has **no way to update order status**. Currently:
- You can only update status via the small CheckCircle button in the table (which auto-advances to next status)
- Once you open an order to see details, there's no way to change its status from within the modal

## Solution
Add status update buttons directly inside the `OrderDetailModal` so you can:
1. See the current status
2. Click to advance to the next status
3. Manually select any valid status

---

## Changes

### 1. Add Status Update Controls to OrderDetailModal
**File:** `src/components/admin/OrderDetailModal.tsx`

Add:
- Status update buttons showing the workflow: Pending → Confirmed → Preparing → Ready
- An "Advance Status" button to move to the next status
- Direct status selection buttons for flexibility
- Integration with the parent component to trigger status updates

### 2. Pass Status Update Handler to Modal
**File:** `src/pages/Admin.tsx`

Pass the `updateOrderStatus` mutation to the modal so it can trigger status changes:
- Add `onUpdateStatus` prop to `OrderDetailModal`
- Handle query invalidation to refresh the orders list after update
- Close or refresh modal after status change

---

## Implementation Details

### OrderDetailModal Changes

Add a new `onUpdateStatus` prop:
```typescript
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
}
```

Add status control section with buttons:
```typescript
{/* Status Controls - show workflow buttons */}
<div className="pt-4 border-t border-border space-y-3">
  <h4 className="font-medium">Update Status</h4>
  <div className="flex flex-wrap gap-2">
    {["pending", "confirmed", "preparing", "ready", "completed"].map((status) => (
      <Button
        key={status}
        variant={order.status === status ? "default" : "outline"}
        size="sm"
        onClick={() => onUpdateStatus?.(order.id, status)}
        disabled={order.status === status}
        className="capitalize"
      >
        {status}
      </Button>
    ))}
  </div>
</div>
```

### Admin.tsx Changes

Update the modal invocation to pass the status handler:
```typescript
{selectedOrder && (
  <OrderDetailModal 
    order={selectedOrder} 
    onClose={() => setSelectedOrder(null)}
    onUpdateStatus={(id, status) => {
      updateOrderStatus.mutate({ id, status });
    }}
  />
)}
```

Also update `selectedOrder` state after mutation success to reflect new status.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/OrderDetailModal.tsx` | Add status update buttons and `onUpdateStatus` prop |
| `src/pages/Admin.tsx` | Pass `onUpdateStatus` handler, update local state after mutation |

---

## Result
After these changes:
- Click any order row to open details
- See clear status buttons: Pending, Confirmed, Preparing, Ready, Completed
- Click any status to update the order immediately
- Modal stays open and reflects the new status
- List refreshes automatically
- "Ready" status still triggers SMS notification as before
