import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload image to Firebase Storage
 * @param {string} uri - Local file URI from image picker
 * @param {string} folder - Storage folder path (e.g., 'posts', 'stories', 'products')
 * @param {function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadImage = async (uri, folder = 'posts', onProgress) => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}_${randomString}.jpg`;

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${filename}`);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          // Handle upload errors
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images in parallel
 * @param {string[]} uris - Array of local file URIs
 * @param {string} folder - Storage folder path
 * @param {function} onProgress - Optional callback for overall progress
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleImages = async (uris, folder = 'posts', onProgress) => {
  const totalImages = uris.length;
  let completedImages = 0;

  const uploadPromises = uris.map(async (uri) => {
    const url = await uploadImage(uri, folder, (imageProgress) => {
      // Calculate overall progress
      const overallProgress = ((completedImages + imageProgress / 100) / totalImages) * 100;
      onProgress?.(overallProgress);
    });

    completedImages++;
    onProgress?.((completedImages / totalImages) * 100);

    return url;
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload video to Firebase Storage
 * @param {string} uri - Local video URI
 * @param {string} folder - Storage folder path
 * @param {function} onProgress - Optional callback for upload progress
 * @returns {Promise<string>} - Download URL of uploaded video
 */
export const uploadVideo = async (uri, folder = 'videos', onProgress) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}_${randomString}.mp4`;

    const storageRef = ref(storage, `${folder}/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Video upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Generate thumbnail from video (for future implementation)
 * This would require expo-video-thumbnails or similar
 */
export const generateVideoThumbnail = async (videoUri) => {
  // TODO: Implement video thumbnail generation
  // For now, return a placeholder or the video URI
  return videoUri;
};
