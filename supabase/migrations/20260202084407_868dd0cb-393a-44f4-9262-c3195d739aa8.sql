-- Fix the broken RLS policy on orders table
-- The current policy allows anyone to read all orders because 'customer_email IS NOT NULL' is always true

-- Drop the existing flawed policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a corrected policy that properly restricts access
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    user_id = auth.uid() OR
    (auth.email() IS NOT NULL AND customer_email = auth.email()) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'staff')
  );

-- Add documentation comment to has_role function for security awareness
COMMENT ON FUNCTION public.has_role IS 
'SECURITY DEFINER function to check user roles. 
READ-ONLY: Must not be modified to perform data changes. 
Used in RLS policies for role-based access control.
This function bypasses RLS intentionally to avoid recursive policy checks.';