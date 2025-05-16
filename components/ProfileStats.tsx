import { View, Text, StyleSheet } from 'react-native';
import { Clock, Calendar, Gift } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ProfileStatsProps {
  volunteerHours: number;
  eventsAttended: number;
  donations: number;
}

export default function ProfileStats({ volunteerHours, eventsAttended, donations }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <View style={styles.iconContainer}>
          <Clock size={24} color={Colors.white} />
        </View>
        <Text style={styles.value}>{volunteerHours}</Text>
        <Text style={styles.label}>Volunteer Hours</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.stat}>
        <View style={[styles.iconContainer, styles.eventsIcon]}>
          <Calendar size={24} color={Colors.white} />
        </View>
        <Text style={styles.value}>{eventsAttended}</Text>
        <Text style={styles.label}>Events Attended</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.stat}>
        <View style={[styles.iconContainer, styles.donationsIcon]}>
          <Gift size={24} color={Colors.white} />
        </View>
        <Text style={styles.value}>{donations}</Text>
        <Text style={styles.label}>Donations Made</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eventsIcon: {
    backgroundColor: Colors.secondary,
  },
  donationsIcon: {
    backgroundColor: Colors.highlight,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
});