/*
  # Add 'registered' status to volunteer sessions

  1. Changes
    - Update the check constraint on user_volunteer_sessions table to allow 'registered' status
    - This allows users to sign up for volunteer opportunities with 'registered' status
    - Existing statuses 'completed' and 'cancelled' remain valid

  2. Security
    - No changes to RLS policies needed
    - Constraint update maintains data integrity
*/

-- Drop the existing check constraint
ALTER TABLE user_volunteer_sessions DROP CONSTRAINT IF EXISTS user_volunteer_sessions_status_check;

-- Add the updated check constraint that includes 'registered'
ALTER TABLE user_volunteer_sessions ADD CONSTRAINT user_volunteer_sessions_status_check 
  CHECK (status = ANY (ARRAY['registered'::text, 'completed'::text, 'cancelled'::text]));