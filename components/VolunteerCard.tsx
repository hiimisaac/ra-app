import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MapPin, Calendar, Clock, Users, Heart, CircleCheck as CheckCircle, Info, X, UserMinus, AlertTriangle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
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
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      setCheckingStatus(true);
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      // Check if user is already registered for this opportunity
      const { data: sessions } = await UserActivityService.getUserVolunteerSessions(user.id, 100);
      
      const existingRegistration = sessions.find(session => 
        session.opportunity_id === opportunity.id && 
        session.status === 'registered'
      );

      if (existingRegistration) {
        setIsSignedUp(true);
        setRegistrationId(existingRegistration.id);
        console.log('User is already registered for opportunity:', opportunity.id, 'Registration ID:', existingRegistration.id);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

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
      // Show cancel confirmation modal instead of alert
      setShowCancelModal(true);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is authenticated
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        // Show sign in modal instead of alert
        console.log('User not authenticated, should show sign in modal');
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
      setRegistrationId(data.id);
      
      // Show success message in console instead of alert
      console.log('🎉 Sign Up Successful!', `You've successfully signed up for "${opportunity.title}"!`);

    } catch (error: any) {
      console.error('Error signing up for opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!registrationId) {
      console.error('Registration not found. Please try refreshing the page.');
      setShowCancelModal(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Cancelling registration:', registrationId);

      // Update the volunteer session status to cancelled
      const { data, error } = await UserActivityService.updateVolunteerSessionStatus(
        registrationId, 
        'cancelled'
      );

      if (error) {
        throw new Error(error);
      }

      console.log('Successfully cancelled registration:', data);
      
      setIsSignedUp(false);
      setRegistrationId(null);
      setShowCancelModal(false);
      
      console.log('✅ Registration Cancelled', `Your registration for "${opportunity.title}" has been cancelled.`);

    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      setShowCancelModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = () => {
    console.log('Learn More button pressed for opportunity:', opportunity.id);
    setShowModal(true);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const renderCancelConfirmationModal = () => (
    <Modal
      visible={showCancelModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <View style={styles.confirmationHeader}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={32} color={Colors.warning} />
            </View>
            <Text style={styles.confirmationTitle}>Cancel Registration</Text>
          </View>
          
          <Text style={styles.confirmationMessage}>
            Are you sure you want to cancel your registration for "{opportunity.title}"?
          </Text>
          
          <Text style={styles.confirmationSubtext}>
            This action cannot be undone and you may need to re-register if you change your mind.
          </Text>
          
          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={styles.keepButton}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.keepButtonText}>Keep Registration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cancelConfirmButton, loading && styles.loadingButton]}
              onPress={handleConfirmCancel}
              disabled={loading}
            >
              <Text style={styles.cancelConfirmButtonText}>
                {loading ? 'Cancelling...' : 'Cancel Registration'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Opportunity Details</Text>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setShowModal(false)}
          >
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.modalSection}>
            <Text style={styles.modalOpportunityTitle}>{opportunity.title}</Text>
            
            {opportunity.interest_area && (
              <View style={styles.modalCategoryContainer}>
                <Text style={styles.modalCategory}>{opportunity.interest_area}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalDetailsGrid}>
            <View style={styles.modalDetailItem}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>
                {opportunity.date ? formatDate(opportunity.date) : 'Date TBD'}
              </Text>
            </View>
            
            <View style={styles.modalDetailItem}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>
                {opportunity.date ? formatTime(opportunity.date) : 'Time TBD'}
              </Text>
            </View>
            
            <View style={styles.modalDetailItem}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>
                {opportunity.location || 'Location TBD'}
              </Text>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>📝 Description</Text>
            <Text style={styles.modalDescription}>
              {opportunity.description || 'Join us for this meaningful volunteer opportunity to make a positive impact in our community.'}
            </Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>💡 What to Expect</Text>
            <Text style={styles.modalBulletPoint}>• Meaningful work that makes a difference</Text>
            <Text style={styles.modalBulletPoint}>• Opportunity to meet like-minded volunteers</Text>
            <Text style={styles.modalBulletPoint}>• Skills development and community impact</Text>
            <Text style={styles.modalBulletPoint}>• Recognition for your volunteer hours</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>🤝 How to Get Involved</Text>
            <Text style={styles.modalBulletPoint}>• Click "Sign Up" to register for this opportunity</Text>
            <Text style={styles.modalBulletPoint}>• You'll receive confirmation and details via email</Text>
            <Text style={styles.modalBulletPoint}>• Your volunteer hours will be tracked automatically</Text>
            <Text style={styles.modalBulletPoint}>• You can cancel your registration anytime before the event</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>🌟 Why Volunteer?</Text>
            <Text style={styles.modalBulletPoint}>• Make a tangible difference in your community</Text>
            <Text style={styles.modalBulletPoint}>• Build new skills and gain valuable experience</Text>
            <Text style={styles.modalBulletPoint}>• Connect with passionate, like-minded people</Text>
            <Text style={styles.modalBulletPoint}>• Feel good about contributing to positive change</Text>
          </View>

          {/* Extra padding at bottom to ensure content is not hidden behind footer */}
          <View style={styles.modalBottomPadding} />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.modalCloseTextButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.modalCloseTextButtonText}>Close</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.modalSignUpButton,
              isSignedUp && styles.modalCancelButton,
              loading && styles.modalLoadingButton
            ]}
            onPress={() => {
              setShowModal(false);
              setTimeout(() => handleSignUp(), 100); // Small delay to allow modal to close
            }}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.modalSignUpButtonText}>
                {isSignedUp ? 'Cancelling...' : 'Signing Up...'}
              </Text>
            ) : isSignedUp ? (
              <>
                <UserMinus size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.modalSignUpButtonText}>Cancel Registration</Text>
              </>
            ) : (
              <>
                <Heart size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.modalSignUpButtonText}>Sign Up Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
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
                <Text style={styles.signedUpText}>Registered</Text>
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
              <Text style={styles.descriptionText} numberOfLines={showDetails ? undefined : 3}>
                {opportunity.description}
              </Text>
              {opportunity.description.length > 150 && (
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleDetails();
                  }}
                >
                  <Text style={styles.expandText}>
                    {showDetails ? 'Show Less' : 'Show More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.signUpButton, 
                isSignedUp && styles.cancelButton,
                loading && styles.loadingButton,
                checkingStatus && styles.loadingButton
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card press
                handleSignUp();
              }}
              disabled={loading || checkingStatus}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.signUpButtonText}>
                  {isSignedUp ? 'Cancelling...' : 'Signing Up...'}
                </Text>
              ) : checkingStatus ? (
                <Text style={styles.signUpButtonText}>Checking...</Text>
              ) : isSignedUp ? (
                <>
                  <UserMinus size={16} color={Colors.white} style={styles.buttonIcon} />
                  <Text style={styles.signUpButtonText}>Cancel</Text>
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
                console.log('Learn More button clicked directly');
                handleLearnMore();
              }}
              activeOpacity={0.8}
            >
              <Info size={16} color={Colors.primary} style={styles.buttonIcon} />
              <Text style={styles.learnMoreButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {renderDetailsModal()}
      {renderCancelConfirmationModal()}
    </>
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
  expandButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
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
  cancelButton: {
    backgroundColor: Colors.warning,
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
    flexDirection: 'row',
    minHeight: 44,
  },
  learnMoreButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalOpportunityTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 32,
  },
  modalCategoryContainer: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  modalDetailsGrid: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  modalSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  modalBulletPoint: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  modalBottomPadding: {
    height: 40, // Extra space to ensure content is not hidden behind footer
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCloseTextButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseTextButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalSignUpButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalCancelButton: {
    backgroundColor: Colors.warning,
  },
  modalLoadingButton: {
    backgroundColor: Colors.muted,
  },
  modalSignUpButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  // Cancel confirmation modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    backgroundColor: Colors.warning + '20',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  confirmationSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  keepButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  cancelConfirmButton: {
    flex: 1,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});