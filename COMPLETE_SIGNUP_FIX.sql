-- ============================================
-- COMPLETE FIX FOR SIGNUP FAILURE
-- ============================================
-- This SQL script adds the missing INSERT policy for the users table
-- Run this in your Supabase SQL Editor to enable user signup

-- Step 1: Drop existing policies if they exist (optional, for clean slate)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

-- Step 2: Recreate all users table policies with INSERT support
-- Allow anyone to view all user profiles
CREATE POLICY "Users can view all profiles" 
ON users 
FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- **THIS IS THE CRITICAL FIX** - Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running the above, verify the policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- You should see 3 policies:
-- 1. Users can view all profiles (SELECT)
-- 2. Users can update own profile (UPDATE)
-- 3. Users can insert own profile during signup (INSERT)
