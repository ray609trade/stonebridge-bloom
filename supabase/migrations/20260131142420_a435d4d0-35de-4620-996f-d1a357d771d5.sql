-- Fix function search paths
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.generate_order_number() SET search_path = public;

-- The "always true" RLS policies are intentional:
-- 1. Orders need to be created by anonymous users (guest checkout)
-- 2. Wholesale account requests need to be created by anonymous users
-- These are INSERT-only policies and data is validated at the application level