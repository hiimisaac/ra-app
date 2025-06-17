import { supabase, NewsItem, ImpactStory, Event } from '@/lib/supabase';

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
}