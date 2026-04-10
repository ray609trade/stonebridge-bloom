

# Fix Wholesale Application Access

## Problem
The wholesale application form on `/wholesale` requires authentication before submission, but the login page requires an approved application before account creation. New potential wholesale partners have no way to apply.

## Solution
Remove the authentication gate from the wholesale application form. Allow unauthenticated visitors to submit wholesale applications directly — the form already collects all necessary business info (name, email, phone, etc.). If a user happens to be logged in, still attach their `user_id`.

## Changes

### 1. `src/pages/Wholesale.tsx`
- Remove the `!user` conditional block that shows "Sign In Required" with a redirect to login
- Always render the application form regardless of auth state
- Keep the existing `user_id: user?.id` in the insert (will be `null` for anonymous visitors, which is fine since the column is nullable)
- Remove the loading state gate (no need to wait for auth check to show the form)

### 2. RLS Policy Update
The `wholesale_accounts` table already has an INSERT policy: `(auth.uid() IS NOT NULL)` — this blocks unauthenticated inserts. We need to update this to allow anonymous inserts for applications.

**Database migration:**
```sql
DROP POLICY "Authenticated users can request a wholesale account" ON public.wholesale_accounts;
CREATE POLICY "Anyone can submit a wholesale application"
  ON public.wholesale_accounts
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending');
```

This ensures anyone can submit an application (with `pending` status only), while still protecting against unauthorized status manipulation.

