import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Share, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { NewsItem as NewsItemType } from '@/lib/supabase';
import { shareContent, getShareUrl } from '@/utils/shareUtils';
import Toast from '@/components/ui/Toast';

interface NewsItemProps {
  item: NewsItemType;
}

export default function NewsItem({ item }: NewsItemProps) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    router.push(`/news/${item.id}`);
  };

  const handleShare = async (e: any) => {
    e.stopPropagation(); // Prevent navigation when share button is pressed
    
    const shareUrl = getShareUrl('news', item.id);
    const result = await shareContent({
      title: item.title,
      text: item.excerpt,
      url: shareUrl,
    });

    switch (result) {
      case 'shared':
        setToastMessage('Article shared successfully!');
        break;
      case 'copied':
        setToastMessage('Link copied to clipboard!');
        break;
      case 'failed':
        setToastMessage('Unable to share article');
        break;
    }
    setShowToast(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.image} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Clock size={14} color={Colors.textSecondary} style={styles.dateIcon} />
                <Text style={styles.date}>{formatDate(item.published_at)}</Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  excerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  shareButton: {
    padding: 4,
  },
});