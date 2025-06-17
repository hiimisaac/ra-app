import { supabase, NewsItem, ImpactStory, Event, VolunteerOpportunity } from '@/lib/supabase';
import { PreferencesService } from '@/lib/preferencesService';

export class ContentService {
  // News Items
  static async getNewsItems(limit: number = 10): Promise<NewsItem[]> {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching news items:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching news items:', err);
      return [];
    }
  }

  static async getNewsItem(id: string): Promise<NewsItem | null> {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching news item:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Network error fetching news item:', err);
      return null;
    }
  }

  // Impact Stories
  static async getImpactStories(limit: number = 10): Promise<ImpactStory[]> {
    try {
      const { data, error } = await supabase
        .from('impact_stories')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching impact stories:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching impact stories:', err);
      return [];
    }
  }

  static async getFeaturedStories(): Promise<ImpactStory[]> {
    try {
      const { data, error } = await supabase
        .from('impact_stories')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured stories:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching featured stories:', err);
      return [];
    }
  }

  static async getImpactStory(id: string): Promise<ImpactStory | null> {
    try {
      const { data, error } = await supabase
        .from('impact_stories')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching impact story:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Network error fetching impact story:', err);
      return null;
    }
  }

  // Events
  static async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching events:', err);
      return [];
    }
  }

  static async getEvent(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Network error fetching event:', err);
      return null;
    }
  }

  // Volunteer Opportunities - Enhanced with preferences
  static async getVolunteerOpportunities(limit: number = 50, userId?: string): Promise<VolunteerOpportunity[]> {
    try {
      // If user is provided, try to get personalized recommendations
      if (userId) {
        const { data: recommendedOpportunities } = await PreferencesService.getRecommendedOpportunities(userId, limit);
        if (recommendedOpportunities && recommendedOpportunities.length > 0) {
          return recommendedOpportunities;
        }
      }

      // Fallback to all opportunities
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching volunteer opportunities:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching volunteer opportunities:', err);
      return [];
    }
  }

  static async getPersonalizedOpportunities(userId: string, limit: number = 20): Promise<VolunteerOpportunity[]> {
    try {
      const { data: opportunities } = await PreferencesService.getRecommendedOpportunities(userId, limit);
      return opportunities || [];
    } catch (err) {
      console.error('Error fetching personalized opportunities:', err);
      return [];
    }
  }

  static async getVolunteerOpportunity(id: string): Promise<VolunteerOpportunity | null> {
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching volunteer opportunity:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Network error fetching volunteer opportunity:', err);
      return null;
    }
  }
}