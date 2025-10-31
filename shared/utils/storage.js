import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as VideoThumbnails from 'expo-video-thumbnails';

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
 * Generate thumbnail from video
 * @param {string} videoUri - Local video URI
 * @param {number} time - Time in milliseconds to capture thumbnail (default: 0ms - first frame)
 * @returns {Promise<string>} - Local URI of generated thumbnail
 */
export const generateVideoThumbnail = async (videoUri, time = 0) => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time, // Time in ms
      quality: 0.8,
    });
    return uri;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    throw error;
  }
};

/**
 * Upload video with thumbnail generation
 * @param {string} videoUri - Local video URI
 * @param {string} folder - Storage folder path
 * @param {function} onProgress - Optional callback for upload progress
 * @returns {Promise<{videoUrl: string, thumbnailUrl: string}>} - URLs of uploaded video and thumbnail
 */
export const uploadVideoWithThumbnail = async (videoUri, folder = 'videos', onProgress) => {
  try {
    // Generate thumbnail
    onProgress?.(10); // 10% for thumbnail generation
    const thumbnailUri = await generateVideoThumbnail(videoUri);

    // Upload both video and thumbnail
    onProgress?.(20); // 20% before uploads start

    // Upload video (takes 20-80% of progress)
    const videoUrl = await uploadVideo(videoUri, folder, (progress) => {
      // Map video upload progress to 20-80% range
      onProgress?.(20 + (progress * 0.6));
    });

    // Upload thumbnail (takes 80-100% of progress)
    const thumbnailUrl = await uploadImage(thumbnailUri, `${folder}/thumbnails`, (progress) => {
      // Map thumbnail upload progress to 80-100% range
      onProgress?.(80 + (progress * 0.2));
    });

    return { videoUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error uploading video with thumbnail:', error);
    throw error;
  }
};
