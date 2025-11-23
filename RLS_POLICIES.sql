-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================
-- This ensures users can only access their own data
-- Trainers can access client data
-- Admins can access everything

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. USERS Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Trainers can view client profiles
CREATE POLICY "Trainers can view client profiles"
  ON users FOR SELECT
  USING (
    (auth.jwt() ->> 'role' = 'trainer') 
    OR (auth.uid()::text = id::text)
    OR (auth.jwt() ->> 'role' = 'admin')
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow signup (unauthenticated users can insert)
CREATE POLICY "Users can insert own profile during signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text OR true);

-- 3. DAILY_STATS Table Policies
-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON daily_stats FOR SELECT
  USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Trainers can view assigned client stats
CREATE POLICY "Trainers can view client stats"
  ON daily_stats FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'trainer'
    OR auth.uid()::text = user_id::text
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Users can insert/update their own stats
CREATE POLICY "Users can insert own stats"
  ON daily_stats FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats"
  ON daily_stats FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 4. MEALS_LOGS Table Policies
CREATE POLICY "Users can view own meals"
  ON meals_logs FOR SELECT
  USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own meals"
  ON meals_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own meals"
  ON meals_logs FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own meals"
  ON meals_logs FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- 5. TRAINERS Table Policies
CREATE POLICY "Anyone can view trainer profiles"
  ON trainers FOR SELECT
  USING (true);

CREATE POLICY "Trainers can update own profile"
  ON trainers FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 6. MEETINGS Table Policies
-- Users can view their meetings
CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  USING (
    auth.uid()::text = trainer_id::text 
    OR auth.uid()::text = client_id::text
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Create meetings
CREATE POLICY "Clients can request meetings with trainers"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid()::text = client_id::text);

-- Update meetings
CREATE POLICY "Participants can update meetings"
  ON meetings FOR UPDATE
  USING (
    auth.uid()::text = trainer_id::text 
    OR auth.uid()::text = client_id::text
  );

-- 7. NOTIFICATIONS Table Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Create function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create function to check if user is trainer
-- ============================================
CREATE OR REPLACE FUNCTION is_trainer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'trainer' FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
