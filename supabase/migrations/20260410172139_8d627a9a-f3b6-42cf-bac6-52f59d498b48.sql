DROP POLICY "Authenticated users can request a wholesale account" ON public.wholesale_accounts;
CREATE POLICY "Anyone can submit a wholesale application"
  ON public.wholesale_accounts
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending');