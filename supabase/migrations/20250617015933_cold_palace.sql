/*
  # Add sample volunteer opportunities

  1. New Data
    - Sample volunteer opportunities with various categories and locations
    - Realistic descriptions and details
    - Mix of dated and ongoing opportunities

  2. Categories
    - Environmental
    - Education  
    - Community Service
    - Health & Wellness
    - Animal Welfare
*/

INSERT INTO volunteer_opportunities (
  title,
  location,
  date,
  interest_area,
  description
) VALUES 
(
  'Park Cleanup Volunteer',
  'Westside Community Park',
  '2025-01-25 09:00:00+00',
  'Environmental',
  'Help us maintain the beauty of our city parks by collecting litter, weeding garden areas, and general maintenance. All cleaning supplies and tools will be provided. Great for individuals, families, or groups looking to make a positive environmental impact.'
),
(
  'After-School Reading Tutor',
  'Lincoln Elementary School',
  '2025-01-22 15:30:00+00',
  'Education',
  'Share your love of reading with elementary students who need extra support. Help children improve their reading skills through one-on-one tutoring sessions. No teaching experience required - just patience and enthusiasm for helping kids learn.'
),
(
  'Food Bank Sorting Assistant',
  'Downtown Food Bank',
  NULL,
  'Community Service',
  'Help sort and organize food donations to ensure families in need receive nutritious meals. Tasks include checking expiration dates, organizing by food type, and preparing distribution packages. Flexible scheduling available throughout the week.'
),
(
  'Senior Center Companion',
  'Sunset Senior Living',
  '2025-01-28 14:00:00+00',
  'Community Service',
  'Spend time with elderly residents through conversation, games, or light activities. Help reduce isolation and bring joy to seniors in our community. Perfect for those who enjoy intergenerational connections and have good listening skills.'
),
(
  'Community Garden Helper',
  'Oak Street Garden',
  '2025-02-01 10:00:00+00',
  'Environmental',
  'Assist with planting, watering, and harvesting vegetables that will be donated to local food pantries. Learn about sustainable gardening practices while helping address food insecurity in our community. All skill levels welcome.'
),
(
  'Hospital Pet Therapy Assistant',
  'General Hospital',
  '2025-02-05 16:00:00+00',
  'Health & Wellness',
  'Help coordinate visits between therapy animals and patients to provide comfort and emotional support. Assist with scheduling, patient preparation, and ensuring safety protocols are followed. Must complete orientation and background check.'
),
(
  'Animal Shelter Dog Walker',
  'Happy Tails Rescue',
  NULL,
  'Animal Welfare',
  'Provide exercise and socialization for shelter dogs awaiting adoption. Help improve their physical and mental well-being while making them more adoptable. Flexible scheduling with morning and evening shifts available. Dog handling experience preferred but not required.'
),
(
  'Homework Help Volunteer',
  'Community Center',
  '2025-01-30 16:00:00+00',
  'Education',
  'Support middle and high school students with homework and study skills. Help with various subjects including math, science, English, and social studies. Create a positive learning environment that encourages academic success and builds confidence.'
),
(
  'River Cleanup Coordinator',
  'Riverside Trail',
  '2025-02-08 08:00:00+00',
  'Environmental',
  'Lead a team of volunteers in cleaning up litter along our local river trail. Help protect wildlife habitats and improve water quality. Responsibilities include organizing volunteers, distributing supplies, and ensuring safety protocols are followed.'
),
(
  'Meal Delivery Driver',
  'Meals on Wheels',
  NULL,
  'Community Service',
  'Deliver nutritious meals to homebound seniors and individuals with disabilities. Provide friendly conversation and wellness checks during deliveries. Must have reliable transportation and clean driving record. Routes available throughout the week.'
),
(
  'Youth Mentorship Program',
  'Boys & Girls Club',
  '2025-02-12 17:00:00+00',
  'Education',
  'Mentor at-risk youth through academic support, life skills development, and positive role modeling. Help young people build confidence, set goals, and develop healthy relationships. Requires commitment to ongoing mentorship relationship.'
),
(
  'Blood Drive Assistant',
  'Red Cross Center',
  '2025-02-15 12:00:00+00',
  'Health & Wellness',
  'Support blood donation events by greeting donors, managing registration, and providing post-donation care. Help save lives by ensuring smooth operations during blood drives. Training provided for all volunteers.'
);