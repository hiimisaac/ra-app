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
  // Test database connection
  static async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error, count } = await supabase
        .from('user_volunteer_preferences')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      console.log('Connection test result:', { data, error, count });
      return { connected: !error, error };
    } catch (error: any) {
      console.error('Connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }

  // Save user preferences with extensive debugging
  static async saveUserPreferences(preferences: Omit<VolunteerPreferences, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('=== STARTING PREFERENCES SAVE ===');
      console.log('Input preferences:', JSON.stringify(preferences, null, 2));
      
      // Test connection first
      const connectionTest = await this.testConnection();
      console.log('Connection test:', connectionTest);
      
      if (!connectionTest.connected) {
        throw new Error(`Database connection failed: ${connectionTest.error}`);
      }

      // Validate user_id
      if (!preferences.user_id) {
        throw new Error('user_id is required');
      }

      console.log('Checking for existing preferences for user:', preferences.user_id);
      
      // Check if preferences already exist
      const { data: existingPrefs, error: selectError } = await supabase
        .from('user_volunteer_preferences')
        .select('id, user_id, created_at')
        .eq('user_id', preferences.user_id)
        .maybeSingle();

      console.log('Existing preferences check:', { 
        found: !!existingPrefs, 
        data: existingPrefs, 
        error: selectError 
      });

      if (selectError) {
        console.error('Error checking existing preferences:', selectError);
        throw selectError;
      }

      // Prepare the data to save
      const dataToSave = {
        user_id: preferences.user_id,
        interest_areas: preferences.interest_areas || [],
        time_preferences: preferences.time_preferences || [],
        commitment_levels: preferences.commitment_levels || [],
        notification_settings: preferences.notification_settings || {
          email: true,
          push: true,
          weekly_digest: true,
          opportunity_alerts: true,
          reminders: true
        }
      };

      console.log('Data to save:', JSON.stringify(dataToSave, null, 2));

      let result;
      
      if (existingPrefs) {
        // Update existing preferences
        console.log('UPDATING existing preferences...');
        result = await supabase
          .from('user_volunteer_preferences')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', preferences.user_id)
          .select('*')
          .single();
      } else {
        // Insert new preferences
        console.log('INSERTING new preferences...');
        result = await supabase
          .from('user_volunteer_preferences')
          .insert([dataToSave])
          .select('*')
          .single();
      }

      const { data, error } = result;

      console.log('Database operation result:', {
        success: !error,
        data: data,
        error: error
      });

      if (error) {
        console.error('Supabase error saving preferences:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('=== PREFERENCES SAVED SUCCESSFULLY ===');
      console.log('Saved data:', JSON.stringify(data, null, 2));

      // Verify the save by reading it back
      console.log('Verifying save by reading back...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_volunteer_preferences')
        .select('*')
        .eq('user_id', preferences.user_id)
        .single();

      console.log('Verification result:', {
        found: !!verifyData,
        data: verifyData,
        error: verifyError
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('=== ERROR SAVING PREFERENCES ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      return { data: null, error: error.message };
    }
  }

  // Get user preferences with debugging
  static async getUserPreferences(userId: string) {
    try {
      console.log('=== FETCHING PREFERENCES ===');
      console.log('Fetching preferences for user:', userId);
      
      if (!userId) {
        throw new Error('userId is required');
      }

      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Fetch result:', {
        found: !!data,
        data: data,
        error: error
      });

      if (error) {
        console.error('Supabase error fetching preferences:', error);
        throw error;
      }

      console.log('=== PREFERENCES FETCHED ===');
      return { data: data || null, error: null };
    } catch (error: any) {
      console.error('=== ERROR FETCHING PREFERENCES ===');
      console.error('Error details:', error);
      return { data: null, error: error.message };
    }
  }

  // List all preferences (for debugging)
  static async getAllPreferences() {
    try {
      console.log('Fetching ALL preferences for debugging...');
      const { data, error } = await supabase
        .from('user_volunteer_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('All preferences:', {
        count: data?.length || 0,
        data: data,
        error: error
      });

      return { data: data || [], error: error?.message || null };
    } catch (error: any) {
      console.error('Error fetching all preferences:', error);
      return { data: [], error: error.message };
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