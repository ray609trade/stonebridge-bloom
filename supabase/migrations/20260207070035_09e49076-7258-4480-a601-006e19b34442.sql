-- Fix orders SELECT policy to ensure no anonymous access
-- The current policy should already require auth, but let's make it explicit

-- Drop and recreate the orders SELECT policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  -- Must be authenticated AND one of the following:
  auth.uid() IS NOT NULL AND (
    -- User owns the order
    user_id = auth.uid() 
    -- OR their email matches the customer email (for guest orders)
    OR customer_email = auth.email()
    -- OR they have admin/staff role
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'staff')
  )
);

-- Fix wholesale_accounts SELECT policy to explicitly require authentication
-- The current policy should already require auth, but let's ensure it's explicit
DROP POLICY IF EXISTS "Users can view their own wholesale account" ON public.wholesale_accounts;

CREATE POLICY "Users can view their own wholesale account"
ON public.wholesale_accounts
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL AND (
    -- User owns the account
    user_id = auth.uid()
    -- OR they have admin role
    OR has_role(auth.uid(), 'admin')
  )
);