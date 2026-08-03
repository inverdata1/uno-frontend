import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// expo-image (not react-native's Image) because it ships a Photo Library
// loader that resolves iOS `ph://` asset URLs, including the poster frame of
// videos. react-native's Image renders those as blank.
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

const { width } = Dimensions.get('window');

// iOS returns localUri for videos with a `#<base64 plist>` fragment appended
// (playback hints). Anything treating the value as a file path — extension
// parsing, VideoThumbnails, the upload filename — breaks on it, so drop it.
const stripUriFragment = (uri) => uri.split('#')[0].split('?')[0];
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 2;
// Calculate item width exactly like typical grid
const ITEM_WIDTH = (width - (ITEM_MARGIN * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

/**
 * Step 1: Media Selection
 * Native gallery view with file explorer fallback
 */
export function MediaSelectionStep({ selectedMedia, onMediaChange, onNext, onClose, allowedMediaTypes = ['image', 'video'] }) {
  const [galleryAssets, setGalleryAssets] = useState([]);
  // Asset currently being resolved to a local file (see toggleGallerySelection)
  const [resolvingId, setResolvingId] = useState(null);
  useEffect(() => {
    const initGallery = async () => {
      try {
        let status = await MediaLibrary.getPermissionsAsync(false, ['photo', 'video']);
        if (!status.granted && status.canAskAgain) {
          status = await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
        }
        if (status.granted) {
          loadGalleryAssets();
        }
      } catch (e) {
        // Silently ignore permission errors (common in Expo Go on Android 13+)
        // The user will still be able to use the File Explorer fallback
        console.log('Gallery permission not fully supported in this environment, falling back to explorer.', e.message);
      }
    };
    initGallery();
  }, []);

  const loadGalleryAssets = async () => {
    try {
      let mediaType = [];
      if (allowedMediaTypes.includes('image')) mediaType.push(MediaLibrary.MediaType.photo);
      if (allowedMediaTypes.includes('video')) mediaType.push(MediaLibrary.MediaType.video);
      
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType,
        first: 60,
      });
      setGalleryAssets(assets);
    } catch (error) {
      console.error('Error loading gallery assets:', error);
    }
  };

  const handlePickExplorer = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedMediaTypes.map(t => `${t}/*`),
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map((asset, index) => ({
          id: `explorer-${Date.now()}-${index}`, // Unique ID for file explorer items
          uri: asset.uri,
          type: asset.mimeType?.startsWith('video/') || asset.name?.endsWith('.mp4') ? 'video' : 'image',
          mimeType: asset.mimeType,
          name: asset.name,
          fromGallery: false
        }));
        onMediaChange([...selectedMedia, ...newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'No se pudo abrir el explorador de archivos');
    }
  };

  const toggleGallerySelection = async (asset) => {
    const isSelected = selectedMedia.findIndex(m => m.id === asset.id);
    if (isSelected >= 0) {
      const updated = selectedMedia.filter((_, idx) => idx !== isSelected);
      onMediaChange(updated);
      return;
    }

    if (resolvingId) return; // a resolution is already in flight

    // On iOS getAssetsAsync hands back a `ph://` identifier, which is a handle
    // into the Photos framework rather than a file on disk. fetch(), FormData
    // uploads and VideoThumbnails all fail on it — that's what left publishing
    // stuck on "Publicando...". Resolve it to a real file:// path once, here,
    // so every later step gets something it can actually read.
    setResolvingId(asset.id);
    let uri = asset.uri;
    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset);
      if (info?.localUri) uri = stripUriFragment(info.localUri);
    } catch (error) {
      console.warn('Could not resolve a local file for the asset, using the raw uri', error);
    } finally {
      setResolvingId(null);
    }

    const newAsset = {
      id: asset.id,
      uri,
      // Keep the original handle for display: expo-image renders it directly
      // (video posters included) without needing a generated thumbnail
      previewUri: asset.uri,
      type: asset.mediaType === 'video' ? 'video' : 'image',
      mimeType: asset.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
      name: asset.filename,
      fromGallery: true
    };
    onMediaChange([...selectedMedia, newAsset]);
  };

  const handleNext = () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Selecciona media', 'Debes seleccionar al menos una foto o video');
      return;
    }
    onNext();
  };

  const renderHeader = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.bg.primary
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginLeft: 16 }}>
          Nueva publicación
        </Text>
      </View>
      <TouchableOpacity onPress={handleNext} disabled={selectedMedia.length === 0}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: selectedMedia.length === 0 ? colors.text.secondary : colors.primary[500]
        }}>
          Siguiente
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => {
    // First item is always the File Explorer button
    if (index === 0) {
      return (
        <TouchableOpacity
          onPress={handlePickExplorer}
          style={{
            width: ITEM_WIDTH,
            height: ITEM_WIDTH,
            marginRight: (index % COLUMN_COUNT === COLUMN_COUNT - 1) ? 0 : ITEM_MARGIN,
            marginBottom: ITEM_MARGIN,
            backgroundColor: colors.bg.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border.light,
            borderStyle: 'dashed'
          }}
        >
          <Ionicons name="camera-outline" size={32} color={colors.text.secondary} />
          <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 4 }}>
            Abrir explorador de archivos
          </Text>
        </TouchableOpacity>
      );
    }

    // Actual gallery asset
    const asset = item;
    const selectedIndex = selectedMedia.findIndex(m => m.id === asset.id);
    const isSelected = selectedIndex >= 0;

    return (
      <TouchableOpacity
        onPress={() => toggleGallerySelection(asset)}
        activeOpacity={0.8}
        style={{
          width: ITEM_WIDTH,
          height: ITEM_WIDTH,
          marginRight: (index % COLUMN_COUNT === COLUMN_COUNT - 1) ? 0 : ITEM_MARGIN,
          marginBottom: ITEM_MARGIN,
          position: 'relative',
          backgroundColor: colors.bg.secondary
        }}
      >
        <Image
          source={{ uri: asset.uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        {resolvingId === asset.id && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.6)'
          }}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        )}
        {asset.mediaType === 'video' && (
          <View style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 4,
            paddingHorizontal: 4,
            paddingVertical: 2
          }}>
            <Ionicons name="videocam" size={12} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 10, marginLeft: 4 }}>
              {Math.floor(asset.duration / 60)}:{(Math.floor(asset.duration % 60)).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {isSelected && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderWidth: 2,
            borderColor: colors.primary[500],
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            padding: 6
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary[500],
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                {selectedIndex + 1}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Extraer las imágenes seleccionadas desde el explorador para mostrarlas en la cuadrícula
  const explorerSelected = selectedMedia.filter(m => m.fromGallery === false);
  const data = [{ id: 'explorer' }, ...explorerSelected, ...galleryAssets];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {renderHeader()}
      
      {/* Dropdown Header placeholder like in FB Lite (Galería v) */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary, marginRight: 4 }}>Galería</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text.primary} />
        </TouchableOpacity>
        {selectedMedia.length > 0 && (
          <View style={{ backgroundColor: colors.bg.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>
              Seleccionados ({selectedMedia.length})
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={data}
          numColumns={COLUMN_COUNT}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}
