/*
  # Fix volunteer opportunities access

  1. Security
    - Add RLS policies for volunteer_opportunities table to allow public read access
    - Ensure authenticated users can manage volunteer opportunities

  2. Data Access
    - Allow anyone to read volunteer opportunities (public access)
    - Allow authenticated users full access for management
*/

-- Add policy for public read access to volunteer opportunities
CREATE POLICY "Anyone can read volunteer opportunities"
  ON volunteer_opportunities
  FOR SELECT
  TO public
  USING (true);

-- Add policy for authenticated users to manage volunteer opportunities
CREATE POLICY "Authenticated users can manage volunteer opportunities"
  ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);