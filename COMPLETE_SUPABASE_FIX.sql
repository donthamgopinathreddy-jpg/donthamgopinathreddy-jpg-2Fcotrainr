-- ============================================
-- COMPLETE SUPABASE FIX FOR LOGIN/SIGNUP
-- ============================================
-- Run this in Supabase SQL Editor to fix all issues

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

-- Step 4: Create new RLS policies for users table
-- Allow anyone to view all user profiles (for searching trainers, etc)
CREATE POLICY "Users can view all profiles" 
ON users 
FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- **CRITICAL** - Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Step 5: Enable RLS on other key tables and create policies
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON daily_stats FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own stats" ON daily_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own stats" ON daily_stats FOR UPDATE USING (auth.uid()::text = user_id::text);

ALTER TABLE meals_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meals" ON meals_logs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create meals" ON meals_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own meals" ON meals_logs FOR UPDATE USING (auth.uid()::text = user_id::text);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = user_id::text);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can read own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid()::text = participant1_id::text OR auth.uid()::text = participant2_id::text);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid()::text = sender_id::text OR EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())));
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify everything is working:

-- 1. Check if columns were added
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('full_name', 'gender', 'phone_number', 'country_code');

-- 2. Check if RLS is enabled on users table
-- SELECT * FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true;

-- 3. Check if policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- Expected output: 3 policies (view, update, insert)
