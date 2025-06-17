/*
  # User Activity Tracking System

  1. New Tables
    - `user_volunteer_sessions` - Track individual volunteer sessions
    - `user_event_registrations` - Track event RSVPs and attendance
    - `user_donations` - Track donation records
    
  2. Functions
    - `update_user_stats()` - Automatically calculate and update user profile stats
    
  3. Triggers
    - Auto-update user stats when activities are added/modified
    
  4. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own data
*/

-- Create user volunteer sessions table
CREATE TABLE IF NOT EXISTS user_volunteer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id bigint REFERENCES volunteer_opportunities(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  hours_worked decimal(4,2) NOT NULL DEFAULT 0,
  session_date timestamptz NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user event registrations table
CREATE TABLE IF NOT EXISTS user_event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  event_title text NOT NULL,
  registration_date timestamptz DEFAULT now(),
  attendance_status text NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user donations table
CREATE TABLE IF NOT EXISTS user_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  donation_type text NOT NULL DEFAULT 'monetary' CHECK (donation_type IN ('monetary', 'in_kind')),
  description text,
  donation_date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE user_volunteer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_donations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_volunteer_sessions
CREATE POLICY "Users can manage their own volunteer sessions"
  ON user_volunteer_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_event_registrations
CREATE POLICY "Users can manage their own event registrations"
  ON user_event_registrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_donations
CREATE POLICY "Users can manage their own donations"
  ON user_donations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats(target_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    volunteer_hours = (
      SELECT COALESCE(SUM(hours_worked), 0)
      FROM user_volunteer_sessions 
      WHERE user_id = target_user_id AND status = 'completed'
    ),
    events_attended = (
      SELECT COUNT(*)
      FROM user_event_registrations 
      WHERE user_id = target_user_id AND attendance_status = 'attended'
    ),
    donations_made = (
      SELECT COUNT(*)
      FROM user_donations 
      WHERE user_id = target_user_id AND status = 'completed'
    ),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update user stats
CREATE OR REPLACE FUNCTION trigger_update_user_stats()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_user_stats(NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_stats(OLD.user_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all activity tables
CREATE TRIGGER update_stats_on_volunteer_session_change
  AFTER INSERT OR UPDATE OR DELETE ON user_volunteer_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_user_stats();

CREATE TRIGGER update_stats_on_event_registration_change
  AFTER INSERT OR UPDATE OR DELETE ON user_event_registrations
  FOR EACH ROW EXECUTE FUNCTION trigger_update_user_stats();

CREATE TRIGGER update_stats_on_donation_change
  AFTER INSERT OR UPDATE OR DELETE ON user_donations
  FOR EACH ROW EXECUTE FUNCTION trigger_update_user_stats();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_volunteer_sessions_user_id ON user_volunteer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_volunteer_sessions_status ON user_volunteer_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_event_registrations_user_id ON user_event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_registrations_status ON user_event_registrations(attendance_status);
CREATE INDEX IF NOT EXISTS idx_user_donations_user_id ON user_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_donations_status ON user_donations(status);