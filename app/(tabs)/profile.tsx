import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Award, Calendar, Settings, ChevronRight, Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import ProfileStats from '@/components/ProfileStats';
import UserActivityItem from '@/components/UserActivityItem';
import AuthModal from '@/components/auth/AuthModal';
import { AuthService, UserProfile } from '@/lib/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { userActivities } from '@/data/mockData';

export default function ProfileScreen() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user, profile) => {
      setUser(user);
      setUserProfile(profile);
      setLoading(false);
      
      // Clear any previous profile errors when auth state changes
      setProfileError(null);
      
      // If user exists but no profile, show error
      if (user && !profile) {
        setProfileError('Unable to load or create user profile. Please try signing out and back in.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const { profile, error } = await AuthService.ensureUserProfile(currentUser);
        setUserProfile(profile);
        
        if (currentUser && !profile) {
          setProfileError(error || 'Unable to load or create user profile. Please try signing out and back in.');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setProfileError('An error occurred while loading your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
    setProfileError(null);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: async () => {
            const { error } = await AuthService.signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleRetryProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setProfileError(null);
    
    try {
      const { profile, error } = await AuthService.ensureUserProfile(user);
      setUserProfile(profile);
      
      if (!profile) {
        setProfileError(error || 'Unable to create user profile. Please contact support.');
      }
    } catch (error) {
      console.error('Error retrying profile creation:', error);
      setProfileError('An error occurred while creating your profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.loginContainer}>
            <View style={styles.iconContainer}>
              <User size={80} color={Colors.primary} />
            </View>
            <Text style={styles.loginTitle}>Join Our Community</Text>
            <Text style={styles.loginSubtitle}>
              Sign up to track your volunteer activities, RSVP to events, and connect with other volunteers making a difference.
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Award size={20} color={Colors.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>Track volunteer hours and impact</Text>
              </View>
              <View style={styles.benefitItem}>
                <Calendar size={20} color={Colors.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>RSVP to events and workshops</Text>
              </View>
              <View style={styles.benefitItem}>
                <Plus size={20} color={Colors.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>Discover new opportunities</Text>
              </View>
            </View>
            
            <Button 
              title="Sign In / Create Account" 
              onPress={handleLogin} 
              style={styles.loginButton}
            />
            <TouchableOpacity style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // User is logged in but profile failed to load/create
  if (user && !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.iconContainer}>
            <User size={80} color={Colors.textSecondary} />
          </View>
          <Text style={styles.errorTitle}>Profile Setup Issue</Text>
          <Text style={styles.errorMessage}>
            {profileError || 'We encountered an issue setting up your profile. This might be because your email needs to be confirmed.'}
          </Text>
          
          <View style={styles.errorActions}>
            <Button 
              title="Try Again" 
              onPress={handleRetryProfile}
              style={styles.retryButton}
            />
            <TouchableOpacity style={styles.logoutTextButton} onPress={handleLogout}>
              <Text style={styles.logoutTextButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar_url ? (
                <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={32} color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userProfile.name}</Text>
              <Text style={styles.email}>{userProfile.email}</Text>
              <Text style={styles.memberSince}>
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ProfileStats 
          volunteerHours={userProfile.volunteer_hours} 
          eventsAttended={userProfile.events_attended}
          donations={userProfile.donations_made}
        />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {userActivities.length > 0 ? (
            <View style={styles.activityContainer}>
              {userActivities.slice(0, 3).map(activity => (
                <UserActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                No activities yet. Start volunteering to see your impact here!
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Activities</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Calendar size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Calendar Integration</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Award size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Volunteer Preferences</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <Settings size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Account Settings</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 24,
    borderRadius: 50,
    marginBottom: 32,
  },
  loginTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    marginRight: 16,
  },
  benefitText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  loginButton: {
    width: '100%',
    marginBottom: 16,
  },
  errorActions: {
    width: '100%',
    alignItems: 'center',
  },
  retryButton: {
    width: '100%',
    marginBottom: 16,
  },
  logoutTextButton: {
    paddingVertical: 12,
  },
  logoutTextButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  memberSince: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  activityContainer: {
    paddingHorizontal: 16,
  },
  emptyActivity: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  settingsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
  },
});