import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Download, ExternalLink, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import { AuthService } from '@/lib/auth';
import { UserActivityService } from '@/lib/userActivityService';

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const handleExportCalendar = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's upcoming events and volunteer sessions
      const { data: registrations } = await UserActivityService.getUserEventRegistrations(user.id, 50);
      const { data: sessions } = await UserActivityService.getUserVolunteerSessions(user.id, 50);

      // Create ICS calendar data
      const calendarData = generateICSData(registrations, sessions);
      
      // For web, create download link
      if (typeof window !== 'undefined') {
        const blob = new Blob([calendarData], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'volunteer-calendar.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Calendar file downloaded! Import it into your calendar app.');
      }
    } catch (error) {
      console.error('Error exporting calendar:', error);
      Alert.alert('Error', 'Failed to export calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateICSData = (registrations, sessions) => {
    const now = new Date();
    const events = [];

    // Add event registrations
    registrations.forEach(reg => {
      if (reg.attendance_status === 'registered') {
        events.push({
          title: reg.event_title,
          date: reg.registration_date,
          type: 'Event Registration'
        });
      }
    });

    // Add volunteer sessions
    sessions.forEach(session => {
      if (session.status === 'completed' || new Date(session.session_date) > now) {
        events.push({
          title: session.title,
          date: session.session_date,
          location: session.location,
          type: 'Volunteer Session'
        });
      }
    });

    // Generate ICS format
    let icsData = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Volunteer App//Calendar Export//EN\n';
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsData += 'BEGIN:VEVENT\n';
      icsData += `DTSTART:${dateStr}\n`;
      icsData += `SUMMARY:${event.title}\n`;
      icsData += `DESCRIPTION:${event.type}\n`;
      if (event.location) {
        icsData += `LOCATION:${event.location}\n`;
      }
      icsData += `UID:${Math.random().toString(36).substr(2, 9)}@volunteerapp.com\n`;
      icsData += 'END:VEVENT\n';
    });
    
    icsData += 'END:VCALENDAR';
    return icsData;
  };

  const handleWebCalendarSync = () => {
    Alert.alert(
      'Web Calendar Sync',
      'To sync with web calendars like Google Calendar:\n\n1. Export your calendar file\n2. Import it into your calendar app\n3. Set up recurring imports for updates',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export Now', onPress: handleExportCalendar }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar Integration</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Sync Options</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Calendar Sync</Text>
              <Text style={styles.settingDescription}>
                Export your volunteer activities and events to your calendar app
              </Text>
            </View>
            <Switch
              value={calendarSyncEnabled}
              onValueChange={setCalendarSyncEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={calendarSyncEnabled ? Colors.primary : Colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Event Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified before upcoming volunteer sessions and events
              </Text>
            </View>
            <Switch
              value={reminderNotifications}
              onValueChange={setReminderNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={reminderNotifications ? Colors.primary : Colors.muted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Download size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Export Calendar</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Download your volunteer activities as a calendar file that you can import into any calendar application.
          </Text>

          <Button
            title={loading ? "Generating..." : "Export Calendar (.ics)"}
            onPress={handleExportCalendar}
            disabled={loading || !user}
            style={styles.exportButton}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={24} color={Colors.highlight} />
            <Text style={styles.sectionTitle}>Platform Integration</Text>
          </View>

          <TouchableOpacity style={styles.integrationItem} onPress={handleWebCalendarSync}>
            <View style={styles.integrationContent}>
              <Text style={styles.integrationTitle}>Google Calendar</Text>
              <Text style={styles.integrationDescription}>Sync with Google Calendar</Text>
            </View>
            <ExternalLink size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.integrationItem} onPress={handleWebCalendarSync}>
            <View style={styles.integrationContent}>
              <Text style={styles.integrationTitle}>Outlook Calendar</Text>
              <Text style={styles.integrationDescription}>Sync with Microsoft Outlook</Text>
            </View>
            <ExternalLink size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.integrationItem} onPress={handleWebCalendarSync}>
            <View style={styles.integrationContent}>
              <Text style={styles.integrationTitle}>Apple Calendar</Text>
              <Text style={styles.integrationDescription}>Sync with Apple Calendar</Text>
            </View>
            <ExternalLink size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How Calendar Sync Works</Text>
          <Text style={styles.infoText}>
            • Export your volunteer schedule as a standard calendar file{'\n'}
            • Import the file into your preferred calendar app{'\n'}
            • Get reminders for upcoming volunteer sessions{'\n'}
            • Re-export periodically to get updates
          </Text>
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
    marginBottom: 16,
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
  exportButton: {
    marginTop: 8,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  integrationContent: {
    flex: 1,
  },
  integrationTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  integrationDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginBottom: 32,
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});