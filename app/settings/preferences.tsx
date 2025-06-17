import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, MapPin, Clock, Bell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import FilterChip from '@/components/ui/FilterChip';
import { AuthService } from '@/lib/auth';

const VOLUNTEER_CATEGORIES = [
  'Environmental',
  'Education', 
  'Health',
  'Community Welfare',
  'Animal Welfare',
  'Arts & Culture',
  'Youth Development',
  'Senior Care',
  'Disaster Relief',
  'Technology'
];

const LOCATIONS = [
  'Downtown',
  'Westside',
  'Northside', 
  'Eastside',
  'Southside',
  'Suburbs',
  'Remote/Virtual'
];

const TIME_PREFERENCES = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'Flexible'
];

export default function VolunteerPreferencesScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Preferences state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    checkAuthState();
    loadPreferences();
  }, []);

  const checkAuthState = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const loadPreferences = async () => {
    // In a real app, you'd load these from the database
    // For now, we'll use some default selections
    setSelectedCategories(['Environmental', 'Community Welfare']);
    setSelectedLocations(['Downtown', 'Westside']);
    setSelectedTimes(['Weekend Mornings', 'Weekday Evenings']);
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In a real app, you'd save these preferences to the database
      // For now, we'll just show a success message
      
      const preferences = {
        categories: selectedCategories,
        locations: selectedLocations,
        timePreferences: selectedTimes,
        maxDistance,
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          weeklyDigest: weeklyDigest
        }
      };

      console.log('Saving preferences:', preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Your volunteer preferences have been saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Volunteer Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Interest Areas</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the causes and activities you're most passionate about.
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
            <MapPin size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Preferred Locations</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose the areas where you'd like to volunteer.
          </Text>
          
          <View style={styles.chipContainer}>
            {LOCATIONS.map(location => (
              <FilterChip
                key={location}
                label={location}
                isSelected={selectedLocations.includes(location)}
                onPress={() => toggleLocation(location)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={Colors.highlight} />
            <Text style={styles.sectionTitle}>Time Availability</Text>
          </View>
          <Text style={styles.sectionDescription}>
            When are you typically available to volunteer?
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
            <Bell size={24} color={Colors.info} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified about new volunteer opportunities via email
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
                Receive instant notifications on your device
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
              <Text style={styles.settingLabel}>Weekly Digest</Text>
              <Text style={styles.settingDescription}>
                Get a weekly summary of new opportunities
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

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Your Preferences Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Interest Areas:</Text>
            <Text style={styles.summaryValue}>
              {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'None selected'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Locations:</Text>
            <Text style={styles.summaryValue}>
              {selectedLocations.length > 0 ? selectedLocations.join(', ') : 'None selected'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time Preferences:</Text>
            <Text style={styles.summaryValue}>
              {selectedTimes.length > 0 ? selectedTimes.join(', ') : 'None selected'}
            </Text>
          </View>
        </View>

        <Button
          title={loading ? "Saving..." : "Save Preferences"}
          onPress={handleSavePreferences}
          disabled={loading || !user}
          style={styles.saveButton}
        />
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
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
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
});