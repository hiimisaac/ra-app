import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Award, Calendar, Settings, ChevronRight, Plus } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import ProfileStats from '@/components/ProfileStats';
import UserActivityItem from '@/components/UserActivityItem';
import AuthModal from '@/components/auth/AuthModal';
import { AuthService, UserProfile } from '@/lib/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserActivityService, UserActivity } from '@/lib/userActivityService';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Use a ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    console.log('ProfileScreen: Component mounted, setting up auth listener');
    isMounted.current = true;
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user, profile) => {
      console.log('ProfileScreen: Auth state changed -', user ? 'User present' : 'No user', profile ? 'Profile present' : 'No profile');
      
      // Only update state if component is still mounted
      if (!isMounted.current) {
        console.log('ProfileScreen: Component unmounted, skipping state update');
        return;
      }
      
      // Always update states immediately
      console.log('ProfileScreen: Updating states - user:', !!user, 'profile:', !!profile);
      setUser(user);
      setUserProfile(profile);
      setLoading(false);
      setLoggingOut(false);
      
      // Clear any previous profile errors when auth state changes
      setProfileError(null);
      
      // If user exists but no profile, show error
      if (user && !profile) {
        setProfileError('Unable to load or create user profile. Please try signing out and back in.');
      }

      // Load user activities if we have a user and profile
      if (user && profile) {
        loadUserActivities(user.id);
      } else {
        setUserActivities([]);
      }
    });

    return () => {
      console.log('ProfileScreen: Component unmounting, cleaning up');
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // Refresh profile data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      console.log('ProfileScreen: Screen focused, refreshing profile data');
      if (user && isMounted.current) {
        refreshProfileData();
      }
    }, [user])
  );

  const refreshProfileData = async () => {
    if (!user || !isMounted.current) return;
    
    try {
      console.log('ProfileScreen: Refreshing profile data for user:', user.id);
      const { profile, error } = await AuthService.getUserProfile(user.id);
      
      if (!isMounted.current) return;
      
      if (profile) {
        console.log('ProfileScreen: Profile refreshed successfully:', profile);
        setUserProfile(profile);
        setProfileError(null);
      } else if (error) {
        console.error('ProfileScreen: Error refreshing profile:', error);
        setProfileError(error);
      }
    } catch (error) {
      console.error('ProfileScreen: Exception refreshing profile:', error);
      if (isMounted.current) {
        setProfileError('Failed to refresh profile data');
      }
    }
  };

  const checkAuthState = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      console.log('ProfileScreen: Initial auth check', currentUser ? 'User found' : 'No user');
      
      if (!isMounted.current) return;
      
      setUser(currentUser);
      
      if (currentUser) {
        const { profile, error } = await AuthService.ensureUserProfile(currentUser);
        
        if (!isMounted.current) return;
        
        setUserProfile(profile);
        
        if (currentUser && !profile) {
          setProfileError(error || 'Unable to load or create user profile. Please try signing out and back in.');
        } else if (profile) {
          // Load user activities
          loadUserActivities(currentUser.id);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      if (isMounted.current) {
        setProfileError('An error occurred while loading your profile.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const loadUserActivities = async (userId: string) => {
    if (!isMounted.current) return;
    
    setActivitiesLoading(true);
    
    try {
      const { data, error } = await UserActivityService.getUserActivities(userId, 5);
      
      if (!isMounted.current) return;
      
      if (error) {
        console.error('Error loading user activities:', error);
      } else {
        setUserActivities(data);
      }
    } catch (error) {
      console.error('Error loading user activities:', error);
    } finally {
      if (isMounted.current) {
        setActivitiesLoading(false);
      }
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
    console.log('ProfileScreen: Logout button pressed');
    performLogout(); 
  };

  const performLogout = async () => {
    console.log('ProfileScreen: Performing logout...');
    
    if (!isMounted.current) return;
    
    setLoggingOut(true);
    
    try {
      // Immediately clear states to ensure UI updates quickly
      console.log('ProfileScreen: Clearing states immediately');
      setUser(null);
      setUserProfile(null);
      setUserActivities([]);
      setProfileError(null);
      
      const { error } = await AuthService.signOut();
      
      if (!isMounted.current) return;
      
      if (error) {
        console.error('ProfileScreen: Logout error:', error);
        // Restore states if logout failed
        await checkAuthState();
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      } else {
        console.log('ProfileScreen: Logout successful');
      }
    } catch (error) {
      console.error('ProfileScreen: Logout exception:', error);
      if (isMounted.current) {
        // Restore states if logout failed
        await checkAuthState();
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoggingOut(false);
      }
    }
  };

  const handleRetryProfile = async () => {
    if (!user || !isMounted.current) return;
    
    setLoading(true);
    setProfileError(null);
    
    try {
      const { profile, error } = await AuthService.ensureUserProfile(user);
      
      if (!isMounted.current) return;
      
      setUserProfile(profile);
      
      if (!profile) {
        setProfileError(error || 'Unable to create user profile. Please contact support.');
      } else {
        // Load user activities
        loadUserActivities(user.id);
      }
    } catch (error) {
      console.error('Error retrying profile creation:', error);
      if (isMounted.current) {
        setProfileError('An error occurred while creating your profile.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleRefreshStats = async () => {
    if (!user || !isMounted.current) return;
    
    try {
      await UserActivityService.refreshUserStats(user.id);
      // Reload the profile to get updated stats
      const { profile } = await AuthService.getUserProfile(user.id);
      if (profile && isMounted.current) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const handleSettingsNavigation = (screen: string) => {
    router.push(`/settings/${screen}` as any);
  };

  const handleViewAllActivities = () => {
    router.push('/activities');
  };

  // Show loading state
  if (loading || loggingOut) {
    console.log('ProfileScreen: Rendering loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {loggingOut ? 'Signing out...' : 'Loading profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show login screen if no user
  if (!user) {
    console.log('ProfileScreen: Rendering login screen (no user)');
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.loginContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/ra-logo-white.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.loginTitle}>Join Riley's Army</Text>
            <Text style={styles.loginSubtitle}>
              Sign up to track your volunteer activities, RSVP to events, and connect with other volunteers making a difference in our community.
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
    console.log('ProfileScreen: Rendering error screen (user but no profile)');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/ra-logo-white.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
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

  // User is logged in and has profile - show full profile screen
  console.log('ProfileScreen: Rendering full profile screen');
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
        </View>

        <ProfileStats 
          volunteerHours={userProfile.volunteer_hours} 
          eventsAttended={userProfile.events_attended}
          donations={userProfile.donations_made}
          onRefresh={handleRefreshStats}
        />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activitiesLoading && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
          
          {userActivities.length > 0 ? (
            <View style={styles.activityContainer}>
              {userActivities.map(activity => (
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
          
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllActivities}>
            <Text style={styles.viewAllText}>View All Activities</Text>
            <ChevronRight size={16} color={Colors.primary} style={styles.viewAllIcon} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => handleSettingsNavigation('calendar')}
            >
              <View style={styles.settingsItemContent}>
                <Calendar size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Calendar Integration</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => handleSettingsNavigation('preferences')}
            >
              <View style={styles.settingsItemContent}>
                <Award size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Volunteer Preferences</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => handleSettingsNavigation('account')}
            >
              <View style={styles.settingsItemContent}>
                <Settings size={22} color={Colors.primary} style={styles.settingsIcon} />
                <Text style={styles.settingsText}>Account Settings</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button at Bottom */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={[styles.logoutBottomButton, loggingOut && styles.logoutBottomButtonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={Colors.white} style={styles.logoutIcon} />
            <Text style={styles.logoutBottomButtonText}>
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
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
  logoContainer: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 50,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  loginTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
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
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  viewAllIcon: {
    marginLeft: 4,
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
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  logoutBottomButton: {
    backgroundColor: '#E74C3C', // Soft red color
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 56, // Ensure minimum touch target
  },
  logoutBottomButtonDisabled: {
    backgroundColor: '#BDC3C7', // Muted color when disabled
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutBottomButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});