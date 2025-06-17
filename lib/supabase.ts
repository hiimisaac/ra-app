import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface ImpactStory {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  event_date: string;
  location: string;
  category: string;
  max_attendees: number;
  current_attendees: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface VolunteerOpportunity {
  id: number;
  title: string;
  location: string | null;
  date: string | null;
  interest_area: string | null;
  description: string | null;
  created_at: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  volunteer_hours: number;
  events_attended: number;
  donations_made: number;
  created_at: string;
  updated_at: string;
}