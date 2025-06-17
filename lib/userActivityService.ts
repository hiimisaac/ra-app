import { supabase } from './supabase';

export interface VolunteerSession {
  id: string;
  user_id: string;
  opportunity_id?: number;
  title: string;
  description?: string;
  hours_worked: number;
  session_date: string;
  location?: string;
  status: 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id?: string;
  event_title: string;
  registration_date: string;
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface UserDonation {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  donation_type: 'monetary' | 'in_kind';
  description?: string;
  donation_date: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  type: 'volunteer' | 'event' | 'donation';
  title: string;
  date: string;
  location?: string;
  hours?: number;
  amount?: number;
  status: string;
}

export class UserActivityService {
  // Volunteer Sessions
  static async addVolunteerSession(session: Omit<VolunteerSession, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_volunteer_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding volunteer session:', error);
      return { data: null, error: error.message };
    }
  }

  static async getUserVolunteerSessions(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('user_volunteer_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching volunteer sessions:', error);
      return { data: [], error: error.message };
    }
  }

  // Event Registrations
  static async registerForEvent(registration: Omit<EventRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>) {
    try {
      const { data, error } = await supabase
        .from('user_event_registrations')
        .insert([{
          ...registration,
          registration_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error registering for event:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateEventAttendance(registrationId: string, attendanceStatus: EventRegistration['attendance_status']) {
    try {
      const { data, error } = await supabase
        .from('user_event_registrations')
        .update({ 
          attendance_status: attendanceStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating event attendance:', error);
      return { data: null, error: error.message };
    }
  }

  static async getUserEventRegistrations(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('user_event_registrations')
        .select('*')
        .eq('user_id', userId)
        .order('registration_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching event registrations:', error);
      return { data: [], error: error.message };
    }
  }

  // Donations
  static async addDonation(donation: Omit<UserDonation, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_donations')
        .insert([donation])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding donation:', error);
      return { data: null, error: error.message };
    }
  }

  static async getUserDonations(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('user_donations')
        .select('*')
        .eq('user_id', userId)
        .order('donation_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching donations:', error);
      return { data: [], error: error.message };
    }
  }

  // Combined Activities
  static async getUserActivities(userId: string, limit: number = 20): Promise<{ data: UserActivity[]; error: string | null }> {
    try {
      const [volunteerResult, eventResult, donationResult] = await Promise.all([
        this.getUserVolunteerSessions(userId, limit),
        this.getUserEventRegistrations(userId, limit),
        this.getUserDonations(userId, limit)
      ]);

      if (volunteerResult.error || eventResult.error || donationResult.error) {
        throw new Error('Failed to fetch some activities');
      }

      const activities: UserActivity[] = [];

      // Add volunteer sessions
      volunteerResult.data.forEach(session => {
        activities.push({
          id: session.id,
          type: 'volunteer',
          title: session.title,
          date: session.session_date,
          location: session.location,
          hours: session.hours_worked,
          status: session.status
        });
      });

      // Add event registrations (only attended ones)
      eventResult.data
        .filter(reg => reg.attendance_status === 'attended')
        .forEach(registration => {
          activities.push({
            id: registration.id,
            type: 'event',
            title: registration.event_title,
            date: registration.registration_date,
            status: registration.attendance_status
          });
        });

      // Add donations
      donationResult.data
        .filter(donation => donation.status === 'completed')
        .forEach(donation => {
          activities.push({
            id: donation.id,
            type: 'donation',
            title: donation.description || `${donation.donation_type} donation`,
            date: donation.donation_date,
            amount: donation.amount,
            status: donation.status
          });
        });

      // Sort by date (most recent first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { 
        data: activities.slice(0, limit), 
        error: null 
      };
    } catch (error: any) {
      console.error('Error fetching user activities:', error);
      return { data: [], error: error.message };
    }
  }

  // Utility function to refresh user stats manually
  static async refreshUserStats(userId: string) {
    try {
      const { error } = await supabase.rpc('update_user_stats', {
        target_user_id: userId
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error refreshing user stats:', error);
      return { error: error.message };
    }
  }
}