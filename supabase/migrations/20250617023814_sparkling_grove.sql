/*
  # Fix User Profiles RLS Policy

  1. Security Updates
    - Update INSERT policy to allow users to create their own profile during signup
    - Ensure proper authentication checks for profile creation
    - Add policy to handle edge cases during user registration

  2. Changes
    - Modify INSERT policy to be more permissive during user creation
    - Keep existing SELECT, UPDATE, DELETE policies intact
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

-- Create new INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the policy allows profile creation during signup process
-- by also allowing inserts when the user ID matches the authenticated user
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Drop the duplicate policy (keep only one)
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

-- Create the final comprehensive INSERT policy
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid()
    )
  );