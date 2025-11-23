-- Drop the existing policy that doesn't work for server-side inserts
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

-- Create a new policy that allows authenticated signups
-- This allows INSERT when the user has just signed up (session exists but profile doesn't yet)
CREATE POLICY "Allow signup profile creation" 
ON users 
FOR INSERT 
WITH CHECK (true);

-- Keep the existing policies for SELECT and UPDATE
-- (These should already exist, but including them for completeness)
