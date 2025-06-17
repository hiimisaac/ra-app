import { View, Text, StyleSheet } from 'react-native';
import { Clock, Calendar, Award, MapPin, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { UserActivity } from '@/lib/userActivityService';

interface UserActivityItemProps {
  activity: UserActivity;
}

export default function UserActivityItem({ activity }: UserActivityItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'volunteer':
        return <Clock size={20} color={Colors.white} />;
      case 'event':
        return <Calendar size={20} color={Colors.white} />;
      case 'donation':
        return <DollarSign size={20} color={Colors.white} />;
      default:
        return <Clock size={20} color={Colors.white} />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'volunteer':
        return Colors.primary;
      case 'event':
        return Colors.secondary;
      case 'donation':
        return Colors.highlight;
      default:
        return Colors.primary;
    }
  };

  const getActivityTitle = () => {
    switch (activity.type) {
      case 'volunteer':
        return `Volunteered: ${activity.title}`;
      case 'event':
        return `Attended: ${activity.title}`;
      case 'donation':
        return activity.amount ? `Donated $${activity.amount}` : `Donation: ${activity.title}`;
      default:
        return activity.title;
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      completed: Colors.success,
      attended: Colors.success,
      registered: Colors.info,
      pending: Colors.warning,
      cancelled: Colors.error,
      no_show: Colors.error,
    };

    const statusColor = statusColors[activity.status as keyof typeof statusColors] || Colors.muted;

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{activity.status.replace('_', ' ')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getActivityColor() }]}>
        {getActivityIcon()}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{getActivityTitle()}</Text>
          {getStatusBadge()}
        </View>
        <Text style={styles.date}>{formatDate(activity.date)}</Text>
        
        {activity.location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.textSecondary} style={styles.locationIcon} />
            <Text style={styles.location}>{activity.location}</Text>
          </View>
        )}
        
        {activity.hours && (
          <View style={styles.hoursContainer}>
            <Text style={styles.hours}>{activity.hours} hours</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  hoursContainer: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  hours: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.white,
  },
});