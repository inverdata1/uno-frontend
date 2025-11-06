import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Dimensions, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

const { width, height } = Dimensions.get('window');
const PREVIEW_HEIGHT = height * 0.5;
const GRID_ITEM_SIZE = width / 4;

/**
 * Step 1: Media Selection
 * Instagram-inspired: Preview on top, gallery grid on bottom
 */
export function MediaSelectionStep({ selectedMedia, onMediaChange, onNext }) {
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadGalleryPhotos();
  }, []);

  const loadGalleryPhotos = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      setHasPermission(false);
      return;
    }

    setHasPermission(true);

    // Load recent photos
    const media = await MediaLibrary.getAssetsAsync({
      first: 100,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    setGalleryPhotos(media.assets);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('[MediaSelection] Camera captured:', { type: asset.type, uri: asset.uri.substring(0, 50) });

      const media = [{
        uri: asset.uri,
        type: asset.type, // ImagePicker already returns 'image' or 'video'
        duration: asset.duration,
      }];

      console.log('[MediaSelection] Media object created:', { type: media[0].type, uri: media[0].uri.substring(0, 50) });
      onMediaChange(media);
    }
  };

  const selectPhoto = (asset) => {
    console.log('[MediaSelection] Gallery asset selected:', { mediaType: asset.mediaType, uri: asset.uri.substring(0, 50) });

    const media = {
      uri: asset.uri,
      type: asset.mediaType === 'video' ? 'video' : 'image',
      duration: asset.duration,
    };

    console.log('[MediaSelection] Media object created:', { type: media.type, uri: media.uri.substring(0, 50) });

    // For now, single selection (can be changed to multi-select later)
    onMediaChange([media]);
  };

  const handleNext = () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Selecciona media', 'Debes seleccionar al menos una foto o video');
      return;
    }
    onNext();
  };

  const isSelected = (uri) => {
    return selectedMedia.some(media => media.uri === uri);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text.primary
        }}>
          Nueva publicación
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedMedia.length === 0}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: selectedMedia.length === 0 ? colors.text.secondary : colors.primary[500]
          }}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Area - Top Half */}
      <View style={{
        height: PREVIEW_HEIGHT,
        backgroundColor: colors.bg.secondary,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {selectedMedia.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Ionicons name="images-outline" size={64} color={colors.text.secondary} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginTop: 16,
              textAlign: 'center'
            }}>
              Selecciona una imagen
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary,
              marginTop: 8,
              textAlign: 'center'
            }}>
              Elige desde tu galería o toma una foto
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: selectedMedia[0].uri }}
            style={{
              width: '100%',
              height: '100%'
            }}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Gallery Grid - Bottom Half */}
      <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
        {!hasPermission ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Ionicons name="images-outline" size={48} color={colors.text.secondary} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginTop: 16,
              textAlign: 'center'
            }}>
              Permiso de galería requerido
            </Text>
            <TouchableOpacity
              onPress={loadGalleryPhotos}
              style={{
                marginTop: 16,
                backgroundColor: colors.primary[500],
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20
              }}
            >
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.text.inverse
              }}>
                Dar permiso
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={[{ type: 'camera' }, ...galleryPhotos]}
            numColumns={4}
            keyExtractor={(item, index) => item.id || `camera-${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              // Camera button as first item
              if (item.type === 'camera') {
                return (
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={{
                      width: GRID_ITEM_SIZE,
                      height: GRID_ITEM_SIZE,
                      padding: 1,
                    }}
                  >
                    <View style={{
                      flex: 1,
                      backgroundColor: colors.bg.secondary,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Ionicons name="camera" size={32} color={colors.text.secondary} />
                    </View>
                  </TouchableOpacity>
                );
              }

              // Gallery photos
              const selected = isSelected(item.uri);

              return (
                <TouchableOpacity
                  onPress={() => selectPhoto(item)}
                  style={{
                    width: GRID_ITEM_SIZE,
                    height: GRID_ITEM_SIZE,
                    padding: 1,
                  }}
                >
                  <View style={{ flex: 1, position: 'relative' }}>
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />

                    {/* Video indicator */}
                    {item.mediaType === 'video' && (
                      <View style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 4,
                        padding: 4
                      }}>
                        <Ionicons name="videocam" size={12} color="#fff" />
                      </View>
                    )}

                    {/* Selection indicator */}
                    {selected && (
                      <>
                        <View style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                        }} />
                        <View style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primary[500],
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
