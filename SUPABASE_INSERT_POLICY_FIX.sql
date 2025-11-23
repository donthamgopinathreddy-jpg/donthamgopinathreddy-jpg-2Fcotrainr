-- Fix for signup failure: Add INSERT policy for users table
-- This allows the server to insert new user profiles during signup

-- Option 1: Allow server-side inserts (requires using service role key on backend)
-- This is the most secure option if your backend uses SUPABASE_SERVICE_ROLE_KEY

-- Option 2: Allow authenticated users to insert their own profile during signup
-- This works if the user's auth.uid() matches the id being inserted
CREATE POLICY "Users can insert own profile during signup" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Option 3: Allow anonymous inserts (LESS SECURE - only use for development/testing)
-- Uncomment this if options 1 and 2 don't work:
-- CREATE POLICY "Allow user signup" ON users FOR INSERT WITH CHECK (true);

-- After running one of the above policies, test signup again
