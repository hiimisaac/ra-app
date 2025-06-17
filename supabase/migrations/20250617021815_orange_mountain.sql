/*
  # Fix user profile INSERT policy

  1. Security Changes
    - Add INSERT policy for user_profiles table to allow authenticated users to create their own profile
    - This fixes the RLS violation error when new users try to create their profile during signup

  The existing policies only allow SELECT and UPDATE for users' own data, but missing INSERT policy
  prevents new user registration from completing successfully.
*/

-- Add INSERT policy for user_profiles table
CREATE POLICY "Users can insert own profile during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);