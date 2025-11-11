import { useState, useCallback } from 'react';

/**
 * Shared state management for multi-step post creation flow
 * Inspired by Instagram/TikTok post creation UX
 */
export function usePostCreationState() {
  // Current step (0-based index)
  const [currentStep, setCurrentStep] = useState(0);

  // Post data
  const [postType, setPostType] = useState('image'); // 'image', 'video', 'carousel'
  const [selectedMedia, setSelectedMedia] = useState([]); // Array of { uri, type, duration? }
  const [taggedProducts, setTaggedProducts] = useState([]); // Array of { productId, position: { x, y }, mediaIndex }
  const [caption, setCaption] = useState('');
  const [keywords, setKeywords] = useState([]); // Array of strings (max 5)
  const [location, setLocation] = useState(null);

  // UI state
  const [isUploading, setIsUploading] = useState(false);

  // Step navigation
  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 3)); // Max 4 steps (0-3)
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, 3)));
  }, []);

  // Media management
  const addMedia = useCallback((media) => {
    setSelectedMedia(prev => [...prev, media]);
    // Auto-determine post type
    if (media.type === 'video') {
      setPostType('video');
    } else if (selectedMedia.length > 0 && postType !== 'video') {
      setPostType('carousel');
    }
  }, [selectedMedia.length, postType]);

  const removeMedia = useCallback((index) => {
    setSelectedMedia(prev => {
      const newMedia = prev.filter((_, i) => i !== index);
      // Update post type
      if (newMedia.length === 0) {
        setPostType('image');
      } else if (newMedia.length === 1 && newMedia[0].type !== 'video') {
        setPostType('image');
      }
      return newMedia;
    });
    // Remove associated product tags
    setTaggedProducts(prev => prev.filter(tag => tag.mediaIndex !== index));
  }, []);

  const replaceMedia = useCallback((mediaArray) => {
    console.log('[PostCreationState] replaceMedia called with:', mediaArray.map(m => ({ type: m.type, uri: m.uri.substring(0, 50) })));

    setSelectedMedia(mediaArray);

    // Determine post type
    let determinedType = 'image';
    if (mediaArray.length === 0) {
      determinedType = 'image';
    } else if (mediaArray.some(m => m.type === 'video')) {
      determinedType = 'video';
    } else if (mediaArray.length > 1) {
      determinedType = 'carousel';
    } else {
      determinedType = 'image';
    }

    console.log('[PostCreationState] Post type determined:', determinedType);
    setPostType(determinedType);
  }, []);

  // Product tagging
  const addProductTag = useCallback((tag) => {
    setTaggedProducts(prev => [...prev, tag]);
  }, []);

  const removeProductTag = useCallback((productId, mediaIndex) => {
    setTaggedProducts(prev =>
      prev.filter(tag => !(tag.productId === productId && tag.mediaIndex === mediaIndex))
    );
  }, []);

  const updateProductTagPosition = useCallback((productId, mediaIndex, position) => {
    setTaggedProducts(prev =>
      prev.map(tag =>
        tag.productId === productId && tag.mediaIndex === mediaIndex
          ? { ...tag, position }
          : tag
      )
    );
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setCurrentStep(0);
    setPostType('image');
    setSelectedMedia([]);
    setTaggedProducts([]);
    setCaption('');
    setKeywords([]);
    setLocation(null);
    setIsUploading(false);
  }, []);

  // Validation
  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 0: // Media selection
        return selectedMedia.length > 0;
      case 1: // Product tagging (optional)
        return true;
      case 2: // Caption & details (caption optional)
        return true;
      case 3: // Preview & share
        return false; // Final step, no next
      default:
        return false;
    }
  }, [currentStep, selectedMedia.length]);

  const canGoBack = useCallback(() => {
    return currentStep > 0;
  }, [currentStep]);

  return {
    // Current state
    currentStep,
    postType,
    selectedMedia,
    taggedProducts,
    caption,
    keywords,
    location,
    isUploading,

    // Setters
    setCaption,
    setKeywords,
    setLocation,
    setIsUploading,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canProceedToNextStep,
    canGoBack,

    // Media management
    addMedia,
    removeMedia,
    replaceMedia,

    // Product tagging
    addProductTag,
    removeProductTag,
    updateProductTagPosition,

    // Reset
    reset,
  };
}
