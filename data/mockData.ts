import { NewsItemType, ImpactStoryType, EventType, VolunteerOpportunityType, UserActivityType } from '@/types';

// News items
export const newsItems: NewsItemType[] = [
  {
    id: '1',
    title: 'Local Beach Cleanup Removes 500 Pounds of Waste',
    excerpt: 'Volunteers gathered last weekend for our annual beach cleanup, collecting over 500 pounds of plastic and debris.',
    content: 'Full content about the beach cleanup...',
    imageUrl: 'https://images.pexels.com/photos/3952043/pexels-photo-3952043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    date: '2025-05-01T09:00:00Z',
  },
  {
    id: '2',
    title: 'New Community Garden Opens in Downtown',
    excerpt: 'We\'re excited to announce the opening of our new community garden, providing fresh produce to local food banks.',
    content: 'Full content about the community garden...',
    imageUrl: 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    date: '2025-04-22T10:30:00Z',
  },
  {
    id: '3',
    title: 'Youth Mentorship Program Reaches Milestone',
    excerpt: 'Our youth mentorship program has now helped over 500 local students with career guidance and support.',
    content: 'Full content about the mentorship program...',
    imageUrl: 'https://images.pexels.com/photos/8363042/pexels-photo-8363042.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    date: '2025-04-15T14:00:00Z',
  },
];

// Impact stories
export const impactStories: ImpactStoryType[] = [
  {
    id: '1',
    title: 'How River Cleanup Changed Our Community',
    excerpt: 'After years of pollution, our river restoration project has brought wildlife back to the area and created a beautiful recreational space for residents.',
    content: 'Full content about the river cleanup impact...',
    imageUrl: 'https://images.pexels.com/photos/2990650/pexels-photo-2990650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-04-10T12:00:00Z',
    featured: true,
  },
  {
    id: '2',
    title: 'Maria\'s Story: From Recipient to Volunteer',
    excerpt: 'Maria received help from our food bank during a difficult time. Now, she gives back by volunteering weekly and helping others in need.',
    content: 'Full content about Maria\'s story...',
    imageUrl: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-03-20T15:30:00Z',
    featured: true,
  },
  {
    id: '3',
    title: 'Local School Transformed by Volunteer Teachers',
    excerpt: 'Our after-school tutoring program has helped improve graduation rates by 25% over the past three years.',
    content: 'Full content about the school transformation...',
    imageUrl: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-03-15T09:45:00Z',
    featured: false,
  },
  {
    id: '4',
    title: 'Urban Garden Project Feeds Hundreds',
    excerpt: 'What started as a small community garden has grown into a network of urban farms providing fresh produce to local food pantries.',
    content: 'Full content about the urban garden project...',
    imageUrl: 'https://images.pexels.com/photos/1099306/pexels-photo-1099306.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-02-28T11:20:00Z',
    featured: false,
  },
];

// Event categories
export const eventCategories = [
  'Fundraiser', 
  'Cleanup', 
  'Workshop', 
  'Community Day', 
  'Awareness'
];

// Events
export const events: EventType[] = [
  {
    id: '1',
    title: 'Annual Charity Gala',
    description: 'Join us for an evening of celebration and fundraising to support our community initiatives.',
    imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-06-15T18:00:00Z',
    location: 'Grand Hotel Ballroom',
    category: 'Fundraiser',
    attendees: 120,
    isRSVPed: false,
  },
  {
    id: '2',
    title: 'Riverside Cleanup Day',
    description: 'Help us keep our waterways clean by joining our monthly river cleanup initiative.',
    imageUrl: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-05-22T09:00:00Z',
    location: 'Riverfront Park',
    category: 'Cleanup',
    attendees: 45,
    isRSVPed: true,
  },
  {
    id: '3',
    title: 'Sustainable Living Workshop',
    description: 'Learn practical tips for reducing your environmental footprint and living more sustainably.',
    imageUrl: 'https://images.pexels.com/photos/6692936/pexels-photo-6692936.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-05-10T13:30:00Z',
    location: 'Community Center',
    category: 'Workshop',
    attendees: 30,
    isRSVPed: false,
  },
  {
    id: '4',
    title: 'Community Garden Planting Day',
    description: 'Join us as we plant new crops in our community garden. No experience necessary!',
    imageUrl: 'https://images.pexels.com/photos/7728638/pexels-photo-7728638.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-05-05T10:00:00Z',
    location: 'Oak Street Garden',
    category: 'Community Day',
    attendees: 25,
    isRSVPed: false,
  },
  {
    id: '5',
    title: 'Mental Health Awareness Walk',
    description: 'Walk with us to raise awareness about mental health issues and support local counseling services.',
    imageUrl: 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    date: '2025-04-18T09:00:00Z',
    location: 'Downtown Square',
    category: 'Awareness',
    attendees: 85,
    isRSVPed: false,
  },
];

