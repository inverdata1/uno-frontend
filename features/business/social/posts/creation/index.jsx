import React, { useRef } from 'react';
import { View, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePostCreationState } from './hooks/use-post-creation-state';
import { MediaSelectionStep } from './steps/media-selection';
import { ProductTaggingStep } from './steps/product-tagging';
import { CaptionDetailsStep } from './steps/caption-details';
import { PreviewShareStep } from './steps/preview-share';
import { useCreatePostWithMedia } from '../../../../../shared/hooks/use-create-post-with-media';

/**
 * Multi-Step Post Creation Flow
 * Instagram/TikTok-inspired UX with product tagging
 */
export function PostCreationFlow({ visible, onClose }) {
  const createPostMutation = useCreatePostWithMedia();

  const {
    currentStep,
    postType,
    selectedMedia,
    taggedProducts,
    caption,
    keywords,
    isUploading,
    setCaption,
    setKeywords,
    setIsUploading,
    goToNextStep,
    goToPreviousStep,
    addProductTag,
    removeProductTag,
    replaceMedia,
    reset,
  } = usePostCreationState();

  const handlePublish = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una imagen o video');
      return;
    }

    try {
      setIsUploading(true);

      // Prepare media files
      const mediaFiles = selectedMedia.map(m => m.uri);

      // Prepare tagged products data
      const productTags = taggedProducts.map(tag => ({
        productId: tag.productId,
        mediaIndex: tag.mediaIndex,
      }));

      console.log('[PostCreation] Creating post with type:', postType);
      console.log('[PostCreation] Selected media:', selectedMedia.map(m => ({ type: m.type, uri: m.uri.substring(0, 50) })));

      // Create post
      await createPostMutation.mutateAsync({
        caption: caption.trim(),
        type: postType,
        mediaFiles,
        taggedProducts: productTags.length > 0 ? productTags : undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      });

      // Success
      Alert.alert('¡Publicado!', 'Tu publicación se ha compartido exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setIsUploading(false);

      if (error.message?.includes('No business context available')) {
        Alert.alert(
          'Negocio requerido',
          'Necesitas registrar un negocio antes de crear publicaciones.'
        );
      } else {
        Alert.alert('Error', 'No se pudo crear la publicación. Intenta de nuevo.');
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <MediaSelectionStep
            selectedMedia={selectedMedia}
            onMediaChange={replaceMedia}
            onNext={goToNextStep}
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
            caption={caption}
            keywords={keywords}
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
            caption={caption}
            postType={postType}
            isUploading={isUploading}
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {renderCurrentStep()}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}
