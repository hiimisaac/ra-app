import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Clock, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import VolunteerCard from '@/components/VolunteerCard';
import FilterChip from '@/components/ui/FilterChip';
import SearchBar from '@/components/ui/SearchBar';
import { ContentService } from '@/services/contentService';
import { VolunteerOpportunity } from '@/lib/supabase';

export default function VolunteerScreen() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [volunteerCategories, setVolunteerCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const opportunitiesData = await ContentService.getVolunteerOpportunities();
      setOpportunities(opportunitiesData);
      
      // Extract unique categories and locations from opportunities
      const categories = [...new Set(opportunitiesData
        .map(opp => opp.interest_area)
        .filter(Boolean))] as string[];
      const uniqueLocations = [...new Set(opportunitiesData
        .map(opp => opp.location)
        .filter(Boolean))] as string[];
      
      setVolunteerCategories(categories);
      setLocations(uniqueLocations);
    } catch (err) {
      console.error('Error loading volunteer opportunities:', err);
      setError('Failed to load volunteer opportunities');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    // Filter by search query
    if (searchQuery && !opportunity.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0 && 
        (!opportunity.interest_area || !selectedCategories.includes(opportunity.interest_area))) {
      return false;
    }
    
    // Filter by selected locations
    if (selectedLocations.length > 0 && 
        (!opportunity.location || !selectedLocations.includes(opportunity.location))) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Volunteer" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading opportunities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Volunteer" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOpportunities}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Volunteer" />
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search opportunities..."
        />
      </View>
      
      {volunteerCategories.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersScrollView}
          >
            {volunteerCategories.map(category => (
              <FilterChip 
                key={category} 
                label={category} 
                isSelected={selectedCategories.includes(category)}
                onPress={() => toggleCategory(category)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {locations.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Locations</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersScrollView}
          >
            {locations.map(location => (
              <FilterChip 
                key={location} 
                label={location} 
                icon={<MapPin size={16} color={selectedLocations.includes(location) ? Colors.white : Colors.primary} />}
                isSelected={selectedLocations.includes(location)}
                onPress={() => toggleLocation(location)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {filteredOpportunities.length > 0 ? (
        <FlatList
          data={filteredOpportunities}
          renderItem={({ item }) => <VolunteerCard opportunity={item} />}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.opportunitiesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {opportunities.length === 0 ? 'No volunteer opportunities available' : 'No volunteer opportunities match your criteria'}
          </Text>
          {opportunities.length > 0 && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategories([]);
                setSelectedLocations([]);
              }}
            >
              <Text style={styles.resetText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 16,
    marginBottom: 8,
  },
  filtersScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  opportunitiesList: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.white,
  },
});