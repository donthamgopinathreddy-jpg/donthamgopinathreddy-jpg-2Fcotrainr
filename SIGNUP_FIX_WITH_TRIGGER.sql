-- ====================================================
-- SUPABASE FIX: AUTO-CREATE USER PROFILES WITH TRIGGER
-- ====================================================
-- This creates a trigger that automatically creates a user profile 
-- whenever a new auth user is registered

-- Step 1: Enable the needed extensions
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- Step 2: Create or replace the function that handles new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, gender, phone_number, country_code, password_hash, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.user_metadata->>'full_name', ''),
    COALESCE(NEW.user_metadata->>'gender', ''),
    COALESCE(NEW.user_metadata->>'phone_number', ''),
    COALESCE(NEW.user_metadata->>'country_code', '+1'),
    'supabase_auth',
    COALESCE(NEW.user_metadata->>'role', 'client')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure the trigger doesn't already exist, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the function and trigger are in place
SELECT EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'handle_new_user' AND routine_schema = 'public'
) AS function_exists;

SELECT EXISTS (
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
) AS trigger_exists;

-- ====== IMPORTANT ======
-- After running this SQL:
-- 1. The next signup will automatically create a user profile
-- 2. The trigger runs as SECURITY DEFINER, so it has permission to insert
-- 3. User profile creation failures won't block the signup
-- 4. Email confirmation will work as expected

-- Test the setup by checking if trigger is active
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';
