# Fly.dev Deployment Setup Instructions

## What's Fixed:

1. ✅ User signup data now automatically saved to `public.users` table (trigger fixed)
2. ✅ Email confirmation links now use Fly.dev URL correctly
3. ✅ Existing user profile created in database

## What You Need to Do (Fly.dev Configuration):

### Step 1: Set Environment Variables on Fly.dev

You MUST add these secrets to your Fly.dev deployment:

```bash
flyctl secrets set \
  VITE_SUPABASE_URL=https://hnxdlgdkyboctsvfktwe.supabase.co \
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI
```

**Or manually via Fly.dev Dashboard:**

1. Go to your app on Fly.dev dashboard
2. Click **Secrets**
3. Add two secrets:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://hnxdlgdkyboctsvfktwe.supabase.co`

   And:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI`

### Step 2: Redeploy After Setting Secrets

```bash
flyctl deploy
```

Or redeploy via the dashboard.

### Step 3: Test Login on Fly.dev

1. Open your Fly.dev URL in browser
2. Try to sign up with new email
3. Check Supabase - new user should appear in `public.users` table
4. You should receive confirmation email with Fly.dev link (not localhost)
5. Click confirmation link to verify email
6. Try to login

## Why This Works

**Before**:

- Fly.dev didn't have Supabase credentials
- Frontend couldn't connect to Supabase
- App wouldn't load

**After**:

- Environment variables available to build and runtime
- Frontend can connect to Supabase
- API can create user profiles
- Email confirmation links point to Fly.dev (not localhost)
- Login works correctly

## Troubleshooting

### App Still Not Loading

1. Check Fly.dev logs: `flyctl logs`
2. Look for errors like "Missing Supabase URL"
3. Verify secrets are set: `flyctl secrets list`

### Login Still Failing

1. Check browser DevTools console for errors
2. Check Fly.dev logs for API errors
3. Ensure Supabase credentials are correct

### User Data Not Appearing in Table After Signup

1. The trigger now uses correct column (`raw_user_meta_data`)
2. Manually created the existing auth user in the table
3. New signups should automatically create user records
4. Check Supabase logs if trigger fails

## Files Changed

1. **server/routes/api.ts** - Fixed email redirect URL detection for Fly.dev
2. **Supabase Trigger** - Fixed to use `raw_user_meta_data` instead of `user_metadata`
3. **Database** - Created user profile for existing auth user

## Next Steps

1. Set environment variables on Fly.dev (above)
2. Redeploy
3. Test signup and login
4. If still issues, run: `flyctl logs` to see errors

## Your Deployment URLs

- **Fly.dev App**: https://2d9e81b5972c49de80a265fe42df8b0d-8ce80281b6c1441ab2ab606e4.fly.dev
- **Supabase Project**: https://hnxdlgdkyboctsvfktwe.supabase.co
- **API Endpoint**: https://2d9e81b5972c49de80a265fe42df8b0d-8ce80281b6c1441ab2ab606e4.fly.dev/api/

## Confirmation of Fixes

✅ **User Signup Data**: Now saved to `public.users` via trigger
✅ **Email Confirmation**: Now uses Fly.dev URL instead of localhost
✅ **Existing User**: Profile created in database
✅ **Fly.dev Configuration**: Ready to accept environment variables
