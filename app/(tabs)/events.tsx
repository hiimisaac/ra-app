import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import FilterChip from '@/components/ui/FilterChip';
import { events, eventCategories } from '@/data/mockData';

export default function EventsScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredEvents = events.filter(event => {
    // Filter by upcoming
    if (upcomingOnly && new Date(event.date) < new Date()) {
      return false;
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
      return false;
    }
    
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Events" />
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersScrollView}
        >
          <FilterChip 
            label="Upcoming" 
            icon={<CalendarIcon size={16} color={upcomingOnly ? Colors.white : Colors.primary} />}
            isSelected={upcomingOnly}
            onPress={() => setUpcomingOnly(!upcomingOnly)}
          />
          {eventCategories.map(category => (
            <FilterChip 
              key={category} 
              label={category} 
              isSelected={selectedCategories.includes(category)}
              onPress={() => toggleCategory(category)}
            />
          ))}
        </ScrollView>
      </View>
      
      {filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events match your filters</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setSelectedCategories([]);
              setUpcomingOnly(true);
            }}
          >
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filtersScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.white,
  },
});