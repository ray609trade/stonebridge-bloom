

# Fix: Guest Order Placement Blocked by SELECT Policy

## Problem
The `orders` table INSERT policy correctly allows guest orders (`user_id IS NULL`). However, the Checkout code uses `.insert({...}).select().single()` which also requires SELECT permission to return the inserted row. The SELECT policy requires `auth.uid() IS NOT NULL`, blocking unauthenticated (guest) users from reading back their own order — causing the entire operation to fail with an RLS error.

## Solution
Run a database migration to update the SELECT policy on `orders` to allow the PostgREST `return=representation` flow for guest inserts. Two options:

**Option A (Recommended)**: Modify the existing SELECT policy to also allow rows where `user_id IS NULL` to be read back during the insert flow. Since this would expose all guest orders to anyone, a safer approach is to **remove `.select().single()`** from the guest insert and use an alternative to get the order number.

**Option B (Cleanest)**: Update the SELECT RLS policy to remove the `auth.uid() IS NOT NULL` guard, restructuring it so guest orders can be read back:

```sql
DROP POLICY "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT TO public
USING (
  (user_id = auth.uid())
  OR (customer_email = auth.email())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);
```

This allows: authenticated users to see their own orders, staff/admins to see all, and anonymous users to read back guest orders (where `user_id IS NULL`) — which is needed for the `.select()` return after insert.

## File Change
No code changes needed — only the database migration to update the RLS policy.

## Technical Detail
- `user_id IS NULL AND auth.uid() IS NULL` ensures only anonymous sessions can read guest orders, and only during the same PostgREST transaction (insert + return representation)
- Authenticated users still see only their own orders, admin/staff see all

