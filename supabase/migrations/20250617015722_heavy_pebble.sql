/*
  # Add Sample Events

  1. New Data
    - Sample events for testing the events functionality
    - Various categories and dates
    - Published events with proper data

  2. Data Includes
    - Community events
    - Fundraisers
    - Workshops
    - Cleanup activities
*/

-- Insert sample events
INSERT INTO events (
  title,
  description,
  image_url,
  event_date,
  location,
  category,
  max_attendees,
  current_attendees,
  is_published
) VALUES 
(
  'Annual Charity Gala',
  'Join us for an elegant evening of fundraising to support our community programs. Enjoy dinner, live music, and inspiring stories from those we''ve helped.',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-02-15 18:00:00+00',
  'Grand Hotel Ballroom',
  'Fundraiser',
  200,
  85,
  true
),
(
  'Community Garden Planting Day',
  'Help us plant vegetables and flowers in our community garden. All ages welcome! Tools and refreshments provided.',
  'https://images.pexels.com/photos/7728638/pexels-photo-7728638.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-01-25 09:00:00+00',
  'Oak Street Community Garden',
  'Community Service',
  50,
  23,
  true
),
(
  'River Cleanup Initiative',
  'Join our monthly river cleanup to help protect local wildlife and keep our waterways clean. Gloves and bags provided.',
  'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-01-30 08:00:00+00',
  'Riverside Park',
  'Environmental',
  40,
  31,
  true
),
(
  'Youth Mentorship Workshop',
  'Learn how to become an effective mentor for at-risk youth in our community. Training session includes lunch.',
  'https://images.pexels.com/photos/8363042/pexels-photo-8363042.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-02-05 13:00:00+00',
  'Community Center Room A',
  'Education',
  25,
  12,
  true
),
(
  'Food Bank Volunteer Training',
  'New volunteer orientation for our food bank operations. Learn about food safety, sorting, and distribution processes.',
  'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-02-08 10:00:00+00',
  'Food Bank Warehouse',
  'Community Service',
  15,
  8,
  true
),
(
  'Mental Health Awareness Walk',
  'Walk with us to raise awareness about mental health and support local counseling services. Registration includes t-shirt.',
  'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-02-12 09:00:00+00',
  'Downtown Square',
  'Health & Wellness',
  100,
  67,
  true
),
(
  'Senior Center Bingo Night',
  'Host bingo games and socialize with seniors in our community. Volunteers help with setup, calling numbers, and refreshments.',
  'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-01-28 18:30:00+00',
  'Sunset Senior Center',
  'Community Service',
  30,
  18,
  true
),
(
  'Sustainable Living Workshop',
  'Learn practical tips for reducing your environmental footprint. Topics include composting, energy conservation, and sustainable shopping.',
  'https://images.pexels.com/photos/6692936/pexels-photo-6692936.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2025-02-20 14:00:00+00',
  'Environmental Center',
  'Education',
  35,
  19,
  true
);