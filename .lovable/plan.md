

# Create Admin User Account

## Overview
Create an admin user account with the credentials you specified so you can log into the admin dashboard.

## Admin Credentials
- **Email**: steven@stonebridgebagels.com
- **Password**: makeamericagreat2026

## How It Works
The admin login uses a two-step verification:
1. First, it authenticates with email/password
2. Then, it checks the `user_roles` table to verify the user has the `admin` role

Currently, there is no admin user set up, so we need to create one.

## Technical Implementation

### Step 1: Create Admin User via Database Migration
Use a database function to create the user and assign admin role:

```sql
-- Create the admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'steven@stonebridgebagels.com',
  crypt('makeamericagreat2026', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  ''
);

-- Add admin role for this user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'steven@stonebridgebagels.com';
```

### Step 2: Create Identity Record
Also create the identity record to link the user properly:

```sql
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at,
  last_sign_in_at
)
SELECT 
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'steven@stonebridgebagels.com';
```

## Security Note
This creates a real user account in your authentication system. The password is stored securely using bcrypt encryption. After this is set up, you can log in using these credentials at `/admin/login`.

## Alternative: OAuth Login
You can also sign in with Google or Apple OAuth. If you do that, I would then need to manually add the `admin` role to your OAuth user after your first login.

