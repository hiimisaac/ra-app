/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Drop existing conflicting INSERT policies on user_profiles table
    - Create proper INSERT policy for user registration
    - Ensure all policies use correct auth.uid() function
    - Fix policy names to be unique and descriptive

  2. Changes Made
    - Remove duplicate INSERT policies
    - Add proper INSERT policy for new user registration
    - Maintain existing SELECT and UPDATE policies with corrected syntax
*/

-- Drop existing INSERT policies that may be conflicting
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON user_profiles;

-- Create a single, proper INSERT policy for user registration
CREATE POLICY "Allow users to insert their own profile during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure SELECT policy uses correct function name
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure UPDATE policy uses correct function name  
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);