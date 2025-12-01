# Complete Authentication Fix Guide

## Problem Summary

Signup and Login were failing due to:

1. **Missing RLS policies** on Supabase tables
2. **Missing user profile creation** during signup
3. **Wrong API endpoint** for fetching user profile
4. **Missing role field** in auth metadata

## Solution Steps

### Step 1: Run the RLS Policy SQL (REQUIRED)

Run this in your Supabase SQL Editor:

- File: `SECURE_SUPABASE_FIX.sql`

This will:

- ✅ Add missing columns to users table (full_name, gender, phone_number, country_code)
- ✅ Enable RLS on all required tables
- ✅ Create secure RLS policies for read/write access

### Step 2: Run the Trigger SQL (REQUIRED FOR SIGNUP)

Run this in your Supabase SQL Editor:

- File: `SIGNUP_FIX_WITH_TRIGGER.sql`

This will:

- ✅ Create an automatic trigger that creates user profiles during signup
- ✅ Handle all metadata fields from auth signup
- ✅ Bypass RLS issues by running with special permissions

### Step 3: Code Changes Applied (DONE)

The following changes have been automatically applied:

1. **Backend Signup Endpoint** (`server/routes/api.ts`):
   - Now passes `role` in auth metadata
   - Includes fallback profile creation logic
   - Proper error handling

2. **Backend Signin Endpoint** (`server/routes/api.ts`):
   - ✅ Works correctly with Supabase auth
   - Returns session with access token

3. **Frontend Profile Fetch** (`client/contexts/AuthContext.tsx`):
   - ✅ Fixed endpoint from `/api/supabase/users/profile` to `/api/users/profile`
   - Properly sends authorization token

## Testing Checklist

### Test Login:

1. You should be able to login with existing credentials
2. Session should be stored correctly
3. User should be redirected to home page

### Test Signup:

1. Go to signup page
2. Fill in email, password, and other required fields
3. **After running the trigger SQL**, signup should work
4. User profile should be created automatically
5. User should be able to login with new credentials

## Troubleshooting

### If signup still fails:

1. Check Supabase SQL Editor for any errors when running `SIGNUP_FIX_WITH_TRIGGER.sql`
2. Verify trigger was created:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```
3. Check backend logs for profile creation errors

### If login fails:

1. Verify user exists in auth.users table
2. Check if RLS policies are enabled on users table
3. Verify the user profile exists in public.users table

### If profile fetch fails:

1. Ensure RLS policy allows SELECT on users table
2. Check if user profile was created during signup
3. Verify API endpoint is accessible

## Files Modified

1. `server/routes/api.ts` - Signup and signin endpoints
2. `client/contexts/AuthContext.tsx` - Fixed profile fetch endpoint
3. `SIGNUP_FIX_WITH_TRIGGER.sql` - New trigger for auto-creating profiles
4. `SECURE_SUPABASE_FIX.sql` - RLS policies (already provided)

## Next Steps

1. Run `SECURE_SUPABASE_FIX.sql` in Supabase
2. Run `SIGNUP_FIX_WITH_TRIGGER.sql` in Supabase
3. Test signup with a new email
4. Test login with the new account
5. Test profile fetching after login

If issues persist, check the backend logs in the dev server console.
