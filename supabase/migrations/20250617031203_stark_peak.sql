/*
  # Add Sample User Activity Data

  This migration adds sample data for testing the user activity tracking system.
  It creates sample volunteer sessions, event registrations, and donations for demonstration.
*/

-- Insert sample volunteer sessions (only if there are users in the system)
INSERT INTO user_volunteer_sessions (user_id, title, description, hours_worked, session_date, location, status)
SELECT 
  u.id,
  'Community Garden Maintenance',
  'Helped maintain the community garden by weeding, watering, and planting new vegetables.',
  3.5,
  now() - interval '7 days',
  'Oak Street Community Garden',
  'completed'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

INSERT INTO user_volunteer_sessions (user_id, title, description, hours_worked, session_date, location, status)
SELECT 
  u.id,
  'Food Bank Sorting',
  'Sorted and organized food donations at the local food bank.',
  4.0,
  now() - interval '14 days',
  'Downtown Food Bank',
  'completed'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

INSERT INTO user_volunteer_sessions (user_id, title, description, hours_worked, session_date, location, status)
SELECT 
  u.id,
  'Beach Cleanup',
  'Participated in the monthly beach cleanup event, collecting plastic waste and debris.',
  2.5,
  now() - interval '21 days',
  'Sunset Beach',
  'completed'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

-- Insert sample event registrations
INSERT INTO user_event_registrations (user_id, event_title, attendance_status)
SELECT 
  u.id,
  'Annual Charity Gala',
  'attended'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

INSERT INTO user_event_registrations (user_id, event_title, attendance_status)
SELECT 
  u.id,
  'Sustainable Living Workshop',
  'attended'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

-- Insert sample donations
INSERT INTO user_donations (user_id, amount, currency, donation_type, description, status)
SELECT 
  u.id,
  50.00,
  'USD',
  'monetary',
  'Monthly recurring donation',
  'completed'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

INSERT INTO user_donations (user_id, amount, currency, donation_type, description, status)
SELECT 
  u.id,
  25.00,
  'USD',
  'monetary',
  'Holiday fundraiser donation',
  'completed'
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
LIMIT 1;

-- Update user stats for all users who have activity data
SELECT update_user_stats(u.id)
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL;