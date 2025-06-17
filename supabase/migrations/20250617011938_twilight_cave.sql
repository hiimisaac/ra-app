/*
  # Create content management tables for nonprofit app

  1. New Tables
    - `news_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `image_url` (text)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_published` (boolean)
    
    - `impact_stories`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `image_url` (text)
      - `is_featured` (boolean)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_published` (boolean)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `event_date` (timestamp)
      - `location` (text)
      - `category` (text)
      - `max_attendees` (integer)
      - `current_attendees` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_published` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to published content
    - Add policies for authenticated admin users to manage content
*/

-- News Items Table
CREATE TABLE IF NOT EXISTS news_items (
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

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

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

-- Impact Stories Table
CREATE TABLE IF NOT EXISTS impact_stories (
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

ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;

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

-- Events Table
CREATE TABLE IF NOT EXISTS events (
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

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data
INSERT INTO news_items (title, excerpt, content, image_url) VALUES
('Local Beach Cleanup Removes 500 Pounds of Waste', 
 'Volunteers gathered last weekend for our annual beach cleanup, collecting over 500 pounds of plastic and debris.',
 'Our annual beach cleanup was a tremendous success! Over 150 volunteers from across the community came together last Saturday morning to help restore our beautiful coastline. Armed with gloves, trash bags, and determination, participants spent four hours combing the beach and nearby dunes. The results were impressive: 500 pounds of waste removed, including 200 pounds of plastic bottles, 150 pounds of food packaging, and various other debris. This effort not only beautified our local environment but also prevented harmful materials from entering our marine ecosystem. We want to thank everyone who participated and our sponsors who provided supplies and refreshments. Mark your calendars for next year''s cleanup!',
 'https://images.pexels.com/photos/3952043/pexels-photo-3952043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'),

('New Community Garden Opens in Downtown', 
 'We''re excited to announce the opening of our new community garden, providing fresh produce to local food banks.',
 'After months of planning and preparation, we''re thrilled to announce the grand opening of our downtown community garden! Located on the corner of Main and Oak Streets, this 2-acre space will serve as both a source of fresh produce for local food banks and a gathering place for neighbors to connect. The garden features 50 individual plots available for community members to rent, as well as several communal areas dedicated to growing vegetables specifically for donation. Our first harvest yielded over 300 pounds of tomatoes, peppers, and leafy greens, all of which were distributed to three local food pantries. The garden also includes a children''s learning area where local schools can bring students for hands-on environmental education.',
 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940');

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
 true);

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
 45);