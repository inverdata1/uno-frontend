import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, StatusBar, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../shared/config/firebase';
import { apiClient } from '../../../../../shared/config/api-client';
import { Text } from '../../../../../shared/components/ui';
import { colors } from '../../../../../shared/utils/colors';
import { useCurrentUserType } from '../../../../../shared/hooks/use-user-type';
import { useCreateStory } from '../../../../../shared/hooks/use-business-social';
import { useAuthStore } from '../../../../../core/auth/stores/auth-store';
import { VideoView, useVideoPlayer } from 'expo-video';

export const CreateStoryModal = ({ visible, onClose }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuthStore();
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;
  const createStoryMutation = useCreateStory();

  const player = useVideoPlayer(selectedAsset?.uri, (player) => {
    player.loop = true;
    player.play();
  });

  const handlePickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        videoMaxDuration: 30, // iOS limits to 30s in the picker
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Manual check for Android which might not enforce videoMaxDuration in all pickers
        if (asset.type === 'video' && asset.duration && asset.duration > 31000) { // giving 1s grace period
          Alert.alert('Video muy largo', 'Las historias en video no pueden durar más de 30 segundos.');
          return;
        }
        
        setSelectedAsset(asset);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'No se pudo abrir la galería de medios');
    }
  };

  const uploadMediaWithFallback = async (asset) => {
    const imageUri = asset.uri;
    const isVideo = asset.type === 'video' || asset.mimeType?.startsWith('video/') || imageUri.endsWith('.mp4');
    const mediaTypeStr = isVideo ? 'video' : 'image';
    const ext = asset.uri?.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    
    try {
      // 1. Try Firebase first
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `businesses/${businessId || 'unknown'}/stories/${mediaTypeStr}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('Firebase upload failed, attempting local backend fallback...', err);
      
      // 2. Fallback to local backend
      const formData = new FormData();
      formData.append(isVideo ? 'video' : 'image', {
        uri: imageUri,
        name: asset.name || `${mediaTypeStr}_${Date.now()}.${ext}`,
        type: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')
      });
      formData.append('productName', 'story_media');
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
        const backendUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';
        return `${backendUrl}${uploadRes.data.url}`;
      } else {
        throw new Error('No URL returned from upload');
      }
    }
  };

  const handlePublish = async () => {
    if (!selectedAsset) {
      Alert.alert('Error', 'Selecciona una imagen o video');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'Necesitas registrar un negocio antes de crear historias.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Media
      const uploadedUrl = await uploadMediaWithFallback(selectedAsset);
      
      const isVideo = selectedAsset.mimeType?.startsWith('video/') || selectedAsset.uri.endsWith('.mp4');
      
      // Parse tags
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

      // 2. Create Story
      await createStoryMutation.mutateAsync({
        businessId,
        userId: user?.id,
        mediaUrl: uploadedUrl,
        mediaType: isVideo ? 'video' : 'image',
        tags: tagsArray,
        duration: isVideo ? 30 : 5, // Media duration
        expiresInHours: duration // Story lifetime
      });

      // Reset and close
      handleClose();
      Alert.alert('¡Listo!', 'Tu historia se ha publicado');
    } catch (error) {
      console.error('Error creating story:', error);
      Alert.alert('Error', 'No se pudo publicar la historia. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedAsset(null);
      setTags('');
      setDuration(24);
      onClose();
    }
  };

  const isVideo = selectedAsset?.mimeType?.startsWith('video/') || selectedAsset?.uri?.endsWith('.mp4');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light
        }}>
          <TouchableOpacity onPress={handleClose} disabled={isUploading} activeOpacity={0.6}>
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
            disabled={!selectedAsset || isUploading}
            activeOpacity={0.6}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: !selectedAsset ? colors.text.secondary : colors.primary[500]
              }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ flex: 1, padding: 16, gap: 20 }}>
            
            {/* Media Selector */}
            <TouchableOpacity 
              onPress={handlePickMedia}
              disabled={isUploading}
              style={{
                height: 300,
                backgroundColor: colors.bg.secondary,
                borderRadius: 16,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border.light,
                borderStyle: selectedAsset ? 'solid' : 'dashed'
              }}
            >
              {selectedAsset ? (
                isVideo ? (
                  <VideoView
                    player={player}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    nativeControls={false}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedAsset.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )
              ) : (
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <Ionicons name="cloud-upload-outline" size={48} color={colors.text.secondary} />
                  <Text style={{ fontSize: 16, color: colors.text.secondary }}>
                    Toca para seleccionar imagen o vídeo
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: 'center', paddingHorizontal: 20 }}>
                    Videos hasta 30 segundos. Usarás el explorador nativo.
                  </Text>
                </View>
              )}
              
              {selectedAsset && !isUploading && (
                <View style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 20,
                  padding: 8
                }}>
                  <Ionicons name="pencil" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Duration Selector */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                Duración de la historia
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[6, 12, 24, 48].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    onPress={() => setDuration(hours)}
                    disabled={isUploading}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      backgroundColor: duration === hours ? colors.primary[500] : colors.bg.secondary,
                      borderRadius: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: duration === hours ? colors.primary[500] : colors.border.light
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: duration === hours ? '700' : '500',
                      color: duration === hours ? colors.text.inverse : colors.text.primary
                    }}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 8 }}>
                Etiquetas (opcional)
              </Text>
              <TextInput
                value={tags}
                onChangeText={setTags}
                editable={!isUploading}
                placeholder="Ej. oferta, hamburguesas, nuevo"
                placeholderTextColor={colors.text.secondary}
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 15,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              />
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 6 }}>
                Separa las palabras clave por comas.
              </Text>
            </View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
