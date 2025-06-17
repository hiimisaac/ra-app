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
  // Save user preferences with better error handling
  static async saveUserPreferences(preferences: Omit<VolunteerPreferences, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Saving preferences to database:', preferences);
      
      // First check if preferences already exist
      const { data: existingPrefs } = await supabase
        .from('user_volunteer_preferences')
        .select('id')
        .eq('user_id', preferences.user_id)
        .maybeSingle();

      let result;
      
      if (existingPrefs) {
        // Update existing preferences
        console.log('Updating existing preferences for user:', preferences.user_id);
        result = await supabase
          .from('user_volunteer_preferences')
          .update({
            interest_areas: preferences.interest_areas,
            time_preferences: preferences.time_preferences,
            commitment_levels: preferences.commitment_levels,
            notification_settings: preferences.notification_settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', preferences.user_id)
          .select()
          .single();
      } else {
        // Insert new preferences
        console.log('Creating new preferences for user:', preferences.user_id);
        result = await supabase
          .from('user_volunteer_preferences')
          .insert([{
            user_id: preferences.user_id,
            interest_areas: preferences.interest_areas,
            time_preferences: preferences.time_preferences,
            commitment_levels: preferences.commitment_levels,
            notification_settings: preferences.notification_settings
          }])
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase error saving preferences:', error);
        throw error;
      }

      console.log('Preferences saved successfully:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      return { data: null, error: error.message };
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string) {
    try {
      console.log('Fetching preferences for user:', userId);
      
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching preferences:', error);
        throw error;
      }

      console.log('Preferences fetched:', data ? 'Found' : 'Not found');
      return { data: data || null, error: null };
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      return { data: null, error: error.message };
    }
  }

  // Get recommended opportunities based on preferences
  static async getRecommendedOpportunities(userId: string, limit: number = 10) {
    try {
      console.log('Getting recommended opportunities for user:', userId);
      
      // First get user preferences
      const { data: preferences } = await this.getUserPreferences(userId);
      
      if (!preferences || !preferences.interest_areas || preferences.interest_areas.length === 0) {
        console.log('No preferences found, returning all opportunities');
        // Return all opportunities if no preferences set
        const { data, error } = await supabase
          .from('volunteer_opportunities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { data: data || [], error: null };
      }

      console.log('User has preferences, filtering opportunities by:', preferences.interest_areas);

      // Build query based on preferences
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .in('interest_area', preferences.interest_areas)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log('Recommended opportunities found:', data?.length || 0);
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

    // Time preference matching (30% of score)
    if (opportunity.date) {
      const opportunityDate = new Date(opportunity.date);
      const dayOfWeek = opportunityDate.getDay();

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

    // Commitment level matching (30% of score)
    if (preferences.commitment_levels.length > 0) {
      // This would need more sophisticated matching based on opportunity type
      score += 15; // Base score for having commitment preferences
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

          if (preferences.time_preferences.length > 0) {
            matchingCriteria.push('Time Preference');
          }

          if (preferences.commitment_levels.length > 0) {
            matchingCriteria.push('Commitment Level');
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
      console.log('Updating notification preferences for user:', userId);
      
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .update({ 
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }

      console.log('Notification preferences updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      return { data: null, error: error.message };
    }
  }

  // Delete user preferences
  static async deleteUserPreferences(userId: string) {
    try {
      const { error } = await supabase
        .from('user_volunteer_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting preferences:', error);
      return { error: error.message };
    }
  }
}