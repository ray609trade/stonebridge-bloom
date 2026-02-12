

# Secure Password Reset Flow for Admin Users

## Overview
Add a "Forgot Password?" link on the admin login page that lets admin users request a password reset email. When they click the link in the email, they'll be taken to a page where they can set a new password.

## Changes

### 1. New Page: Reset Password (`src/pages/ResetPassword.tsx`)
- A form with two fields: new password and confirm password
- Listens for the `PASSWORD_RECOVERY` auth event on mount
- Calls `supabase.auth.updateUser({ password })` to set the new password
- On success, redirects to `/admin/login` with a success toast
- Validates passwords match and meet minimum length

### 2. Update Admin Login Page (`src/pages/AdminLogin.tsx`)
- Add a "Forgot Password?" link below the password field
- Clicking it shows an inline email input with a "Send Reset Link" button (or navigates to a small forgot-password view)
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/admin/reset-password' })`
- Shows a toast confirming the email was sent

### 3. New Route in App.tsx
- Add route: `/admin/reset-password` pointing to the new `ResetPassword` page

## Technical Details

- Uses built-in `supabase.auth.resetPasswordForEmail()` -- no edge function needed
- The redirect URL points to `/admin/reset-password` where the recovery token is automatically handled by Supabase's JS client via the URL hash fragment
- The `ResetPassword` page uses `supabase.auth.onAuthStateChange` to detect the `PASSWORD_RECOVERY` event, which confirms the token is valid before allowing password update
- No database changes required

## Flow

1. User clicks "Forgot Password?" on admin login
2. Enters email, clicks send
3. Receives email with reset link
4. Link opens `/admin/reset-password` with recovery token
5. User enters new password
6. Password is updated, user is redirected to login

