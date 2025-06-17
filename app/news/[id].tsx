import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share, Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { ContentService } from '@/services/contentService';
import { NewsItem } from '@/lib/supabase';
import { shareContent, getShareUrl } from '@/utils/shareUtils';
import Toast from '@/components/ui/Toast';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadNewsItem();
  }, [id]);

  const loadNewsItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const newsData = await ContentService.getNewsItem(id);
      
      if (!newsData) {
        setError('News article not found');
        return;
      }
      
      setNewsItem(newsData);
    } catch (err) {
      console.error('Error loading news item:', err);
      setError('Failed to load news article');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!newsItem) return;
    
    const shareUrl = getShareUrl('news', newsItem.id);
    const success = await shareContent({
      title: newsItem.title,
      text: newsItem.excerpt,
      url: shareUrl,
    });

    if (success) {
      setToastMessage('Article shared successfully!');
    } else {
      setToastMessage('Link copied to clipboard!');
    }
    setShowToast(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !newsItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Article not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNewsItem}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {newsItem.image_url && (
            <Image source={{ uri: newsItem.image_url }} style={styles.heroImage} />
          )}
          
          <View style={styles.content}>
            <View style={styles.dateContainer}>
              <Calendar size={16} color={Colors.textSecondary} style={styles.dateIcon} />
              <Text style={styles.date}>{formatDate(newsItem.published_at)}</Text>
            </View>
            
            <Text style={styles.title}>{newsItem.title}</Text>
            
            <Text style={styles.excerpt}>{newsItem.excerpt}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.body}>{newsItem.content}</Text>
            
            <View style={styles.footer}>
              <TouchableOpacity style={styles.shareFooterButton} onPress={handleShare}>
                <Share size={20} color={Colors.primary} style={styles.shareIcon} />
                <Text style={styles.shareFooterText}>Share this article</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
        type="success"
      />
    </>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateIcon: {
    marginRight: 6,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 36,
  },
  excerpt: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 32,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 20,
  },
  shareFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareIcon: {
    marginRight: 8,
  },
  shareFooterText: {
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