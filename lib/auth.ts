import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  volunteer_hours: number;
  events_attended: number;
  donations_made: number;
}

export class AuthService {
  static async signUp({ email, password, name }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Don't create profile during signup - wait for email confirmation
      // Profile will be created when user signs in after email confirmation
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful sign in, ensure user profile exists
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  static async signOut() {
    try {
      console.log('AuthService: Starting signOut...');
      
      // Clear the session
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error('AuthService: Supabase signOut error:', error);
        throw error;
      }
      
      console.log('AuthService: SignOut successful');
      return { error: null };
    } catch (error: any) {
      console.error('AuthService: SignOut failed:', error);
      return { error: error.message };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }
      
      return { profile: data, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  }

  static async ensureUserProfile(user: User): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      // Check if profile already exists
      const { profile: existingProfile } = await this.getUserProfile(user.id);
      if (existingProfile) {
        return { profile: existingProfile, error: null };
      }

      // Create profile if it doesn't exist
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      return await this.createUserProfile(user.id, { 
        email: user.email!, 
        name: userName 
      });
    } catch (error: any) {
      console.error('Error ensuring user profile:', error);
      return { profile: null, error: error.message };
    }
  }

  static async createUserProfile(userId: string, userData: { email: string; name: string }) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: userData.email,
            name: userData.name,
            volunteer_hours: 0,
            events_attended: 0,
            donations_made: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return { profile: null, error: error.message };
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  }

  static onAuthStateChange(callback: (user: User | null, userProfile: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      
      console.log('AuthService: Auth state change event:', event, user ? 'User present' : 'No user');
      
      // Handle sign out - clear everything immediately and call callback
      if (event === 'SIGNED_OUT' || !user) {
        console.log('AuthService: User signed out, calling callback with null values');
        callback(null, null);
        return;
      }
      
      // For any other event with a user, try to get/create profile
      let userProfile: UserProfile | null = null;
      
      try {
        if (event === 'SIGNED_IN') {
          console.log('AuthService: User signed in, ensuring profile exists');
          const { profile } = await this.ensureUserProfile(user);
          userProfile = profile;
        } else {
          console.log('AuthService: Other event, getting existing profile');
          const { profile } = await this.getUserProfile(user.id);
          userProfile = profile;
        }
      } catch (error) {
        console.error('AuthService: Error handling profile during auth state change:', error);
      }
      
      console.log('AuthService: Calling callback with user and profile');
      callback(user, userProfile);
    });
  }
}