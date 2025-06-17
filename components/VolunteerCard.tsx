import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { VolunteerOpportunity } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { UserActivityService } from '@/lib/userActivityService';

interface VolunteerCardProps {
  opportunity: VolunteerOpportunity;
}

export default function VolunteerCard({ opportunity }: VolunteerCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBD';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleSignUp = async () => {
    try {
      // Check if user is authenticated
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to sign up for volunteer opportunities.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => {
              // Navigate to profile tab where they can sign in
              // This would need router navigation in a real implementation
              console.log('Navigate to sign in');
            }}
          ]
        );
        return;
      }

      // Create a volunteer session registration
      const volunteerSession = {
        user_id: user.id,
        opportunity_id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description || '',
        hours_worked: 0, // Will be updated when session is completed
        session_date: opportunity.date || new Date().toISOString(),
        location: opportunity.location || '',
        status: 'registered' as const
      };

      // For now, we'll simulate the sign-up process
      Alert.alert(
        'Sign Up Successful!',
        `You've successfully signed up for "${opportunity.title}". You'll receive a confirmation email with details about the volunteer opportunity.`,
        [
          { text: 'OK', onPress: () => {
            console.log('User signed up for opportunity:', opportunity.id);
            // In a real app, you would:
            // 1. Save the registration to the database
            // 2. Send confirmation email
            // 3. Update the UI to show "Signed Up" status
          }}
        ]
      );

    } catch (error) {
      console.error('Error signing up for opportunity:', error);
      Alert.alert(
        'Sign Up Failed',
        'There was an error signing up for this opportunity. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLearnMore = () => {
    // Show detailed information about the opportunity
    const details = [
      `Title: ${opportunity.title}`,
      opportunity.location ? `Location: ${opportunity.location}` : '',
      opportunity.date ? `Date: ${formatDate(opportunity.date)}` : '',
      opportunity.interest_area ? `Category: ${opportunity.interest_area}` : '',
      opportunity.description ? `\nDescription:\n${opportunity.description}` : ''
    ].filter(Boolean).join('\n');

    Alert.alert(
      'Opportunity Details',
      details,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Sign Up', onPress: handleSignUp }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleLearnMore}>
      <View style={styles.content}>
        {opportunity.interest_area && (
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{opportunity.interest_area}</Text>
          </View>
        )}
        <Text style={styles.title}>{opportunity.title}</Text>
        
        <View style={styles.detailsContainer}>
          {opportunity.date && (
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatDate(opportunity.date)}</Text>
            </View>
          )}
          
          {opportunity.location && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{opportunity.location}</Text>
            </View>
          )}
        </View>
        
        {opportunity.description && (
          <View style={styles.description}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {opportunity.description}
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleSignUp();
            }}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleLearnMore();
            }}
          >
            <Text style={styles.learnMoreButtonText}>Learn More</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  signUpButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  learnMoreButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  learnMoreButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
});