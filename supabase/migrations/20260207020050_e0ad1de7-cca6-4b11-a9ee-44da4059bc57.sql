-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Site settings are publicly viewable" ON public.site_settings;

-- Create a new SELECT policy that requires authentication
CREATE POLICY "Authenticated users can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);