

## Add Google & Apple OAuth to Wholesale Login

**Current state**: Admin login already has Google and Apple OAuth buttons. Wholesale login only has email/password.

### Plan

**File: `src/pages/WholesaleLogin.tsx`**

1. Import `lovable` from `@/integrations/lovable` and `Separator` from UI components
2. Add an `handleOAuthSignIn` function that:
   - Calls `lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin })`
   - After successful auth, checks the `wholesale_accounts` table for an approved account linked to the user
   - Signs out and shows error if no approved wholesale account exists
   - Navigates to `/wholesale/portal` on success
3. Add Google and Apple buttons below the Sign In button in the login tab, separated by an "or" divider (matching the admin login style)
4. Add the same OAuth buttons below the Create Account button in the signup tab

### Technical Details
- Reuses the same `lovable.auth.signInWithOAuth` pattern from `AdminLogin.tsx`
- After OAuth callback, checks `wholesale_accounts` by `user_id` for approved status — same guard as the existing email login
- Styling will match the existing rounded-xl, h-12 button style used throughout the wholesale login page

