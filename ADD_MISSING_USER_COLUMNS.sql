-- ============================================
-- ADD MISSING USER COLUMNS TO SUPABASE
-- ============================================
-- Run this in Supabase SQL Editor to fix signup/login issues

-- Step 1: Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+1';

-- Step 2: Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username_availability ON users(username) WHERE username IS NOT NULL;

-- Step 3: Verify the columns were added
-- Run this to check:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

-- Expected output should include: full_name, gender, phone_number, country_code

-- ============================================
-- IMPORTANT: RLS POLICIES
-- ============================================
-- Make sure these policies exist on the users table:

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile during signup" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, check:
-- SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users';
-- Should return 3 policies
