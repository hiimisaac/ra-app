/*
  # Fix User Profiles RLS Policies

  1. Security
    - Drop all existing conflicting policies
    - Create clean, simple RLS policies for user_profiles
    - Ensure users can only access their own profiles
    - Allow profile creation during authenticated sessions

  2. Changes
    - Clean up all existing policies
    - Create simple, working RLS policies
    - Ensure proper user profile creation flow
*/

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile during signup" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);