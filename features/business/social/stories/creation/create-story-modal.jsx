import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal, ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../../../shared/components/ui';
import { useCreateStoryWithMedia } from '../../../../../shared/hooks/use-create-story-with-media';
import { colors } from '../../../../../shared/utils/colors';

const { width } = Dimensions.get('window');

export const CreateStoryModal = ({ visible, onClose }) => {
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const [albumThumbnails, setAlbumThumbnails] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const createStoryMutation = useCreateStoryWithMedia();

  useEffect(() => {
    if (visible) {
      loadAlbums();
    }
  }, [visible]);

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
    const recentAlbum = sortedAlbums.find(album => album.title === 'Recent' || album.title === 'Recents');
    setSelectedAlbum(recentAlbum || sortedAlbums[0]);
  };

  const loadGalleryPhotos = async (reset = false) => {
    if (!selectedAlbum) return;

    try {
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

  const handlePublish = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Selecciona una imagen o video');
      return;
    }

    setIsUploading(true);

    try {
      const mediaType = selectedMedia.mediaType === 'video' ? 'video' : 'image';
      const duration = mediaType === 'video' ? Math.ceil(selectedMedia.duration) : 5;

      await createStoryMutation.mutateAsync({
        type: mediaType,
        mediaFile: selectedMedia.uri,
        caption: caption.trim(),
        duration
      });

      // Reset and close
      setSelectedMedia(null);
      setCaption('');
      setIsUploading(false);
      onClose();
      Alert.alert('¡Listo!', 'Tu historia se ha publicado');
    } catch (error) {
      console.error('Error creating story:', error);
      setIsUploading(false);

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
      setCaption('');
      onClose();
    }
  };

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
            disabled={!selectedMedia || isUploading}
            activeOpacity={0.6}
          >
            {isUploading ? (
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

        <View style={{ flex: 1 }}>
          {/* Preview Section - Top Half (9:16 aspect ratio) */}
          <View style={{
            height: width * (16 / 9),
            maxHeight: '50%',
            backgroundColor: colors.bg.secondary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
            position: 'relative'
          }}>
            {selectedMedia ? (
              <>
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
                {/* Caption Input Overlay */}
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 16,
                  backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                  <TextInput
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Añadir texto..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    multiline
                    maxLength={200}
                    style={{
                      fontSize: 16,
                      color: '#fff',
                      minHeight: 40,
                      maxHeight: 100,
                      textAlignVertical: 'top'
                    }}
                  />
                </View>
              </>
            ) : (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12
              }}>
                <Ionicons name="image-outline" size={64} color={colors.text.secondary} />
                <Text style={{
                  fontSize: 16,
                  color: colors.text.secondary
                }}>
                  Selecciona una foto o video
                </Text>
              </View>
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
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  textAlign: 'center'
                }}>
                  Permiso necesario
                </Text>
                <Text style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: colors.text.secondary,
                  textAlign: 'center'
                }}>
                  Necesitamos acceso a tus fotos para crear historias
                </Text>
              </View>
            ) : (
              <FlatList
                data={galleryPhotos}
                numColumns={4}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                  if (hasMore) {
                    loadGalleryPhotos(false);
                  }
                }}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => {
                  const isSelected = selectedMedia?.id === item.id;
                  const itemWidth = width / 4;

                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedMedia(item)}
                      activeOpacity={0.9}
                      style={{
                        width: itemWidth,
                        height: itemWidth,
                        padding: 1
                      }}
                    >
                      <View style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: colors.bg.secondary,
                        position: 'relative'
                      }}>
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
                            paddingHorizontal: 4,
                            paddingVertical: 2
                          }}>
                            <Ionicons name="videocam" size={12} color="#fff" />
                          </View>
                        )}

                        {/* Selection overlay */}
                        {isSelected && (
                          <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            borderWidth: 2,
                            borderColor: colors.primary[500]
                          }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
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
                Select album
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
                  const albumWidth = (width - 32 - 24) / 3;
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
      </SafeAreaView>
    </Modal>
  );
};
