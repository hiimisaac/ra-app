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

      // Only create profile if user is confirmed (not pending email confirmation)
      if (data.user && data.user.email_confirmed_at) {
        await this.createUserProfile(data.user.id, { email, name });
      }

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

      // Check if user profile exists, create if it doesn't
      if (data.user) {
        const { profile } = await this.getUserProfile(data.user.id);
        if (!profile) {
          const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
          await this.createUserProfile(data.user.id, { 
            email: data.user.email!, 
            name: userName 
          });
        }
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
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

  static async createUserProfile(userId: string, userData: { email: string; name: string }) {
    try {
      // First check if profile already exists
      const { profile: existingProfile } = await this.getUserProfile(userId);
      if (existingProfile) {
        return { profile: existingProfile, error: null };
      }

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

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      
      // If user just signed in and doesn't have a profile, create one
      if (user && event === 'SIGNED_IN') {
        const { profile } = await this.getUserProfile(user.id);
        if (!profile) {
          const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          await this.createUserProfile(user.id, { 
            email: user.email!, 
            name: userName 
          });
        }
      }
      
      callback(user);
    });
  }
}