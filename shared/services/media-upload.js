import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Media Upload Service
 * Handles file uploads to Firebase Storage with compression and progress tracking
 */

// Initialize Firebase Storage
const storage = getStorage();

/**
 * Upload types configuration
 */
export const UPLOAD_TYPES = {
  PRODUCT_IMAGE: {
    path: 'products/images',
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  POST_IMAGE: {
    path: 'posts/images',
    maxWidth: 1080,
    maxHeight: 1350,
    quality: 0.85,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  POST_VIDEO: {
    path: 'posts/videos',
    maxSizeMB: 100,
    allowedTypes: ['video/mp4', 'video/quicktime']
  },
  STORY_IMAGE: {
    path: 'stories/images',
    maxWidth: 1080,
    maxHeight: 1920,
    quality: 0.8,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  STORY_VIDEO: {
    path: 'stories/videos',
    maxSizeMB: 50,
    maxDurationSeconds: 60,
    allowedTypes: ['video/mp4', 'video/quicktime']
  },
  PROFILE_IMAGE: {
    path: 'profiles/images',
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.85,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  BUSINESS_LOGO: {
    path: 'businesses/logos',
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.85,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  BUSINESS_BANNER: {
    path: 'businesses/banners',
    maxWidth: 1500,
    maxHeight: 500,
    quality: 0.85,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (originalName, userId) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${userId}_${timestamp}_${randomStr}.${extension}`;
};

/**
 * Compress image before upload
 */
const compressImage = async (uri, config) => {
  try {
    const { maxWidth, maxHeight, quality } = config;

    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    return uri; // Return original if compression fails
  }
};

/**
 * Validate file type
 */
const validateFileType = (mimeType, allowedTypes) => {
  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
};

/**
 * Validate file size
 * Note: For simplicity, we skip size validation for now
 * Firebase Storage has its own size limits that will catch oversized files
 */
const validateFileSize = async (uri, maxSizeMB) => {
  // Size validation skipped - rely on Firebase Storage limits
  return;
};

/**
 * Upload file to Firebase Storage
 *
 * @param {string} uri - Local file URI
 * @param {string} uploadType - Type from UPLOAD_TYPES
 * @param {object} options - Additional options
 * @param {function} onProgress - Progress callback (percent: number)
 * @param {object} userOverride - Optional user object {uid: string}
 * @returns {Promise<object>} { url, path, filename }
 */
export const uploadMedia = async (uri, uploadType, options = {}, onProgress = null, userOverride = null) => {
  try {
    let userId = userOverride?.uid;
    if (!userId) {
      userId = await AsyncStorage.getItem('userId');
    }
    
    if (!userId) {
      throw new Error('User must be authenticated to upload files');
    }

    const config = UPLOAD_TYPES[uploadType];
    if (!config) {
      throw new Error(`Invalid upload type: ${uploadType}`);
    }

    // Read file as blob to get real mimeType (especially important for Web blob URLs)
    let uploadUri = uri;
    let response = await fetch(uploadUri);
    let blob = await response.blob();
    
    let mimeType = options.mimeType || blob.type;
    
    if (!mimeType || mimeType === 'application/octet-stream') {
      const extension = uri.split('.').pop().toLowerCase();
      const mimeTypeMap = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        mp4: 'video/mp4',
        mov: 'video/quicktime'
      };
      mimeType = mimeTypeMap[extension] || 'application/octet-stream';
    }

    // Validate file type
    validateFileType(mimeType, config.allowedTypes);

    // Compress image if needed
    if (mimeType.startsWith('image/') && config.maxWidth) {
      const compressedUri = await compressImage(uri, config);
      if (compressedUri !== uri) {
        uploadUri = compressedUri;
        response = await fetch(uploadUri);
        blob = await response.blob();
      }
    }

    // Generate filename
    const extensionForName = mimeType.split('/')[1] || 'bin';
    const filename = generateFilename(options.filename || `file.${extensionForName}`, userId);
    const storagePath = `${config.path}/${userId}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: mimeType,
      customMetadata: {
        uploadedBy: userId,
        uploadType,
        originalFilename: options.filename || 'unknown',
        ...options.metadata
      }
    });

    // Track upload progress
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          resolve({
            url: downloadURL,
            path: storagePath,
            filename,
            size: blob.size,
            mimeType
          });
        }
      );
    });
  } catch (error) {
    console.error('Media upload failed:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 *
 * @param {Array<string>} uris - Array of local file URIs
 * @param {string} uploadType - Type from UPLOAD_TYPES
 * @param {object} options - Additional options
 * @param {function} onProgress - Progress callback (percent: number, index: number)
 * @returns {Promise<Array<object>>} Array of upload results
 */
export const uploadMultipleMedia = async (uris, uploadType, options = {}, onProgress = null) => {
  const results = [];

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];

    const result = await uploadMedia(
      uri,
      uploadType,
      options,
      (percent) => {
        if (onProgress) {
          onProgress(percent, i, uris.length);
        }
      }
    );

    results.push(result);
  }

  return results;
};

/**
 * Delete file from Firebase Storage
 *
 * @param {string} path - Storage path of file
 * @returns {Promise<void>}
 */
export const deleteMedia = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('File deleted successfully:', path);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Firebase Storage
 *
 * @param {Array<string>} paths - Array of storage paths
 * @returns {Promise<void>}
 */
export const deleteMultipleMedia = async (paths) => {
  const deletePromises = paths.map(path => deleteMedia(path));
  await Promise.all(deletePromises);
};

/**
 * Generate thumbnail from video
 * NOTE: Video thumbnail generation in React Native requires native modules
 * For now, return a placeholder or use a frame extraction library
 *
 * @param {string} videoUri - Local video URI
 * @returns {Promise<string>} Thumbnail URI
 */
export const generateVideoThumbnail = async (videoUri) => {
  // TODO: Implement video thumbnail generation
  // Options:
  // 1. expo-video-thumbnails (recommended)
  // 2. ffmpeg-kit-react-native
  // 3. Server-side generation

  console.warn('Video thumbnail generation not implemented yet');
  return null;
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url) => {
  return url.split('.').pop().split('?')[0];
};

/**
 * Check if URL is from Firebase Storage
 */
export const isFirebaseStorageUrl = (url) => {
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * Extract storage path from Firebase Storage URL
 */
export const getStoragePathFromUrl = (url) => {
  try {
    const matches = url.match(/\/o\/(.+?)\?/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
    return null;
  } catch (error) {
    console.error('Failed to extract storage path:', error);
    return null;
  }
};
