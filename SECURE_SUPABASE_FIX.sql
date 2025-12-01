-- ============================================
-- SECURE SUPABASE FIX WITH PROPER RLS POLICIES
-- ============================================
-- Run this in Supabase SQL Editor to fix all issues with proper security

-- Step 1: Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+1';

-- Step 2: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

-- Step 4: Create SECURE RLS policies for users table

-- Policy 1: Anyone can view all user profiles (for discovering trainers, etc)
CREATE POLICY "Users can view all profiles" 
ON users 
FOR SELECT 
USING (true);

-- Policy 2: Authenticated users can update their own profile ONLY
CREATE POLICY "Users can update own profile" 
ON users 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Policy 3: **SECURE SIGNUP** - Authenticated users can insert their own profile
-- This ensures they can only create a profile for themselves (id must equal their auth.uid)
CREATE POLICY "Users can insert own profile during signup" 
ON users 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Must insert a row where id equals the authenticated user's uid
  id = auth.uid()
  -- Optional: Enforce that new signups default to 'client' role
  -- Uncomment the line below if you want to enforce role = 'client' on signup
  -- AND (role = 'client' OR role = 'trainer')
);

-- Step 5: Enable RLS on other key tables with proper policies

-- ===== DAILY STATS =====
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own stats" ON daily_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON daily_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON daily_stats;

CREATE POLICY "Users can view own stats" 
ON daily_stats 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stats" 
ON daily_stats 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats" 
ON daily_stats 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- ===== MEALS LOGS =====
ALTER TABLE meals_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own meals" ON meals_logs;
DROP POLICY IF EXISTS "Users can create meals" ON meals_logs;
DROP POLICY IF EXISTS "Users can update own meals" ON meals_logs;

CREATE POLICY "Users can view own meals" 
ON meals_logs 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create meals" 
ON meals_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own meals" 
ON meals_logs 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- ===== POSTS (Community Feed) =====
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;

CREATE POLICY "Anyone can view posts" 
ON posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create posts" 
ON posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own posts" 
ON posts 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- ===== NOTIFICATIONS =====
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" 
ON notifications 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own notifications" 
ON notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- ===== CONVERSATIONS =====
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;

CREATE POLICY "Users can view own conversations" 
ON conversations 
FOR SELECT 
TO authenticated
USING (
  auth.uid()::text = participant1_id::text 
  OR auth.uid()::text = participant2_id::text
);

-- ===== MESSAGES =====
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view own messages" 
ON messages 
FOR SELECT 
TO authenticated
USING (
  auth.uid()::text = sender_id::text 
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (
      conversations.participant1_id = auth.uid() 
      OR conversations.participant2_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can send messages" 
ON messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = sender_id::text);

-- ===== USER ACHIEVEMENTS =====
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements" 
ON user_achievements 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);

-- ===== REFERRALS =====
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;

CREATE POLICY "Users can view own referrals" 
ON referrals 
FOR SELECT 
TO authenticated
USING (
  auth.uid()::text = referrer_id::text 
  OR auth.uid()::text = referred_user_id::text
);

-- ===== SUBSCRIPTIONS =====
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" 
ON subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);

-- ============================================
-- VERIFICATION QUERIES (run these to verify)
-- ============================================
-- 1. Check if columns were added:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('full_name', 'gender', 'phone_number', 'country_code')
-- ORDER BY column_name;

-- 2. Check if RLS is enabled on users:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'users';
-- Should return: users | t

-- 3. Check if INSERT policy exists:
-- SELECT * FROM pg_policies 
-- WHERE tablename = 'users' 
-- AND policyname LIKE '%insert%';

-- 4. Test by trying to create a user profile (this requires authenticated session)
