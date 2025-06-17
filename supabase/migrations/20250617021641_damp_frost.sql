/*
  # Fix User Profiles RLS Policy

  1. Security Updates
    - Drop existing INSERT policy that uses incorrect `uid()` function
    - Create new INSERT policy using correct `auth.uid()` function
    - Ensure users can only create profiles for themselves

  2. Policy Changes
    - Replace "Users can insert own profile" policy with corrected version
    - Maintain existing SELECT and UPDATE policies
    - Use proper `auth.uid()` function for authentication checks
*/

-- Drop the existing INSERT policy that might be using incorrect function
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create corrected INSERT policy using auth.uid()
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the SELECT policy is also using correct function
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure the UPDATE policy is also using correct function
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);