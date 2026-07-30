import React, { useRef } from 'react';
import { View, Modal, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePostCreationState } from './hooks/use-post-creation-state';
import { MediaSelectionStep } from './steps/media-selection';
import { ProductTaggingStep } from './steps/product-tagging';
import { CaptionDetailsStep } from './steps/caption-details';
import { PreviewShareStep } from './steps/preview-share';
import { useCreatePost, useUpdatePost } from '../../../../../shared/hooks/use-business-posts';
import { useCurrentUserType } from '../../../../../shared/hooks/use-user-type';
import { useAuthStore } from '../../../../../core/auth/stores/auth-store';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../shared/config/firebase';
import { apiClient } from '../../../../../shared/config/api-client';
import * as VideoThumbnails from 'expo-video-thumbnails';

/**
 * Multi-Step Post Creation Flow
 * Instagram/TikTok-inspired UX with product tagging
 */
export function PostCreationFlow({ visible, onClose, initialPost = null, allowedMediaTypes = ['image', 'video'] }) {
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const { currentContext } = useCurrentUserType();
  const { user } = useAuthStore();
  const businessId = currentContext?.businessId;

  const {
    currentStep,
    postType,
    selectedMedia,
    taggedProducts,
    title,
    caption,
    keywords,
    isUploading,
    setTitle,
    setCaption,
    setKeywords,
    setIsUploading,
    goToNextStep,
    goToPreviousStep,
    addProductTag,
    removeProductTag,
    replaceMedia,
    reset,
  } = usePostCreationState(initialPost);

  const uploadMediaWithFallback = async (mediaItem, index) => {
    if (mediaItem.existing) return mediaItem.uri; // Already uploaded URL

    const imageUri = mediaItem.uri;
    const isVideo = mediaItem.type === 'video' || imageUri.endsWith('.mp4');
    const mediaTypeStr = isVideo ? 'video' : 'image';
    const ext = imageUri.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    
    try {
      // 1. Try Firebase first
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `businesses/${businessId || 'unknown'}/posts/${mediaTypeStr}_${Date.now()}_${index}.${ext}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('Firebase upload failed, attempting local backend fallback...', err);
      
      // 2. Fallback to local backend
      const formData = new FormData();
      formData.append(isVideo ? 'video' : 'image', {
        uri: imageUri,
        name: `${mediaTypeStr}_${Date.now()}_${index}.${ext}`,
        type: isVideo ? 'video/mp4' : 'image/jpeg'
      });
      formData.append('productName', 'post_media');
      if (businessId) {
        formData.append('businessId', businessId);
      }

      const uploadRes = await apiClient.post(isVideo ? '/upload/video' : '/upload/image', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      if (uploadRes.data?.url) {
        const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        return `${backendUrl}${uploadRes.data.url}`;
      } else {
        throw new Error('No URL returned from upload');
      }
    }
  };

  const handlePublish = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una imagen o video');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'Necesitas registrar un negocio antes de crear publicaciones.');
      return;
    }

    try {
      setIsUploading(true);

      // Upload all media files
      const uploadedMedia = await Promise.all(
        selectedMedia.map(async (m, index) => {
          const url = await uploadMediaWithFallback(m, index);
          return {
            url,
            type: m.type === 'video' || m.uri.endsWith('.mp4') ? 'video' : 'image'
          };
        })
      );

      // Prepare tagged products data
      const productTags = taggedProducts.map(tag => ({
        productId: tag.productId,
        mediaIndex: tag.mediaIndex,
        name: tag.productName || '',
        price: tag.productPrice || null,
        thumbnailUrl: tag.productImage || null
      }));

      // Generate thumbnail if the first media is a video
      let thumbnailUrl = undefined;
      const firstMedia = selectedMedia[0];
      if (firstMedia && (firstMedia.type === 'video' || firstMedia.uri.endsWith('.mp4'))) {
         try {
           const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(firstMedia.uri, { time: 500 });
           // We trick uploadMediaWithFallback by providing a mock media item for the thumbnail
           thumbnailUrl = await uploadMediaWithFallback({ uri: thumbUri, type: 'image' }, 'thumb');
         } catch(e) {
           console.log("Error generating video thumbnail", e);
         }
      }

      if (initialPost) {
        // Edit post
        await updatePostMutation.mutateAsync({
          postId: initialPost.id,
          data: {
            title: title.trim(),
            caption: caption.trim(),
            type: postType,
            media: uploadedMedia,
            thumbnailUrl: thumbnailUrl || undefined,
            taggedProducts: productTags.length > 0 ? productTags : undefined,
            keywords: keywords.length > 0 ? keywords : undefined,
          }
        });
      } else {
        // Create new post
        await createPostMutation.mutateAsync({
          businessId,
          userId: user?.id,
          title: title.trim(),
          caption: caption.trim(),
          type: postType,
          media: uploadedMedia,
          thumbnailUrl, // Pass thumbnail to backend
          taggedProducts: productTags.length > 0 ? productTags : undefined,
          keywords: keywords.length > 0 ? keywords : undefined,
        });
      }

      // Success
      Alert.alert(initialPost ? '¡Actualizado!' : '¡Publicado!', initialPost ? 'Tu publicación se ha actualizado exitosamente' : 'Tu publicación se ha compartido exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'No se pudo crear la publicación. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    if (initialPost) {
      // Small timeout to allow state reset before animation
      setTimeout(onClose, 100);
    } else {
      onClose();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <MediaSelectionStep
            selectedMedia={selectedMedia}
            onMediaChange={replaceMedia}
            allowedMediaTypes={allowedMediaTypes}
            onNext={goToNextStep}
            onClose={onClose}
          />
        );

      case 1:
        return (
          <ProductTaggingStep
            selectedMedia={selectedMedia}
            taggedProducts={taggedProducts}
            onAddTag={addProductTag}
            onRemoveTag={removeProductTag}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case 2:
        return (
          <CaptionDetailsStep
            selectedMedia={selectedMedia}
            title={title}
            caption={caption}
            keywords={keywords}
            onTitleChange={setTitle}
            onCaptionChange={setCaption}
            onKeywordsChange={setKeywords}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case 3:
        return (
          <PreviewShareStep
            selectedMedia={selectedMedia}
            taggedProducts={taggedProducts}
            title={title}
            caption={caption}
            postType={postType}
            isUploading={isUploading}
            isEditing={!!initialPost}
            onPublish={handlePublish}
            onBack={goToPreviousStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {renderCurrentStep()}
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
}
