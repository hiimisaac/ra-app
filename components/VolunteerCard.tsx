import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Calendar, Clock, Users, Heart, CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { VolunteerOpportunity } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { UserActivityService } from '@/lib/userActivityService';

interface VolunteerCardProps {
  opportunity: VolunteerOpportunity;
}

export default function VolunteerCard({ opportunity }: VolunteerCardProps) {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBD';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Time TBD';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSignUp = async () => {
    if (isSignedUp) {
      Alert.alert(
        'Already Signed Up',
        'You\'re already registered for this volunteer opportunity. Check your email for details or contact the organizer if you need to make changes.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is authenticated
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to sign up for volunteer opportunities. You\'ll be able to track your volunteer hours and receive updates about your activities.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => {
              // In a real app, you'd navigate to the sign-in screen
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
        description: opportunity.description || `Volunteer opportunity: ${opportunity.title}`,
        hours_worked: 0, // Will be updated when session is completed
        session_date: opportunity.date || new Date().toISOString(),
        location: opportunity.location || 'Location TBD',
        status: 'registered' as const
      };

      console.log('Registering for volunteer opportunity:', volunteerSession);

      // Add the volunteer session to track the sign-up
      const { data, error } = await UserActivityService.addVolunteerSession(volunteerSession);

      if (error) {
        throw new Error(error);
      }

      console.log('Successfully registered for opportunity:', data);
      
      setIsSignedUp(true);
      
      Alert.alert(
        '🎉 Sign Up Successful!',
        `You've successfully signed up for "${opportunity.title}"!\n\n` +
        `📅 ${opportunity.date ? formatDate(opportunity.date) : 'Date TBD'}\n` +
        `📍 ${opportunity.location || 'Location TBD'}\n\n` +
        `You'll receive a confirmation email with details about the volunteer opportunity. ` +
        `This activity will be tracked in your volunteer profile.`,
        [
          { 
            text: 'Great!', 
            onPress: () => {
              console.log('User confirmed sign-up for opportunity:', opportunity.id);
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Error signing up for opportunity:', error);
      Alert.alert(
        'Sign Up Failed',
        `There was an error signing up for this opportunity: ${error.message}\n\nPlease try again or contact support if the problem persists.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = () => {
    const details = [
      `📋 ${opportunity.title}`,
      '',
      opportunity.interest_area ? `🏷️ Category: ${opportunity.interest_area}` : '',
      opportunity.location ? `📍 Location: ${opportunity.location}` : '📍 Location: TBD',
      opportunity.date ? `📅 Date: ${formatDate(opportunity.date)}` : '📅 Date: TBD',
      opportunity.date ? `⏰ Time: ${formatTime(opportunity.date)}` : '⏰ Time: TBD',
      '',
      '📝 Description:',
      opportunity.description || 'Join us for this meaningful volunteer opportunity to make a positive impact in our community.',
      '',
      '💡 What to expect:',
      '• Meaningful work that makes a difference',
      '• Opportunity to meet like-minded volunteers',
      '• Skills development and community impact',
      '• Recognition for your volunteer hours'
    ].filter(Boolean).join('\n');

    Alert.alert(
      'Opportunity Details',
      details,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: isSignedUp ? 'Already Signed Up' : 'Sign Up Now', 
          onPress: isSignedUp ? undefined : handleSignUp,
          style: isSignedUp ? 'default' : 'default'
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isSignedUp && styles.signedUpContainer]} 
      onPress={handleLearnMore}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {opportunity.interest_area && (
            <View style={[styles.categoryContainer, isSignedUp && styles.signedUpCategory]}>
              <Text style={styles.category}>{opportunity.interest_area}</Text>
            </View>
          )}
          {isSignedUp && (
            <View style={styles.signedUpBadge}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.signedUpText}>Signed Up</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.title}>{opportunity.title}</Text>
        
        <View style={styles.detailsContainer}>
          {opportunity.date && (
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatDate(opportunity.date)}</Text>
            </View>
          )}
          
          {opportunity.date && (
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatTime(opportunity.date)}</Text>
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
            style={[
              styles.signUpButton, 
              isSignedUp && styles.signedUpButton,
              loading && styles.loadingButton
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleSignUp();
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.signUpButtonText}>Signing Up...</Text>
            ) : isSignedUp ? (
              <>
                <CheckCircle size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.signUpButtonText}>Signed Up</Text>
              </>
            ) : (
              <>
                <Heart size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleLearnMore();
            }}
            activeOpacity={0.8}
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signedUpContainer: {
    borderColor: Colors.success,
    borderWidth: 2,
    backgroundColor: Colors.success + '05',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  signedUpCategory: {
    backgroundColor: Colors.success,
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.white,
  },
  signedUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  signedUpText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 24,
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
    flex: 1,
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
    gap: 12,
  },
  signUpButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 44,
  },
  signedUpButton: {
    backgroundColor: Colors.success,
  },
  loadingButton: {
    backgroundColor: Colors.muted,
  },
  buttonIcon: {
    marginRight: 6,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  learnMoreButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
});