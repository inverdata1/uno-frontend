import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useCreatePost } from '../../../../shared/hooks/use-business-posts';
import { uploadMultipleImages } from '../../../../shared/utils/storage';

export const CreatePostModal = ({ visible, onClose }) => {
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const createPostMutation = useCreatePost();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para publicar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
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
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const handlePost = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una imagen');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload images to Firebase Storage
      const uploadedUrls = await uploadMultipleImages(
        selectedImages,
        'posts',
        (progress) => setUploadProgress(progress)
      );

      // Create post with uploaded URLs
      await createPostMutation.mutateAsync({
        caption: caption.trim(),
        media: uploadedUrls.map(url => ({
          type: 'image',
          url: url,
          thumbnailUrl: url
        })),
        type: selectedImages.length > 1 ? 'carousel' : 'image',
        thumbnailUrl: uploadedUrls[0]
      });

      // Reset and close
      setCaption('');
      setSelectedImages([]);
      setUploadProgress(0);
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', 'Tu publicación se ha compartido');
    } catch (error) {
      console.error('Error creating post:', error);
      setIsUploading(false);
      setUploadProgress(0);

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
          {/* Image Picker Buttons */}
          {selectedImages.length === 0 && (
            <View style={{ padding: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={pickImage}
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
                  <Ionicons name="images" size={28} color={colors.primary[500]} />
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
                    Elige fotos de tu dispositivo
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
                    Tomar foto
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={{ position: 'relative' }}>
                      <Image
                        source={{ uri }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          backgroundColor: colors.border.light
                        }}
                        resizeMode="cover"
                      />
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
                  <TouchableOpacity
                    onPress={pickImage}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text.primary
                    }}>
                      Subiendo imágenes...
                    </Text>
                  </View>
                  <View style={{
                    height: 6,
                    backgroundColor: colors.border.light,
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      backgroundColor: colors.primary[500],
                      borderRadius: 3
                    }} />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginTop: 4,
                    textAlign: 'right'
                  }}>
                    {Math.round(uploadProgress)}%
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
