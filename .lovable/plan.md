## Problem
Guest checkout fails with "permission denied" (RLS 42501). The `orders` table has proper RLS policies allowing anonymous inserts where `user_id IS NULL`, but the table has **no table-level GRANTs** to `anon`, `authenticated`, or `service_role`. Without GRANTs, PostgREST rejects the request before RLS is even evaluated.

## Fix
Run one migration to add the missing grants on `public.orders`:

- `GRANT INSERT ON public.orders TO anon, authenticated;` — allows guest and logged-in checkout (RLS still enforces `user_id IS NULL OR user_id = auth.uid()`).
- `GRANT SELECT ON public.orders TO anon, authenticated;` — allows the `.select().single()` after insert and order lookup / "my orders" pages (RLS still restricts rows).
- `GRANT UPDATE, DELETE ON public.orders TO authenticated;` — admin/staff order management (RLS restricts to those roles).
- `GRANT ALL ON public.orders TO service_role;` — edge functions (email, notifications, triggers).

No code changes. No RLS policy changes. No other tables touched.

## Verification
Reload checkout and place the same test order — it should succeed and navigate to the confirmation page.