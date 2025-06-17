import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Share } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { ImpactStory as ImpactStoryType } from '@/lib/supabase';

interface ImpactStoryProps {
  story: ImpactStoryType;
}

export default function ImpactStory({ story }: ImpactStoryProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(tabs)/story/${story.id}`);
  };

  const handleReadMore = () => {
    router.push(`/(tabs)/story/${story.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {story.image_url && (
        <Image source={{ uri: story.image_url }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>{story.excerpt}</Text>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.readMoreButton} onPress={handleReadMore}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Share size={18} color={Colors.primary} />
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
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  excerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  readMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  shareButton: {
    padding: 6,
  },
});