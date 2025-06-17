import { Platform } from 'react-native';

export interface ShareContent {
  title: string;
  text: string;
  url: string;
}

export const shareContent = async (content: ShareContent): Promise<boolean> => {
  try {
    // Check if we're on web and Web Share API is available
    if (Platform.OS === 'web' && 'navigator' in globalThis && 'share' in navigator) {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
      return true;
    }
    
    // Fallback: Copy to clipboard
    if (Platform.OS === 'web' && 'navigator' in globalThis && 'clipboard' in navigator) {
      const shareText = `${content.title}\n\n${content.text}\n\n${content.url}`;
      await navigator.clipboard.writeText(shareText);
      return true;
    }
    
    // If no sharing method is available, return false
    return false;
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
  }
};

export const getShareUrl = (type: 'news' | 'story', id: string): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${type}/${id}`;
  }
  return `https://yourapp.com/${type}/${id}`;
};