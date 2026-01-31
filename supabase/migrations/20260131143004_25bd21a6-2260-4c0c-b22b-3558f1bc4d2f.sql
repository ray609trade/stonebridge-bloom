-- Make order_number have a default value so inserts work before trigger runs
-- The trigger will override this
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT 'TEMP-' || gen_random_uuid()::text;