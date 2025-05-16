import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { VolunteerOpportunityType } from '@/types';

interface VolunteerCardProps {
  opportunity: VolunteerOpportunityType;
}

export default function VolunteerCard({ opportunity }: VolunteerCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.content}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{opportunity.category}</Text>
        </View>
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.organization}>{opportunity.organization}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDate(opportunity.date)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color={Colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatTime(opportunity.startTime, opportunity.endTime)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>{opportunity.location}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Users size={16} color={Colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>{opportunity.spotsAvailable} spots available</Text>
          </View>
        </View>
        
        <View style={styles.description}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {opportunity.description}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.signUpButton,
              opportunity.isSignedUp ? styles.signUpButtonActive : {}
            ]}
          >
            <Text 
              style={[
                styles.signUpButtonText,
                opportunity.isSignedUp ? styles.signUpButtonTextActive : {}
              ]}
            >
              {opportunity.isSignedUp ? 'Signed Up' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.calendarButton}>
            <Text style={styles.calendarButtonText}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.white,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  organization: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  description: {
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signUpButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  signUpButtonActive: {
    backgroundColor: Colors.primaryDark,
  },
  signUpButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  signUpButtonTextActive: {
    color: Colors.white,
  },
  calendarButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  calendarButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
});