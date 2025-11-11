import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const [albumThumbnails, setAlbumThumbnails] = useState({});

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      loadGalleryPhotos(true);
    }
  }, [selectedAlbum]);

  const loadAlbums = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      setHasPermission(false);
      return;
    }

    setHasPermission(true);

    // Load all albums
    const albumsList = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });

    // Sort albums by assetCount in descending order
    const sortedAlbums = albumsList.sort((a, b) => b.assetCount - a.assetCount);

    setAlbums(sortedAlbums);

    // Load thumbnails for each album
    const thumbnails = {};
    for (const album of sortedAlbums) {
      const assets = await MediaLibrary.getAssetsAsync({
        album: album.id,
        first: 1,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      if (assets.assets.length > 0) {
        thumbnails[album.id] = assets.assets[0].uri;
      }
    }
    setAlbumThumbnails(thumbnails);

    // Set default album to "Recent" or first album
    const recentAlbum = albumsList.find(album => album.title === 'Recent' || album.title === 'Recents');
    setSelectedAlbum(recentAlbum || albumsList[0]);
  };

  const loadGalleryPhotos = async (reset = false) => {
    if (!selectedAlbum) return;

    try {
      // Load photos from selected album
      const media = await MediaLibrary.getAssetsAsync({
        album: selectedAlbum.id,
        first: 100,
        after: reset ? undefined : endCursor,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      if (reset) {
        setGalleryPhotos(media.assets);
      } else {
        setGalleryPhotos([...galleryPhotos, ...media.assets]);
      }

      setEndCursor(media.endCursor);
      setHasMore(media.hasNextPage);
    } catch (error) {
      console.error('Error loading gallery photos:', error);
    }
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
        {/* Album Picker Header */}
        <TouchableOpacity
          onPress={() => setShowAlbumPicker(true)}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary
            }}>
              {selectedAlbum?.title || 'Recientes'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.text.primary}
            />
          </View>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary
          }}>
            {selectedAlbum?.assetCount || 0}
          </Text>
        </TouchableOpacity>

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
            onEndReached={() => {
              if (hasMore) {
                loadGalleryPhotos(false);
              }
            }}
            onEndReachedThreshold={0.5}
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

      {/* Album Picker Modal */}
      <Modal
        visible={showAlbumPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAlbumPicker(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <TouchableOpacity
              onPress={() => setShowAlbumPicker(false)}
              activeOpacity={0.6}
            >
              <Text style={{
                fontSize: 16,
                color: colors.text.primary
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.text.primary
            }}>
              Selecciona un álbum
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={{ flex: 1 }}>
            {/* Albums Section Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingTop: 20
            }}>
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.text.secondary
              }}>
                Albums
              </Text>
            </View>

            {/* Albums Grid */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: 16,
              gap: 12
            }}>
              {albums.map((album) => {
                const albumWidth = (width - 32 - 24) / 3; // 3 columns with gaps
                return (
                  <TouchableOpacity
                    key={album.id}
                    onPress={() => {
                      setSelectedAlbum(album);
                      setShowAlbumPicker(false);
                    }}
                    activeOpacity={0.7}
                    style={{
                      width: albumWidth,
                      marginBottom: 16
                    }}
                  >
                    <View style={{
                      width: albumWidth,
                      height: albumWidth,
                      borderRadius: 8,
                      backgroundColor: colors.bg.secondary,
                      overflow: 'hidden',
                      marginBottom: 8
                    }}>
                      {albumThumbnails[album.id] ? (
                        <Image
                          source={{ uri: albumThumbnails[album.id] }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Ionicons
                            name="images"
                            size={32}
                            color={colors.text.secondary}
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: 2
                      }}
                      numberOfLines={1}
                    >
                      {album.title}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.text.secondary
                    }}>
                      {album.assetCount}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
