import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Shrink a picked image before uploading it. Full-resolution phone photos run
 * several MB, which the production nginx rejects with 413 Request Entity Too
 * Large; 1440px wide JPEG at 0.75 is plenty for a feed or story.
 * Returns the original URI if compression fails.
 */
export const compressImageForUpload = async (uri, { maxWidth = 1440, quality = 0.75 } = {}) => {
  try {
    // Only scale down; small images keep their size and are just re-encoded
    const { width } = await manipulateAsync(uri, []);
    const actions = width > maxWidth ? [{ resize: { width: maxWidth } }] : [];
    const result = await manipulateAsync(uri, actions, {
      compress: quality,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch (error) {
    console.warn('Image compression failed, uploading original:', error?.message);
    return uri;
  }
};
