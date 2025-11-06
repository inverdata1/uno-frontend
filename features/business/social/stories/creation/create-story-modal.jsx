import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Text } from '../../../../../shared/components/ui';
import { useCreateStoryWithMedia } from '../../../../../shared/hooks/use-create-story-with-media';
import { colors } from '../../../../../shared/utils/colors';

export const CreateStoryModal = ({ visible, onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const createStoryMutation = useCreateStoryWithMedia();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para crear una historia');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [9, 16], // Story aspect ratio
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('image');
    }
  };

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus videos para crear una historia');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // Max 60 seconds
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        duration: asset.duration ? Math.ceil(asset.duration / 1000) : 15 // Convert ms to seconds, default to 15s
      });
      setMediaType('video');
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
      aspect: [9, 16],
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0].uri);
      setMediaType('image');
    }
  };

  const handlePublish = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Selecciona una imagen o video');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Processing and uploading media...');

    try {
      const mediaUri = typeof selectedMedia === 'string' ? selectedMedia : selectedMedia.uri;
      const duration = mediaType === 'image' ? 5 : selectedMedia.duration;

      // Create story with media processing (happens in the API)
      await createStoryMutation.mutateAsync({
        type: mediaType,
        mediaFile: mediaUri,
        duration
      });

      // Reset and close
      setSelectedMedia(null);
      setMediaType(null);
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', 'Tu historia se ha publicado');
    } catch (error) {
      console.error('Error creating story:', error);
      setIsUploading(false);
      setUploadProgress(0);

      // Better error message
      if (error.message?.includes('No business context available')) {
        Alert.alert(
          'Negocio requerido',
          'Necesitas registrar un negocio antes de crear historias. Por favor, ve a tu perfil y crea tu negocio.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo crear la historia. Intenta de nuevo.');
      }
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedMedia(null);
      setMediaType(null);
      onClose();
    }
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
          <TouchableOpacity onPress={handleClose} disabled={isUploading}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Nueva historia
          </Text>
          <TouchableOpacity
            onPress={handlePublish}
            disabled={!selectedMedia || isUploading || createStoryMutation.isLoading}
          >
            {(isUploading || createStoryMutation.isLoading) ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: !selectedMedia ? colors.text.secondary : colors.primary[500]
              }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {!selectedMedia ? (
            // Media picker options
            <View style={{ gap: 12 }}>
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
                  <Ionicons name="image" size={28} color={colors.primary[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 2
                  }}>
                    Seleccionar foto
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text.secondary
                  }}>
                    Elige una foto de tu galería
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickVideo}
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
                  backgroundColor: '#ec489920',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="videocam" size={28} color="#ec4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 2
                  }}>
                    Seleccionar video
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text.secondary
                  }}>
                    Elige un video de tu galería (máx. 60s)
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
          ) : (
            // Media preview
            <View>
              <View style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                overflow: 'hidden',
                aspectRatio: 9 / 16,
                maxHeight: 500
              }}>
                {mediaType === 'image' && (
                  <Image
                    source={{ uri: selectedMedia }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )}
                {mediaType === 'video' && (
                  <View style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: colors.bg.secondary,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="videocam" size={64} color={colors.text.secondary} />
                    <Text style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: colors.text.secondary
                    }}>
                      Video seleccionado
                    </Text>
                    {selectedMedia?.duration && (
                      <Text style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: colors.text.secondary
                      }}>
                        {selectedMedia.duration}s
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Change media button */}
              {!isUploading && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMedia(null);
                    setMediaType(null);
                  }}
                  style={{
                    marginTop: 12,
                    backgroundColor: colors.bg.secondary,
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Ionicons name="refresh" size={20} color={colors.text.primary} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.text.primary
                  }}>
                    Cambiar {mediaType === 'image' ? 'foto' : 'video'}
                  </Text>
                </TouchableOpacity>
              )}

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
                      {uploadMessage || 'Uploading story...'}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginTop: 8
                  }}>
                    {mediaType === 'video' ? 'Generating thumbnail and uploading...' : 'This may take a moment...'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
