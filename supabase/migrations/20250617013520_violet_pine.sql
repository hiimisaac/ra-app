/*
  # Create nonprofit content management system

  1. New Tables
    - `news_items`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `excerpt` (text, required) 
      - `content` (text, required)
      - `image_url` (text, optional)
      - `published_at` (timestamptz, default now)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `is_published` (boolean, default true)
    
    - `impact_stories`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `excerpt` (text, required)
      - `content` (text, required) 
      - `image_url` (text, optional)
      - `is_featured` (boolean, default false)
      - `published_at` (timestamptz, default now)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `is_published` (boolean, default true)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `image_url` (text, optional)
      - `event_date` (timestamptz, required)
      - `location` (text, required)
      - `category` (text, required)
      - `max_attendees` (integer, default 0)
      - `current_attendees` (integer, default 0)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `is_published` (boolean, default true)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to published content
    - Add policies for authenticated user management

  3. Sample Data
    - Insert comprehensive sample content for testing
*/

-- Clean up existing objects if they exist
DROP POLICY IF EXISTS "Anyone can read published news items" ON news_items;
DROP POLICY IF EXISTS "Authenticated users can manage news items" ON news_items;
DROP POLICY IF EXISTS "Anyone can read published impact stories" ON impact_stories;
DROP POLICY IF EXISTS "Authenticated users can manage impact stories" ON impact_stories;
DROP POLICY IF EXISTS "Anyone can read published events" ON events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON events;

DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS impact_stories CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create news_items table
CREATE TABLE news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- Create impact_stories table
CREATE TABLE impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  max_attendees integer DEFAULT 0,
  current_attendees integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for news_items
CREATE POLICY "Anyone can read published news items"
  ON news_items
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage news items"
  ON news_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for impact_stories
CREATE POLICY "Anyone can read published impact stories"
  ON impact_stories
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage impact stories"
  ON impact_stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for events
CREATE POLICY "Anyone can read published events"
  ON events
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample news items
INSERT INTO news_items (title, excerpt, content, image_url) VALUES
('Local Beach Cleanup Removes 500 Pounds of Waste', 
 'Volunteers gathered last weekend for our annual beach cleanup, collecting over 500 pounds of plastic and debris.',
 'Our annual beach cleanup was a tremendous success! Over 150 volunteers from across the community came together last Saturday morning to help restore our beautiful coastline. Armed with gloves, trash bags, and determination, participants spent four hours combing the beach and nearby dunes. The results were impressive: 500 pounds of waste removed, including 200 pounds of plastic bottles, 150 pounds of food packaging, and various other debris. This effort not only beautified our local environment but also prevented harmful materials from entering our marine ecosystem. We want to thank everyone who participated and our sponsors who provided supplies and refreshments. Mark your calendars for next year''s cleanup!',
 'https://images.pexels.com/photos/3952043/pexels-photo-3952043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'),

