import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Share } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import NewsItem from '@/components/NewsItem';
import ImpactStory from '@/components/ImpactStory';
import { ContentService } from '@/services/contentService';
import { NewsItem as NewsItemType, ImpactStory as ImpactStoryType } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const [newsItems, setNewsItems] = useState<NewsItemType[]>([]);
  const [impactStories, setImpactStories] = useState<ImpactStoryType[]>([]);
  const [featuredStories, setFeaturedStories] = useState<ImpactStoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [newsData, storiesData, featuredData] = await Promise.all([
        ContentService.getNewsItems(5),
        ContentService.getImpactStories(10),
        ContentService.getFeaturedStories()
      ]);
      
      setNewsItems(newsData);
      setImpactStories(storiesData.filter(story => !story.is_featured));
      setFeaturedStories(featuredData);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedStoryPress = (story: ImpactStoryType) => {
    router.push(`/(tabs)/story/${story.id}`);
  };
  
  const renderFeaturedStories = () => {
    if (featuredStories.length === 0) return null;

    return (
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {featuredStories.map((story, index) => (
            <TouchableOpacity 
              key={story.id} 
              style={[styles.featuredStoryContainer, { width: screenWidth }]}
              onPress={() => handleFeaturedStoryPress(story)}
            >
              {story.image_url && (
                <Image source={{ uri: story.image_url }} style={styles.featuredImage} />
              )}
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredLabel}>Featured Story</Text>
                <Text style={styles.featuredTitle}>{story.title}</Text>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => handleFeaturedStoryPress(story)}
                >
                  <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
        
        {featuredStories.length > 1 && (
          <View style={styles.dotsContainer}>
            {featuredStories.map((_, index) => {
              const inputRange = [
                (index - 1) * screenWidth,
                index * screenWidth,
                (index + 1) * screenWidth,
              ];
              
              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
                extrapolate: 'clamp',
              });
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: dotOpacity,
                      width: dotWidth,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Impact Stories" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Impact Stories" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Impact Stories" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderFeaturedStories()}
        
        {newsItems.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest News</Text>
            </View>
            
            <View style={styles.newsContainer}>
              {newsItems.map(item => (
                <NewsItem key={item.id} item={item} />
              ))}
            </View>
          </>
        )}
        
        {impactStories.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Impact Stories</Text>
            </View>
            
            <View style={styles.storiesContainer}>
              {impactStories.map(story => (
                <ImpactStory key={story.id} story={story} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    height: 400,
    marginBottom: 24,
  },
  featuredStoryContainer: {
    height: 360,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredLabel: {
    color: Colors.white,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  featuredTitle: {
    color: Colors.white,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  readMoreButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: Colors.white,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  newsContainer: {
    marginBottom: 24,
  },
  storiesContainer: {
    marginBottom: 40,
    paddingHorizontal: 16,
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