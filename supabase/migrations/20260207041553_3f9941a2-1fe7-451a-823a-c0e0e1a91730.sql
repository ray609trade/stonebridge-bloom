-- Fix orders INSERT policy to prevent user_id spoofing
-- Anonymous/guest users should NOT be able to set user_id
-- Authenticated users can only set their own user_id

-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a more secure INSERT policy
-- If user_id is provided, it must match the authenticated user's ID
-- Guest checkout (user_id = NULL) is still allowed
CREATE POLICY "Users can create orders with valid user_id"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Either user_id is null (guest checkout) OR user_id matches the authenticated user
  (user_id IS NULL) OR (user_id = auth.uid())
);