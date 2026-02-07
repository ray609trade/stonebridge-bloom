-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can request a wholesale account" ON public.wholesale_accounts;

-- Create a new INSERT policy that requires authentication
CREATE POLICY "Authenticated users can request a wholesale account"
ON public.wholesale_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);