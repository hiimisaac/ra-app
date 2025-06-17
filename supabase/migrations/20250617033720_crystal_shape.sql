/*
  # Create user volunteer preferences table

  1. New Tables
    - `user_volunteer_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles.id)
      - `interest_areas` (text array for volunteer categories)
      - `time_preferences` (text array for availability)
      - `commitment_levels` (text array for commitment types)
      - `notification_settings` (jsonb for notification preferences)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_volunteer_preferences` table
    - Add policies for authenticated users to manage their own preferences

  3. Indexes
    - Index on user_id for fast lookups
    - GIN index on interest_areas for array searches

  4. Triggers
    - Auto-update updated_at timestamp on changes
*/

CREATE TABLE IF NOT EXISTS user_volunteer_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  interest_areas text[] DEFAULT '{}',
  time_preferences text[] DEFAULT '{}',
  commitment_levels text[] DEFAULT '{}',
  notification_settings jsonb DEFAULT '{
    "email": true,
    "push": true,
    "weekly_digest": true,
    "opportunity_alerts": true,
    "reminders": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_volunteer_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own preferences"
  ON user_volunteer_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_volunteer_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_volunteer_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_volunteer_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_volunteer_preferences_user_id 
  ON user_volunteer_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_volunteer_preferences_interest_areas 
  ON user_volunteer_preferences USING GIN(interest_areas);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_user_volunteer_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger
CREATE TRIGGER update_user_volunteer_preferences_updated_at
  BEFORE UPDATE ON user_volunteer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_volunteer_preferences_updated_at();