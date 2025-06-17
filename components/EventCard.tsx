import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Event } from '@/lib/supabase';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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

  return (
    <TouchableOpacity style={styles.container}>
      {event.image_url && (
        <Image source={{ uri: event.image_url }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{event.category}</Text>
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
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>RSVP</Text>
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
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
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
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rsvpButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
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