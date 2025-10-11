import { useState, useCallback } from 'react';
import { uploadMedia, uploadMultipleMedia, deleteMedia, UPLOAD_TYPES } from '../services/media-upload';
import * as ImagePicker from 'expo-image-picker';

/**
 * Hook for uploading single or multiple media files
 *
 * @param {string} uploadType - Type from UPLOAD_TYPES
 * @returns {object} Upload state and functions
 */
export const useMediaUpload = (uploadType) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /**
   * Upload single file
   */
  const upload = useCallback(async (uri, options = {}) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const result = await uploadMedia(
        uri,
        uploadType,
        options,
        (percent) => setProgress(percent)
      );

      setUploadedFiles(prev => [...prev, result]);
      setUploading(false);
      setProgress(100);

      return result;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  }, [uploadType]);

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(async (uris, options = {}) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const results = await uploadMultipleMedia(
        uris,
        uploadType,
        options,
        (percent, index, total) => {
          const overallProgress = ((index + (percent / 100)) / total) * 100;
          setProgress(overallProgress);
        }
      );

      setUploadedFiles(prev => [...prev, ...results]);
      setUploading(false);
      setProgress(100);

      return results;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  }, [uploadType]);

  /**
   * Remove uploaded file
   */
  const remove = useCallback(async (path) => {
    try {
      await deleteMedia(path);
      setUploadedFiles(prev => prev.filter(f => f.path !== path));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Clear all uploaded files
   */
  const clear = useCallback(() => {
    setUploadedFiles([]);
    setProgress(0);
    setError(null);
  }, []);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFiles([]);
  }, []);

  return {
    upload,
    uploadMultiple,
    remove,
    clear,
    reset,
    uploading,
    progress,
    error,
    uploadedFiles
  };
};

/**
 * Hook for image picker with upload
 *
 * @param {string} uploadType - Type from UPLOAD_TYPES
 * @param {object} options - Image picker options
 * @returns {object} Picker state and functions
 */
export const useImagePicker = (uploadType, options = {}) => {
  const mediaUpload = useMediaUpload(uploadType);
  const [picking, setPicking] = useState(false);

  /**
   * Pick single image from library
   */
  const pickImage = useCallback(async (autoUpload = true) => {
    try {
      setPicking(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 1,
        ...options
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;

        if (autoUpload) {
          return await mediaUpload.upload(uri);
        }

        return { uri };
      }

      return null;
    } catch (err) {
      setPicking(false);
      throw err;
    }
  }, [uploadType, options, mediaUpload]);

  /**
   * Pick multiple images from library
   */
  const pickMultipleImages = useCallback(async (autoUpload = true) => {
    try {
      setPicking(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: options.quality || 1,
        ...options
      });

      setPicking(false);

      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map(asset => asset.uri);

        if (autoUpload) {
          return await mediaUpload.uploadMultiple(uris);
        }

        return uris.map(uri => ({ uri }));
      }

      return null;
    } catch (err) {
      setPicking(false);
      throw err;
    }
  }, [uploadType, options, mediaUpload]);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async (autoUpload = true) => {
    try {
      setPicking(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 1,
        ...options
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;

        if (autoUpload) {
          return await mediaUpload.upload(uri);
        }

        return { uri };
      }

      return null;
    } catch (err) {
      setPicking(false);
      throw err;
    }
  }, [uploadType, options, mediaUpload]);

  return {
    pickImage,
    pickMultipleImages,
    takePhoto,
    picking,
    ...mediaUpload
  };
};

/**
 * Hook for video picker with upload
 *
 * @param {string} uploadType - Type from UPLOAD_TYPES (POST_VIDEO or STORY_VIDEO)
 * @param {object} options - Video picker options
 * @returns {object} Picker state and functions
 */
export const useVideoPicker = (uploadType, options = {}) => {
  const mediaUpload = useMediaUpload(uploadType);
  const [picking, setPicking] = useState(false);

  /**
   * Pick video from library
   */
  const pickVideo = useCallback(async (autoUpload = true) => {
    try {
      setPicking(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
        videoMaxDuration: options.videoMaxDuration || 60,
        quality: options.quality || 1,
        ...options
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const duration = result.assets[0].duration;

        if (autoUpload) {
          return await mediaUpload.upload(uri, { metadata: { duration } });
        }

        return { uri, duration };
      }

      return null;
    } catch (err) {
      setPicking(false);
      throw err;
    }
  }, [uploadType, options, mediaUpload]);

  /**
   * Record video with camera
   */
  const recordVideo = useCallback(async (autoUpload = true) => {
    try {
      setPicking(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: options.videoMaxDuration || 60,
        quality: options.quality || 1,
        ...options
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const duration = result.assets[0].duration;

        if (autoUpload) {
          return await mediaUpload.upload(uri, { metadata: { duration } });
        }

        return { uri, duration };
      }

      return null;
    } catch (err) {
      setPicking(false);
      throw err;
    }
  }, [uploadType, options, mediaUpload]);

  return {
    pickVideo,
    recordVideo,
    picking,
    ...mediaUpload
  };
};

// Export upload types for convenience
export { UPLOAD_TYPES };
