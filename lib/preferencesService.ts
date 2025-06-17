import { supabase } from './supabase';

export interface VolunteerPreferences {
  id?: string;
  user_id: string;
  interest_areas: string[];
  time_preferences: string[];
  commitment_levels: string[];
  notification_settings: {
    email: boolean;
    push: boolean;
    weekly_digest: boolean;
    opportunity_alerts: boolean;
    reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityMatch {
  opportunity_id: string;
  match_score: number;
  matching_criteria: string[];
}

export class PreferencesService {
  // Save user preferences
  static async saveUserPreferences(preferences: Omit<VolunteerPreferences, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .upsert([preferences], { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      return { data: null, error: error.message };
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      return { data: null, error: error.message };
    }
  }

  // Get recommended opportunities based on preferences
  static async getRecommendedOpportunities(userId: string, limit: number = 10) {
    try {
      // First get user preferences
      const { data: preferences } = await this.getUserPreferences(userId);
      
      if (!preferences) {
        // Return all opportunities if no preferences set
        const { data, error } = await supabase
          .from('volunteer_opportunities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { data: data || [], error: null };
      }

      // Build query based on preferences
      let query = supabase
        .from('volunteer_opportunities')
        .select('*');

      // Filter by interest areas if specified
      if (preferences.interest_areas && preferences.interest_areas.length > 0) {
        query = query.in('interest_area', preferences.interest_areas);
      }

      // Add time-based filtering logic here if you have time fields
      // For now, just order by creation date
      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error getting recommended opportunities:', error);
      return { data: [], error: error.message };
    }
  }

  // Calculate match score for an opportunity
  static calculateMatchScore(preferences: VolunteerPreferences, opportunity: any): number {
    let score = 0;
    const maxScore = 100;

    // Interest area match (40% of score)
    if (preferences.interest_areas.includes(opportunity.interest_area)) {
      score += 40;
    }

    // Location preference (30% of score) - if you add location back
    // if (preferences.preferred_locations?.includes(opportunity.location)) {
    //   score += 30;
    // }

    // Time preference matching (30% of score)
    // This would require more complex logic based on opportunity timing
    if (opportunity.date) {
      const opportunityDate = new Date(opportunity.date);
      const dayOfWeek = opportunityDate.getDay();
      const hour = opportunityDate.getHours();

      // Simple time matching logic
      if (preferences.time_preferences.includes('Flexible Schedule')) {
        score += 30;
      } else if (
        (dayOfWeek >= 1 && dayOfWeek <= 5 && preferences.time_preferences.some(pref => pref.includes('Weekday'))) ||
        (dayOfWeek === 0 || dayOfWeek === 6 && preferences.time_preferences.some(pref => pref.includes('Weekend')))
      ) {
        score += 20;
      }
    }

    return Math.min(score, maxScore);
  }

  // Get opportunities with match scores
  static async getMatchedOpportunities(userId: string, limit: number = 20): Promise<{ data: OpportunityMatch[]; error: string | null }> {
    try {
      const { data: preferences } = await this.getUserPreferences(userId);
      
      if (!preferences) {
        return { data: [], error: 'No preferences found' };
      }

      const { data: opportunities, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .limit(100); // Get more to calculate matches

      if (error) throw error;

      const matches: OpportunityMatch[] = opportunities
        .map(opportunity => {
          const matchScore = this.calculateMatchScore(preferences, opportunity);
          const matchingCriteria: string[] = [];

          if (preferences.interest_areas.includes(opportunity.interest_area)) {
            matchingCriteria.push('Interest Area');
          }

          return {
            opportunity_id: opportunity.id.toString(),
            match_score: matchScore,
            matching_criteria: matchingCriteria
          };
        })
        .filter(match => match.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);

      return { data: matches, error: null };
    } catch (error: any) {
      console.error('Error getting matched opportunities:', error);
      return { data: [], error: error.message };
    }
  }

  // Update notification preferences only
  static async updateNotificationPreferences(userId: string, notificationSettings: VolunteerPreferences['notification_settings']) {
    try {
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .update({ 
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      return { data: null, error: error.message };
    }
  }
}