// Volunteer categories
export const volunteerCategories = [
  'Environmental', 
  'Education', 
  'Health', 
  'Community Welfare', 
  'Animal Welfare'
];

// Locations
export const locations = [
  'Downtown', 
  'Westside', 
  'Northside', 
  'Eastside', 
  'Southside'
];

// Volunteer opportunities
export const volunteerOpportunities: VolunteerOpportunityType[] = [
  {
    id: '1',
    title: 'Park Cleanup Volunteer',
    organization: 'Green City Initiative',
    description: 'Help us maintain the beauty of our city parks by collecting litter and maintaining garden areas. All cleaning supplies will be provided.',
    date: '2025-05-18T09:00:00Z',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    location: 'Westside',
    category: 'Environmental',
    spotsAvailable: 15,
    isSignedUp: false,
  },
  {
    id: '2',
    title: 'After-School Tutor',
    organization: 'Education For All',
    description: 'Share your knowledge with students who need extra help with homework and test preparation in math, science, and reading.',
    date: '2025-05-15T15:30:00Z',
    startTime: '3:30 PM',
    endTime: '5:30 PM',
    location: 'Downtown',
    category: 'Education',
    spotsAvailable: 8,
    isSignedUp: true,
  },
  {
    id: '3',
    title: 'Food Bank Assistant',
    organization: 'Community Care Coalition',
    description: 'Help sort donations, stock shelves, and assist with food distribution at our community food bank. Training provided on your first day.',
    date: '2025-05-12T10:00:00Z',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    location: 'Eastside',
    category: 'Community Welfare',
    spotsAvailable: 10,
    isSignedUp: false,
  },
  {
    id: '4',
    title: 'Hospital Visitor',
    organization: 'Healing Hearts',
    description: 'Bring comfort to hospital patients through friendly conversation, reading, or playing games. Must complete brief orientation session.',
    date: '2025-05-10T13:00:00Z',
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    location: 'Northside',
    category: 'Health',
    spotsAvailable: 6,
    isSignedUp: false,
  },
  {
    id: '5',
    title: 'Animal Shelter Helper',
    organization: 'Paws & Whiskers Rescue',
    description: 'Assist with walking dogs, socializing cats, and maintaining clean facilities at our no-kill animal shelter.',
    date: '2025-05-08T14:00:00Z',
    startTime: '2:00 PM',
    endTime: '5:00 PM',
    location: 'Southside',
    category: 'Animal Welfare',
    spotsAvailable: 4,
    isSignedUp: false,
  },
];

// User activities
export const userActivities: UserActivityType[] = [
  {
    id: '1',
    type: 'volunteer',
    title: 'After-School Tutor',
    date: '2025-04-28T15:30:00Z',
    location: 'Downtown Elementary School',
    hours: 2,
  },
  {
    id: '2',
    type: 'event',
    title: 'Community Garden Planting Day',
    date: '2025-04-15T10:00:00Z',
    location: 'Oak Street Garden',
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Food Bank Assistant',
    date: '2025-04-05T10:00:00Z',
    location: 'Eastside Community Center',
    hours: 4,
  },
  {
    id: '4',
    type: 'donation',
    title: 'Monthly Support Donation',
    date: '2025-04-01T12:00:00Z',
  },
];