import { Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Public web app where shared catalog links open (served by nginx from dist/)
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || 'https://uno-delivery.duckdns.org').replace(/\/+$/, '');

export const getCatalogUrl = (businessId) => `${WEB_URL}/c/${businessId}`;

/**
 * Share a business' public profile + catalog link through the OS share sheet
 * (WhatsApp, Instagram, etc). On web, falls back to copying the link.
 */
export const shareBusinessCatalog = async ({ id, name }) => {
  if (!id) return;
  const url = getCatalogUrl(id);
  const businessName = name || 'este negocio';
  const message = `🛍️ Mira el catálogo de ${businessName} en UNO AI y haz tu pedido aquí:\n${url}`;

  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: businessName, text: message, url });
        return;
      }
      await Clipboard.setStringAsync(url);
      Alert.alert('Enlace copiado', 'Pégalo donde quieras compartir tu catálogo.');
      return;
    }

    // iOS uses `url` as a rich link; Android only reads `message`
    await Share.share(Platform.OS === 'ios' ? { message: message.replace(`\n${url}`, ''), url } : { message, title: businessName });
  } catch (error) {
    console.warn('Share failed:', error?.message);
  }
};
