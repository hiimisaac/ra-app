import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Alert } from 'react-native';
import { MapPin, Calendar, Clock, Users, Heart, UserMinus, X, Download, CircleCheck as CheckCircle, Info } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Colors from '@/constants/Colors';
import { Event } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { UserActivityService } from '@/lib/userActivityService';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkRSVPStatus();
  }, []);

  const checkRSVPStatus = async () => {
    try {
      setCheckingStatus(true);
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      // Check if user is already registered for this event
      const { data: registrations } = await UserActivityService.getUserEventRegistrations(user.id, 100);
      
      const existingRegistration = registrations.find(registration => 
        registration.event_id === event.id && 
        (registration.attendance_status === 'registered' || registration.attendance_status === 'attended')
      );

      if (existingRegistration) {
        setIsRSVPed(true);
        setRegistrationId(existingRegistration.id);
        console.log('User is already registered for event:', event.id, 'Registration ID:', existingRegistration.id);
      }
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateForCalendar = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const handleRSVP = async () => {
    if (isRSVPed) {
      // Show cancel confirmation modal
      setShowCancelModal(true);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is authenticated
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to RSVP for events.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => console.log('Navigate to sign in') }
          ]
        );
        return;
      }

      // Create an event registration
      const eventRegistration = {
        user_id: user.id,
        event_id: event.id,
        event_title: event.title,
        attendance_status: 'registered' as const
      };

      console.log('Registering for event:', eventRegistration);

      // Add the event registration
      const { data, error } = await UserActivityService.registerForEvent(eventRegistration);

      if (error) {
        throw new Error(error);
      }

      console.log('Successfully registered for event:', data);
      
      setIsRSVPed(true);
      setRegistrationId(data.id);
      
      Alert.alert(
        '🎉 RSVP Confirmed!',
        `You've successfully registered for "${event.title}". We'll send you a reminder before the event.`,
        [{ text: 'Great!', style: 'default' }]
      );

    } catch (error: any) {
      console.error('Error RSVPing for event:', error);
      Alert.alert(
        'RSVP Failed',
        'There was an error registering for this event. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!registrationId) {
      Alert.alert('Error', 'Registration not found. Please try refreshing the page.');
      setShowCancelModal(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Cancelling event registration:', registrationId);

      // Update the event registration status to cancelled
      const { data, error } = await UserActivityService.updateEventAttendance(
        registrationId, 
        'cancelled'
      );

      if (error) {
        throw new Error(error);
      }

      console.log('Successfully cancelled event registration:', data);
      
      setIsRSVPed(false);
      setRegistrationId(null);
      setShowCancelModal(false);
      
      Alert.alert(
        '✅ RSVP Cancelled',
        `Your registration for "${event.title}" has been cancelled.`,
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error: any) {
      console.error('Error cancelling event registration:', error);
      Alert.alert(
        'Cancellation Failed',
        'There was an error cancelling your registration. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
      setShowCancelModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    try {
      // Create calendar event data
      const startDate = formatDateForCalendar(event.event_date);
      const endDate = new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      const endDateFormatted = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      // Generate ICS calendar file content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Volunteer App//Event Calendar//EN',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDateFormatted}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${event.location}`,
        `UID:${event.id}@volunteerapp.com`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      // For web, create download link
      if (typeof window !== 'undefined') {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Alert.alert(
          '📅 Calendar Event Created',
          'Calendar file downloaded! Import it into your calendar app to add this event.',
          [{ text: 'Got it!', style: 'default' }]
        );
      } else {
        // For mobile, show instructions
        Alert.alert(
          '📅 Add to Calendar',
          `Event: ${event.title}\nDate: ${formatDate(event.event_date)}\nTime: ${formatTime(event.event_date)}\nLocation: ${event.location}\n\nManually add this event to your calendar app.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert(
        'Calendar Error',
        'Unable to create calendar event. Please add this event manually to your calendar.',
        [{ text: 'OK', style: 'default' }]
      );
    }
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
              <X size={32} color={Colors.warning} />
            </View>
            <Text style={styles.confirmationTitle}>Cancel RSVP</Text>
          </View>
          
          <Text style={styles.confirmationMessage}>
            Are you sure you want to cancel your RSVP for "{event.title}"?
          </Text>
          
          <Text style={styles.confirmationSubtext}>
            You can always RSVP again later if you change your mind.
          </Text>
          
          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={styles.keepButton}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.keepButtonText}>Keep RSVP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cancelConfirmButton, loading && styles.loadingButton]}
              onPress={handleConfirmCancel}
              disabled={loading}
            >
              <Text style={styles.cancelConfirmButtonText}>
                {loading ? 'Cancelling...' : 'Cancel RSVP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Event Details</Text>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setShowDetails(false)}
          >
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.modalSection}>
            <Text style={styles.modalEventTitle}>{event.title}</Text>
            
            <View style={styles.modalCategoryContainer}>
              <Text style={styles.modalCategory}>{event.category}</Text>
            </View>
          </View>

          <View style={styles.modalDetailsGrid}>
            <View style={styles.modalDetailItem}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>{formatDate(event.event_date)}</Text>
            </View>
            
            <View style={styles.modalDetailItem}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>{formatTime(event.event_date)}</Text>
            </View>
            
            <View style={styles.modalDetailItem}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.modalDetailText}>{event.location}</Text>
            </View>

            {event.current_attendees > 0 && (
              <View style={styles.modalDetailItem}>
                <Users size={20} color={Colors.primary} />
                <Text style={styles.modalDetailText}>
                  {event.current_attendees}
                  {event.max_attendees > 0 && ` / ${event.max_attendees}`} attending
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>📝 About This Event</Text>
            <Text style={styles.modalDescription}>{event.description}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>🎯 What to Expect</Text>
            <Text style={styles.modalBulletPoint}>• Engaging activities and meaningful connections</Text>
            <Text style={styles.modalBulletPoint}>• Opportunity to make a positive impact</Text>
            <Text style={styles.modalBulletPoint}>• Meet like-minded community members</Text>
            <Text style={styles.modalBulletPoint}>• Learn new skills and gain experience</Text>
          </View>

          <View style={styles.modalBottomPadding} />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.modalCalendarButton}
            onPress={() => {
              setShowDetails(false);
              setTimeout(() => handleAddToCalendar(), 100);
            }}
          >
            <Download size={16} color={Colors.primary} style={styles.buttonIcon} />
            <Text style={styles.modalCalendarButtonText}>Add to Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.modalRSVPButton,
              isRSVPed && styles.modalCancelButton,
              loading && styles.modalLoadingButton
            ]}
            onPress={() => {
              setShowDetails(false);
              setTimeout(() => handleRSVP(), 100);
            }}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.modalRSVPButtonText}>
                {isRSVPed ? 'Cancelling...' : 'RSVPing...'}
              </Text>
            ) : isRSVPed ? (
              <>
                <UserMinus size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.modalRSVPButtonText}>Cancel RSVP</Text>
              </>
            ) : (
              <>
                <Heart size={16} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.modalRSVPButtonText}>RSVP Now</Text>
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
        style={[styles.container, isRSVPed && styles.rsvpedContainer]} 
        onPress={() => setShowDetails(true)}
        activeOpacity={0.7}
      >
        {event.image_url && (
          <Image source={{ uri: event.image_url }} style={styles.image} />
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.categoryContainer, isRSVPed && styles.rsvpedCategory]}>
              <Text style={styles.category}>{event.category}</Text>
            </View>
            {isRSVPed && (
              <View style={styles.rsvpedBadge}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.rsvpedText}>RSVP'd</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatDate(event.event_date)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatTime(event.event_date)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
            
            {event.current_attendees > 0 && (
              <View style={styles.detailItem}>
                <Users size={16} color={Colors.primary} style={styles.detailIcon} />
                <Text style={styles.detailText}>
                  {event.current_attendees}
                  {event.max_attendees > 0 && ` / ${event.max_attendees}`} attending
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.rsvpButton,
                isRSVPed && styles.cancelButton,
                loading && styles.loadingButton,
                checkingStatus && styles.loadingButton
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleRSVP();
              }}
              disabled={loading || checkingStatus}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.rsvpButtonText}>
                  {isRSVPed ? 'Cancelling...' : 'RSVPing...'}
                </Text>
              ) : checkingStatus ? (
                <Text style={styles.rsvpButtonText}>Checking...</Text>
              ) : isRSVPed ? (
                <>
                  <UserMinus size={16} color={Colors.white} style={styles.buttonIcon} />
                  <Text style={styles.rsvpButtonText}>Cancel RSVP</Text>
                </>
              ) : (
                <>
                  <Heart size={16} color={Colors.white} style={styles.buttonIcon} />
                  <Text style={styles.rsvpButtonText}>RSVP</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCalendar();
              }}
              activeOpacity={0.8}
            >
              <Download size={16} color={Colors.primary} style={styles.buttonIcon} />
              <Text style={styles.calendarButtonText}>Add to Calendar</Text>
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
  rsvpedContainer: {
    borderColor: Colors.success,
    borderWidth: 2,
    backgroundColor: Colors.success + '05',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
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
  rsvpedCategory: {
    backgroundColor: Colors.success,
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.white,
  },
  rsvpedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  rsvpedText: {
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
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  rsvpButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  calendarButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  calendarButtonText: {
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
  modalEventTitle: {
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
    height: 40,
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
  },
  modalCalendarButton: {
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
  },
  modalCalendarButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  modalRSVPButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
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
  modalRSVPButtonText: {
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