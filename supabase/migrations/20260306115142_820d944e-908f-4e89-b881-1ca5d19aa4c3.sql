
DROP POLICY IF EXISTS "Authenticated users can view site settings" ON public.site_settings;

CREATE POLICY "Admins and staff can view site settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  );
