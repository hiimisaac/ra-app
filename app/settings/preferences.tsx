import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Clock, Bell, Target, Zap, CircleCheck as CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import FilterChip from '@/components/ui/FilterChip';
import { AuthService } from '@/lib/auth';
import { PreferencesService, VolunteerPreferences } from '@/lib/preferencesService';

const VOLUNTEER_CATEGORIES = [
  'Environmental',
  'Education', 
  'Health & Wellness',
  'Community Welfare',
  'Animal Welfare',
  'Arts & Culture',
  'Youth Development',
  'Senior Care',
  'Disaster Relief',
  'Technology & Digital Literacy',
  'Food Security',
  'Housing & Homelessness'
];

const TIME_PREFERENCES = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'Flexible Schedule'
];

const COMMITMENT_LEVELS = [
  'One-time Events',
  'Weekly Commitment',
  'Monthly Commitment',
  'Seasonal Projects',
  'Long-term Partnerships'
];

export default function VolunteerPreferencesScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Preferences state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    // Track changes to enable/disable save button
    setHasChanges(true);
  }, [selectedCategories, selectedTimes, selectedCommitments, emailNotifications, pushNotifications, weeklyDigest, opportunityAlerts, reminderNotifications]);

  const checkAuthState = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      await loadPreferences(currentUser.id);
    }
    setInitialLoading(false);
  };

  const loadPreferences = async (userId: string) => {
    try {
      setInitialLoading(true);
      const { data: preferences, error } = await PreferencesService.getUserPreferences(userId);
      
      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (preferences) {
        setSelectedCategories(preferences.interest_areas || []);
        setSelectedTimes(preferences.time_preferences || []);
        setSelectedCommitments(preferences.commitment_levels || []);
        
        const notifications = preferences.notification_settings || {};
        setEmailNotifications(notifications.email ?? true);
        setPushNotifications(notifications.push ?? true);
        setWeeklyDigest(notifications.weekly_digest ?? true);
        setOpportunityAlerts(notifications.opportunity_alerts ?? true);
        setReminderNotifications(notifications.reminders ?? true);
        
        setHasChanges(false); // Reset changes flag after loading
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const toggleCommitment = (commitment: string) => {
    if (selectedCommitments.includes(commitment)) {
      setSelectedCommitments(selectedCommitments.filter(c => c !== commitment));
    } else {
      setSelectedCommitments([...selectedCommitments, commitment]);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to save your preferences');
      return;
    }

    setLoading(true);
    try {
      const preferences: Omit<VolunteerPreferences, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        interest_areas: selectedCategories,
        time_preferences: selectedTimes,
        commitment_levels: selectedCommitments,
        notification_settings: {
          email: emailNotifications,
          push: pushNotifications,
          weekly_digest: weeklyDigest,
          opportunity_alerts: opportunityAlerts,
          reminders: reminderNotifications
        }
      };

      console.log('Saving preferences:', preferences);
      
      const { data, error } = await PreferencesService.saveUserPreferences(preferences);
      
      if (error) {
        throw new Error(error);
      }
      
      setHasChanges(false);
      
      Alert.alert(
        'Success', 
        'Your volunteer preferences have been saved! We\'ll use these to recommend relevant opportunities and send personalized notifications.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectionSummary = () => {
    const totalSelections = selectedCategories.length + selectedTimes.length + selectedCommitments.length;
    if (totalSelections === 0) {
      return "No preferences selected yet";
    }
    return `${totalSelections} preference${totalSelections === 1 ? '' : 's'} selected`;
  };

  const getImpactDescription = () => {
    const impacts = [];
    
    if (selectedCategories.length > 0) {
      impacts.push(`Personalized opportunities in ${selectedCategories.length} interest area${selectedCategories.length === 1 ? '' : 's'}`);
    }
    
    if (selectedTimes.length > 0) {
      impacts.push(`Scheduling matches for your availability`);
    }
    
    if (selectedCommitments.length > 0) {
      impacts.push(`Opportunities matching your commitment level`);
    }
    
    if (opportunityAlerts) {
      impacts.push(`Smart notifications for relevant opportunities`);
    }

    return impacts;
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Volunteer Preferences</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Volunteer Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Personalize Your Experience</Text>
          <Text style={styles.introDescription}>
            Help us match you with volunteer opportunities that align with your interests, schedule, and commitment level. Your preferences power our recommendation engine.
          </Text>
          <View style={styles.summaryBadge}>
            <Target size={16} color={Colors.primary} style={styles.summaryIcon} />
            <Text style={styles.summaryText}>{getSelectionSummary()}</Text>
          </View>
        </View>

        {getImpactDescription().length > 0 && (
          <View style={styles.impactSection}>
            <View style={styles.impactHeader}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.impactTitle}>How This Helps You</Text>
            </View>
            {getImpactDescription().map((impact, index) => (
              <Text key={index} style={styles.impactItem}>• {impact}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Interest Areas</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the causes and activities you're most passionate about. We'll prioritize showing you opportunities in these areas.
          </Text>
          
          <View style={styles.chipContainer}>
            {VOLUNTEER_CATEGORIES.map(category => (
              <FilterChip
                key={category}
                label={category}
                isSelected={selectedCategories.includes(category)}
                onPress={() => toggleCategory(category)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Time Availability</Text>
          </View>
          <Text style={styles.sectionDescription}>
            When are you typically available to volunteer? This helps us suggest opportunities that fit your schedule.
          </Text>
          
          <View style={styles.chipContainer}>
            {TIME_PREFERENCES.map(time => (
              <FilterChip
                key={time}
                label={time}
                isSelected={selectedTimes.includes(time)}
                onPress={() => toggleTime(time)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={24} color={Colors.highlight} />
            <Text style={styles.sectionTitle}>Commitment Level</Text>
          </View>
          <Text style={styles.sectionDescription}>
            What type of volunteer commitment works best for you? We'll match you with appropriate opportunities.
          </Text>
          
          <View style={styles.chipContainer}>
            {COMMITMENT_LEVELS.map(commitment => (
              <FilterChip
                key={commitment}
                label={commitment}
                isSelected={selectedCommitments.includes(commitment)}
                onPress={() => toggleCommitment(commitment)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color={Colors.info} />
            <Text style={styles.sectionTitle}>Smart Notifications</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive volunteer opportunities and updates via email
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={emailNotifications ? Colors.primary : Colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Get instant alerts for new opportunities matching your interests
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={pushNotifications ? Colors.primary : Colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Opportunity Alerts</Text>
              <Text style={styles.settingDescription}>
                Notify me when new opportunities match my preferences (powered by your selections above)
              </Text>
            </View>
            <Switch
              value={opportunityAlerts}
              onValueChange={setOpportunityAlerts}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={opportunityAlerts ? Colors.primary : Colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Event Reminders</Text>
              <Text style={styles.settingDescription}>
                Remind me about upcoming volunteer sessions and events
              </Text>
            </View>
            <Switch
              value={reminderNotifications}
              onValueChange={setReminderNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={reminderNotifications ? Colors.primary : Colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Weekly Digest</Text>
              <Text style={styles.settingDescription}>
                Get a weekly summary of new opportunities and your impact
              </Text>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={weeklyDigest ? Colors.primary : Colors.muted}
            />
          </View>
        </View>

        {(selectedCategories.length > 0 || selectedTimes.length > 0 || selectedCommitments.length > 0) && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Your Preferences Summary</Text>
            
            {selectedCategories.length > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Interest Areas ({selectedCategories.length}):</Text>
                <Text style={styles.summaryValue}>
                  {selectedCategories.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedTimes.length > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Time Preferences ({selectedTimes.length}):</Text>
                <Text style={styles.summaryValue}>
                  {selectedTimes.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedCommitments.length > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Commitment Levels ({selectedCommitments.length}):</Text>
                <Text style={styles.summaryValue}>
                  {selectedCommitments.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        <Button
          title={loading ? "Saving..." : hasChanges ? "Save Preferences" : "Preferences Saved"}
          onPress={handleSavePreferences}
          disabled={loading || !user || !hasChanges}
          style={[styles.saveButton, !hasChanges && styles.savedButton]}
        />

        {!user && (
          <View style={styles.signInPrompt}>
            <Text style={styles.signInText}>
              Sign in to save your preferences and get personalized volunteer recommendations.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
  },
  introSection: {
    backgroundColor: Colors.primaryLight + '15',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  introTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 8,
  },
  introDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  summaryIcon: {
    marginRight: 6,
  },
  summaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  impactSection: {
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.success,
    marginLeft: 8,
  },
  impactItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  summarySection: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  summaryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    marginVertical: 16,
    marginBottom: 32,
  },
  savedButton: {
    backgroundColor: Colors.success,
  },
  signInPrompt: {
    backgroundColor: Colors.info + '20',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.info,
    textAlign: 'center',
    lineHeight: 20,
  },
});