# Complete Signup Fix

## The Problem

- Signup creates users in Supabase Auth ✅
- But profile creation in `users` table fails ❌
- Error: "new row violates row-level security policy"

## Root Cause

The backend is using the **ANON key** which doesn't have permission to bypass RLS policies. We need the **SERVICE ROLE key** for backend operations.

## Solution: Use Service Role Key on Backend

### Step 1: Get Your Service Role Key

1. Go to https://supabase.com/dashboard
2. Select your project (`nrzcsaofjeifegsiizjo`)
3. Click **Settings** → **API**
4. Copy the **`service_role`** key (NOT the anon key)

### Step 2: Add Service Role Key to Environment

I'll add it to the dev server environment variables once you provide it.

**OR** if you prefer to keep using the anon key:

### Alternative: Update RLS Policy (Less Secure)

Run this SQL in Supabase SQL Editor:

```sql
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

-- Create a policy that allows inserts during signup
-- Note: This is less secure but works with anon key
CREATE POLICY "Allow signup profile creation"
ON users
FOR INSERT
WITH CHECK (true);
```

## Recommendation

Use the **Service Role Key** approach for better security. The service role key should only be used on the backend, never exposed to the frontend.
