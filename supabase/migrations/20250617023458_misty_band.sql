/*
  # Fix User Profiles RLS Policies

  1. Security Changes
    - Drop existing restrictive RLS policies on `user_profiles` table
    - Create new comprehensive policies that allow proper user profile management
    - Ensure users can create, read, and update their own profiles
    - Fix the RLS violation error that prevents user signup and profile access

  2. Policy Details
    - Allow users to insert their own profile during signup
    - Allow users to select/read their own profile data
    - Allow users to update their own profile information
    - All policies use `auth.uid() = id` for proper user identification
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow users to insert their own profile during signup" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for user profile management
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
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

-- Allow users to delete their own profile (optional, for completeness)
CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);