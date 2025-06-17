import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Filter, Calendar, Clock, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import UserActivityItem from '@/components/UserActivityItem';
import FilterChip from '@/components/ui/FilterChip';
import { AuthService } from '@/lib/auth';
import { UserActivityService, UserActivity } from '@/lib/userActivityService';

const ACTIVITY_TYPES = [
  { key: 'all', label: 'All Activities', icon: null },
  { key: 'volunteer', label: 'Volunteer', icon: Clock },
  { key: 'event', label: 'Events', icon: Calendar },
  { key: 'donation', label: 'Donations', icon: DollarSign },
];

const ITEMS_PER_PAGE = 20;

export default function AllActivitiesScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, selectedFilter]);

  const checkAuthState = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      loadActivities(true);
    } else {
      setLoading(false);
      setError('Please sign in to view your activities');
    }
  };

  const loadActivities = async (isInitial = false) => {
    if (!user) return;

    if (isInitial) {
      setLoading(true);
      setPage(1);
      setHasMoreData(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const currentPage = isInitial ? 1 : page;
      const limit = ITEMS_PER_PAGE;
      
      // Load all types of activities
      const { data, error: activityError } = await UserActivityService.getUserActivities(
        user.id, 
        currentPage * limit
      );

      if (activityError) {
        throw new Error(activityError);
      }

      if (isInitial) {
        setActivities(data);
        setHasMoreData(data.length >= limit);
      } else {
        // For pagination, we need to check if we got new data
        const newActivities = data.slice(activities.length);
        if (newActivities.length > 0) {
          setActivities(prev => [...prev, ...newActivities]);
          setHasMoreData(newActivities.length >= limit);
        } else {
          setHasMoreData(false);
        }
      }

      if (!isInitial) {
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const filterActivities = () => {
    if (selectedFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === selectedFilter));
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setActivities([]);
    setPage(1);
    loadActivities(true);
  }, [user]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreData && selectedFilter === 'all') {
      loadActivities(false);
    }
  };

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
  };

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      volunteer: activities.filter(a => a.type === 'volunteer').length,
      event: activities.filter(a => a.type === 'event').length,
      donation: activities.filter(a => a.type === 'donation').length,
    };
    return stats;
  };

  const renderActivityItem = ({ item }: { item: UserActivity }) => (
    <UserActivityItem activity={item} />
  );

  const renderHeader = () => {
    const stats = getActivityStats();
    
    return (
      <View style={styles.headerContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.volunteer}</Text>
            <Text style={styles.statLabel}>Volunteer Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.event}</Text>
            <Text style={styles.statLabel}>Events Attended</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.donation}</Text>
            <Text style={styles.statLabel}>Donations Made</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Filter size={20} color={Colors.primary} />
            <Text style={styles.filterTitle}>Filter Activities</Text>
          </View>
          <View style={styles.filterChips}>
            {ACTIVITY_TYPES.map(type => (
              <FilterChip
                key={type.key}
                label={type.label}
                isSelected={selectedFilter === type.key}
                onPress={() => handleFilterChange(type.key)}
                icon={type.icon ? <type.icon size={16} color={selectedFilter === type.key ? Colors.white : Colors.primary} /> : undefined}
                style={styles.filterChip}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerLoaderText}>Loading more activities...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Calendar size={64} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Activities Found</Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === 'all' 
          ? "You haven't logged any activities yet. Start volunteering to see your impact here!"
          : `No ${selectedFilter} activities found. Try selecting a different filter.`
        }
      </Text>
      {selectedFilter !== 'all' && (
        <TouchableOpacity 
          style={styles.clearFilterButton}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={styles.clearFilterText}>Show All Activities</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>All Activities</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>All Activities</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadActivities(true)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>All Activities</Text>
      </View>

      <FlatList
        data={filteredActivities}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  listContainer: {
    flexGrow: 1,
  },
  headerContent: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginBottom: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    backgroundColor: Colors.primaryLight + '20',
    padding: 24,
    borderRadius: 50,
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearFilterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.white,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
});