('New Community Garden Opens in Downtown', 
 'We''re excited to announce the opening of our new community garden, providing fresh produce to local food banks.',
 'After months of planning and preparation, we''re thrilled to announce the grand opening of our downtown community garden! Located on the corner of Main and Oak Streets, this 2-acre space will serve as both a source of fresh produce for local food banks and a gathering place for neighbors to connect. The garden features 50 individual plots available for community members to rent, as well as several communal areas dedicated to growing vegetables specifically for donation. Our first harvest yielded over 300 pounds of tomatoes, peppers, and leafy greens, all of which were distributed to three local food pantries. The garden also includes a children''s learning area where local schools can bring students for hands-on environmental education.',
 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'),

('Youth Mentorship Program Reaches Milestone',
 'Our youth mentorship program has now helped over 500 local students with career guidance and support.',
 'We''re proud to announce that our youth mentorship program has reached a significant milestone, having now served over 500 local students since its inception three years ago. The program pairs high school students with professional mentors from various industries, providing guidance on career paths, college applications, and life skills. Recent graduate testimonials highlight the program''s impact: 85% of participants report improved academic performance, and 92% say they feel more confident about their future career prospects. This year, we''re expanding the program to include virtual mentoring options and specialized tracks for students interested in STEM fields, entrepreneurship, and the arts. We''re actively seeking new mentors to join our growing network of community leaders dedicated to empowering the next generation.',
 'https://images.pexels.com/photos/8363042/pexels-photo-8363042.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940');

-- Insert sample impact stories
INSERT INTO impact_stories (title, excerpt, content, image_url, is_featured) VALUES
('How River Cleanup Changed Our Community',
 'After years of pollution, our river restoration project has brought wildlife back to the area and created a beautiful recreational space for residents.',
 'Three years ago, our local river was in crisis. Decades of industrial runoff and urban development had left the waterway polluted and lifeless. Today, thanks to our comprehensive restoration project, the river is thriving once again. Our multi-phase approach included removing contaminated sediment, installing natural filtration systems, and replanting native vegetation along the banks. The transformation has been remarkable. Fish have returned to waters that were once too polluted to support aquatic life. Families now picnic along the restored riverbank, and the new walking trail sees hundreds of visitors each week. Local property values have increased by an average of 15%, and three new businesses have opened in the area, citing the improved environment as a key factor in their decision. This project demonstrates how environmental restoration can revitalize entire communities.',
 'https://images.pexels.com/photos/2990650/pexels-photo-2990650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 true),

('Maria''s Story: From Recipient to Volunteer',
 'Maria received help from our food bank during a difficult time. Now, she gives back by volunteering weekly and helping others in need.',
 'Maria Rodriguez first came to our food bank two years ago during one of the most challenging periods of her life. After losing her job due to company downsizing, she struggled to feed her two young children while searching for new employment. "I was embarrassed at first," Maria recalls. "I had never needed help like this before." Our volunteers welcomed her with warmth and dignity, ensuring she left not just with groceries, but with hope. Today, Maria has a new job and stable housing, but she hasn''t forgotten the kindness she received. Every Saturday morning, you''ll find her at the food bank, helping to sort donations and welcome new families. "I want others to feel the same support I felt," she says. Maria has become one of our most dedicated volunteers, contributing over 200 hours of service in the past year and helping us serve more than 50 families each week.',
 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 true),

('Local School Transformed by Volunteer Teachers',
 'Our after-school tutoring program has helped improve graduation rates by 25% over the past three years.',
 'When Lincoln Elementary School was struggling with low test scores and high dropout rates, our organization stepped in with a comprehensive after-school tutoring program. What started with just five volunteer tutors has grown into a robust educational support system serving over 200 students annually. The program provides one-on-one tutoring in math, reading, and science, as well as homework help and test preparation. The results speak for themselves: standardized test scores have improved by an average of 30 points, and the school''s graduation rate has increased from 68% to 93% over three years. Beyond academic achievement, the program has fostered a sense of community and belonging among students. Many participants have gone on to attend college, with several receiving scholarships. The success at Lincoln Elementary has inspired similar programs at three other schools in our district.',
 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 false),

('Urban Garden Project Feeds Hundreds',
 'What started as a small community garden has grown into a network of urban farms providing fresh produce to local food pantries.',
 'Five years ago, a group of neighbors transformed a vacant lot into a small community garden. Today, that initiative has blossomed into a network of seven urban farms across the city, collectively producing over 10,000 pounds of fresh produce annually for local food pantries. The project addresses food insecurity while building community connections and teaching valuable skills. Each garden is managed by local volunteers who receive training in sustainable farming practices, composting, and crop rotation. The gardens have become gathering places where neighbors of all ages work together, share knowledge, and build lasting friendships. Children learn where their food comes from through hands-on gardening activities, while adults develop new skills and find meaningful ways to contribute to their community. The project has also created economic opportunities, with several participants starting their own small farming businesses.',
 'https://images.pexels.com/photos/1099306/pexels-photo-1099306.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 false);

-- Insert sample events
INSERT INTO events (title, description, image_url, event_date, location, category, max_attendees, current_attendees) VALUES
('Annual Charity Gala',
 'Join us for an evening of celebration and fundraising to support our community initiatives. Featuring dinner, live music, and inspiring stories from those we''ve helped.',
 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 '2025-06-15 18:00:00+00',
 'Grand Hotel Ballroom',
 'Fundraiser',
 200,
 120),

('Riverside Cleanup Day',
 'Help us keep our waterways clean by joining our monthly river cleanup initiative. All supplies provided, just bring your enthusiasm!',
 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 '2025-05-22 09:00:00+00',
 'Riverfront Park',
 'Cleanup',
 50,
 45),

('Sustainable Living Workshop',
 'Learn practical tips for reducing your environmental footprint and living more sustainably. Workshop includes hands-on activities and take-home resources.',
 'https://images.pexels.com/photos/6692936/pexels-photo-6692936.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 '2025-05-10 13:30:00+00',
 'Community Center',
 'Workshop',
 40,
 30),

('Community Garden Planting Day',
 'Join us as we plant new crops in our community garden. No experience necessary! We''ll provide tools, seeds, and expert guidance.',
 'https://images.pexels.com/photos/7728638/pexels-photo-7728638.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 '2025-05-05 10:00:00+00',
 'Oak Street Garden',
 'Community Day',
 30,
 25),

('Mental Health Awareness Walk',
 'Walk with us to raise awareness about mental health issues and support local counseling services.',
 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 '2025-04-18 09:00:00+00',
 'Downtown Square',
 'Awareness',
 100,
 85);