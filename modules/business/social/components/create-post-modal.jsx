import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCreatePostWithMedia } from '../../../../shared/hooks/use-create-post-with-media';

export const CreatePostModal = ({ visible, onClose }) => {
  const [postType, setPostType] = useState('image'); // 'image' or 'video'
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const createPostMutation = useCreatePostWithMedia();

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para publicar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: postType === 'video' ? ['videos'] : ['images'],
      allowsMultipleSelection: postType === 'image', // Only allow multiple for images
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max for videos
    });

    if (!result.canceled) {
      setSelectedImages(result.assets.map(asset => asset.uri));
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: postType === 'video' ? ['videos'] : ['images'],
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const handlePost = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', `Selecciona al menos ${postType === 'video' ? 'un video' : 'una imagen'}`);
      return;
    }

    setIsUploading(true);
    setUploadMessage('Processing and uploading media...');

    try {
      // Determine final post type
      let finalType = postType;
      if (postType === 'image' && selectedImages.length > 1) {
        finalType = 'carousel';
      }

      // Create post with media processing (happens in the API)
      await createPostMutation.mutateAsync({
        caption: caption.trim(),
        type: finalType,
        mediaFiles: selectedImages
      });

      // Reset and close
      setCaption('');
      setSelectedImages([]);
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', 'Tu publicación se ha compartido');
    } catch (error) {
      console.error('Error creating post:', error);
      setIsUploading(false);

      // Better error message
      if (error.message?.includes('No business context available')) {
        Alert.alert(
          'Negocio requerido',
          'Necesitas registrar un negocio antes de crear publicaciones. Por favor, ve a tu perfil y crea tu negocio.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo crear la publicación. Intenta de nuevo.');
      }
    }
  };

  const handleClose = () => {
    setCaption('');
    setSelectedImages([]);
    setPostType('image');
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={{
        backgroundColor: colors.bg.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%'
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Nueva publicación
          </Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={selectedImages.length === 0 || isUploading || createPostMutation.isLoading}
          >
            {(isUploading || createPostMutation.isLoading) ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: selectedImages.length === 0 ? colors.text.secondary : colors.primary[500]
              }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 500 }}>
          {/* Post Type Selector */}
          <View style={{
            flexDirection: 'row',
            padding: 20,
            paddingBottom: 12,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <TouchableOpacity
              onPress={() => {
                setPostType('image');
                setSelectedImages([]);
              }}
              disabled={isUploading || createPostMutation.isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: postType === 'image' ? colors.primary[500] : colors.bg.secondary,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Ionicons
                name="image"
                size={20}
                color={postType === 'image' ? colors.text.inverse : colors.text.secondary}
              />
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: postType === 'image' ? colors.text.inverse : colors.text.secondary
              }}>
                Imagen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPostType('video');
                setSelectedImages([]);
              }}
              disabled={isUploading || createPostMutation.isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: postType === 'video' ? colors.primary[500] : colors.bg.secondary,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Ionicons
                name="videocam"
                size={20}
                color={postType === 'video' ? colors.text.inverse : colors.text.secondary}
              />
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: postType === 'video' ? colors.text.inverse : colors.text.secondary
              }}>
                Video
              </Text>
            </TouchableOpacity>
          </View>

          {/* Media Picker Buttons */}
          {selectedImages.length === 0 && (
            <View style={{ padding: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={pickMedia}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.border.light
                }}
              >
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: colors.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons
                    name={postType === 'video' ? 'videocam' : 'images'}
                    size={28}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 2
                  }}>
                    Seleccionar de galería
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text.secondary
                  }}>
                    {postType === 'video' ? 'Elige un video de tu dispositivo' : 'Elige fotos de tu dispositivo'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.border.light
                }}
              >
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: '#8b5cf620',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="camera" size={28} color="#8b5cf6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 2
                  }}>
                    {postType === 'video' ? 'Grabar video' : 'Tomar foto'}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text.secondary
                  }}>
                    Abre la cámara
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <View style={{ padding: 20 }}>
              <View style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                padding: 12,
                marginBottom: 16
              }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingHorizontal: 4 }}
                >
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={{ position: 'relative' }}>
                      <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: colors.border.light
                      }}>
                        <Image
                          source={{ uri }}
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.danger[500],
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Ionicons name="close" size={16} color={colors.text.inverse} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {postType === 'image' && (
                    <TouchableOpacity
                      onPress={pickMedia}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        backgroundColor: colors.bg.primary,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: colors.border.light,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Ionicons name="add" size={32} color={colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              {/* Caption Input */}
              <TextInput
                placeholder="Escribe una descripción..."
                placeholderTextColor={colors.text.secondary}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={4}
                editable={!isUploading && !createPostMutation.isLoading}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  minHeight: 120,
                  textAlignVertical: 'top'
                }}
              />

              {/* Upload Progress */}
              {isUploading && (
                <View style={{
                  marginTop: 16,
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 16,
                  padding: 16
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text.primary
                    }}>
                      {uploadMessage || (postType === 'video' ? 'Processing video...' : 'Uploading images...')}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginTop: 8
                  }}>
                    {postType === 'video' ? 'Generating thumbnail and uploading...' : 'This may take a moment...'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
