import { useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import NewsItem from '@/components/NewsItem';
import ImpactStory from '@/components/ImpactStory';
import { newsItems, impactStories } from '@/data/mockData';

export default function HomeScreen() {
  const [featuredStoryIndex, setFeaturedStoryIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const renderFeaturedStories = () => {
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
          {impactStories.filter(story => story.featured).map((story, index) => (
            <View key={story.id} style={styles.featuredStoryContainer}>
              <Image source={{ uri: story.imageUrl }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredLabel}>Featured Story</Text>
                <Text style={styles.featuredTitle}>{story.title}</Text>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
        
        <View style={styles.dotsContainer}>
          {impactStories.filter(story => story.featured).map((_, index) => {
            const inputRange = [
              (index - 1) * styles.featuredStoryContainer.width,
              index * styles.featuredStoryContainer.width,
              (index + 1) * styles.featuredStoryContainer.width,
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Impact Stories" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderFeaturedStories()}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
        </View>
        
        <View style={styles.newsContainer}>
          {newsItems.map(item => (
            <NewsItem key={item.id} item={item} />
          ))}
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Impact Stories</Text>
        </View>
        
        <View style={styles.storiesContainer}>
          {impactStories
            .filter(story => !story.featured)
            .map(story => (
              <ImpactStory key={story.id} story={story} />
            ))}
        </View>
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
    width: 400, // This will be adjusted to screen width in practice
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
});