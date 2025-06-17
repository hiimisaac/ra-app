import { Platform } from 'react-native';

export interface ShareContent {
  title: string;
  text: string;
  url: string;
}

export type ShareResult = 'shared' | 'copied' | 'failed';

export const shareContent = async (content: ShareContent): Promise<ShareResult> => {
  try {
    // Check if we're on web and Web Share API is available
    if (Platform.OS === 'web' && 'navigator' in globalThis && 'share' in navigator) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url,
        });
        return 'shared';
      } catch (shareError: any) {
        // If sharing fails (permission denied, user cancelled, etc.), fall back to clipboard
        console.log('Web Share API failed, falling back to clipboard:', shareError.message);
      }
    }
    
    // Fallback: Copy to clipboard
    if (Platform.OS === 'web' && 'navigator' in globalThis && 'clipboard' in navigator) {
      const shareText = `${content.title}\n\n${content.text}\n\n${content.url}`;
      await navigator.clipboard.writeText(shareText);
      return 'copied';
    }
    
    // If no sharing method is available, return failed
    return 'failed';
  } catch (error) {
    console.error('Error sharing content:', error);
    return 'failed';
  }
};

export const getShareUrl = (type: 'news' | 'story', id: string): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${type}/${id}`;
  }
  return `https://yourapp.com/${type}/${id}`;
};