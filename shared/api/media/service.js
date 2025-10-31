import * as VideoThumbnails from 'expo-video-thumbnails';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

/**
 * Media Processing Service
 * Simulates backend media processing (thumbnail generation, compression, etc.)
 * In a real backend, this would run on the server side
 */
export class MediaProcessingService {
  /**
   * Generate thumbnail from video
   * @param {string} videoUri - Local video URI
   * @param {number} time - Time in ms to capture thumbnail
   * @returns {Promise<string>} Local URI of generated thumbnail
   */
  static async generateThumbnail(videoUri, time = 0) {
    try {
      console.log('🎬 Generating thumbnail for video:', videoUri);
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time,
        quality: 0.8,
      });
      console.log('✅ Thumbnail generated:', uri);
      return uri;
    } catch (error) {
      console.error('❌ Error generating thumbnail:', error);
      throw new Error(`Failed to generate video thumbnail: ${error.message}`);
    }
  }

  /**
   * Upload file to Firebase Storage
   * @param {string} uri - Local file URI
   * @param {string} path - Storage path (e.g., 'posts/video.mp4')
   * @param {function} onProgress - Progress callback
   * @returns {Promise<string>} Download URL
   */
  static async uploadFile(uri, path, onProgress) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error('❌ Upload error:', error);
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
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Process and upload video with thumbnail
   * Simulates backend video processing pipeline
   * @param {string} videoUri - Local video URI
   * @param {string} folder - Storage folder
   * @param {function} onProgress - Progress callback
   * @returns {Promise<{videoUrl: string, thumbnailUrl: string}>}
   */
  static async processVideo(videoUri, folder = 'videos', onProgress) {
    console.log('🎬 [Media Service] Processing video:', videoUri);

    try {
      // Step 1: Generate thumbnail (0-15% progress)
      onProgress?.({ stage: 'thumbnail', progress: 0 });
      const thumbnailUri = await this.generateThumbnail(videoUri);
      onProgress?.({ stage: 'thumbnail', progress: 100 });

      // Generate unique filenames
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const videoFilename = `${timestamp}_${randomString}.mp4`;
      const thumbnailFilename = `${timestamp}_${randomString}_thumb.jpg`;

      // Step 2: Upload video (15-75% progress)
      onProgress?.({ stage: 'video', progress: 0 });
      const videoUrl = await this.uploadFile(
        videoUri,
        `${folder}/${videoFilename}`,
        (progress) => onProgress?.({ stage: 'video', progress })
      );

      // Step 3: Upload thumbnail (75-100% progress)
      onProgress?.({ stage: 'thumbnail_upload', progress: 0 });
      const thumbnailUrl = await this.uploadFile(
        thumbnailUri,
        `${folder}/thumbnails/${thumbnailFilename}`,
        (progress) => onProgress?.({ stage: 'thumbnail_upload', progress })
      );

      console.log('✅ [Media Service] Video processed successfully');
      console.log('   Video URL:', videoUrl);
      console.log('   Thumbnail URL:', thumbnailUrl);

      return { videoUrl, thumbnailUrl };
    } catch (error) {
      console.error('❌ [Media Service] Video processing failed:', error);
      throw error;
    }
  }

  /**
   * Process and upload image
   * @param {string} imageUri - Local image URI
   * @param {string} folder - Storage folder
   * @param {function} onProgress - Progress callback
   * @returns {Promise<string>} Image URL
   */
  static async processImage(imageUri, folder = 'images', onProgress) {
    console.log('🖼️ [Media Service] Processing image:', imageUri);

    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}_${randomString}.jpg`;

      const imageUrl = await this.uploadFile(
        imageUri,
        `${folder}/${filename}`,
        (progress) => onProgress?.({ stage: 'image', progress })
      );

      console.log('✅ [Media Service] Image processed successfully:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ [Media Service] Image processing failed:', error);
      throw error;
    }
  }

  /**
   * Process multiple images
   * @param {string[]} imageUris - Array of local image URIs
   * @param {string} folder - Storage folder
   * @param {function} onProgress - Progress callback
   * @returns {Promise<string[]>} Array of image URLs
   */
  static async processImages(imageUris, folder = 'images', onProgress) {
    console.log(`🖼️ [Media Service] Processing ${imageUris.length} images`);

    const totalImages = imageUris.length;
    let completedImages = 0;

    const uploadPromises = imageUris.map(async (uri, index) => {
      const url = await this.processImage(uri, folder, (progressData) => {
        const overallProgress = ((completedImages + progressData.progress / 100) / totalImages) * 100;
        onProgress?.({ stage: 'images', progress: overallProgress, current: index + 1, total: totalImages });
      });

      completedImages++;
      onProgress?.({ stage: 'images', progress: (completedImages / totalImages) * 100, current: completedImages, total: totalImages });

      return url;
    });

    const urls = await Promise.all(uploadPromises);
    console.log(`✅ [Media Service] ${urls.length} images processed successfully`);
    return urls;
  }
}
