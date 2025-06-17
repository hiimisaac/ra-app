import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Calendar, Gift, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ProfileStatsProps {
  volunteerHours: number;
  eventsAttended: number;
  donations: number;
  onRefresh?: () => void;
}

export default function ProfileStats({ volunteerHours, eventsAttended, donations, onRefresh }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
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
      
      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={16} color={Colors.primary} style={styles.refreshIcon} />
          <Text style={styles.refreshText}>Refresh Stats</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  refreshIcon: {
    marginRight: 6,
  },
  refreshText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
});