import React from 'react';
import { View, TouchableOpacity, Dimensions, FlatList, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Text } from '../../../../../../shared/components/ui';
import { colors } from '../../../../../../shared/utils/colors';

const { width } = Dimensions.get('window');

/**
 * Step 1: Media Selection
 * Native file explorer to select multiple files
 */
export function MediaSelectionStep({ selectedMedia, onMediaChange, onNext, allowedMediaTypes = ['image', 'video'] }) {
  
  const handlePickMedia = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedMediaTypes.map(t => `${t}/*`),
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Map assets to our format
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType?.startsWith('video/') || asset.name?.endsWith('.mp4') ? 'video' : 'image',
          mimeType: asset.mimeType,
          name: asset.name
        }));
        
        onMediaChange([...selectedMedia, ...newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'No se pudo abrir el explorador de archivos');
    }
  };

  const removeMedia = (indexToRemove) => {
    const updated = selectedMedia.filter((_, idx) => idx !== indexToRemove);
    onMediaChange(updated);
  };

  const handleNext = () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Selecciona media', 'Debes seleccionar al menos una foto o video');
      return;
    }
    onNext();
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
          {allowedMediaTypes.includes('video') && !allowedMediaTypes.includes('image') ? 'Nuevo Video' : 'Nuevo Post'}
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

      <View style={{ flex: 1, padding: 16, gap: 20 }}>
        <TouchableOpacity 
          onPress={handlePickMedia}
          style={{
            height: 150,
            backgroundColor: colors.bg.secondary,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border.light,
            borderStyle: 'dashed'
          }}
        >
          <Ionicons name="cloud-upload-outline" size={48} color={colors.text.secondary} />
          <Text style={{ fontSize: 16, color: colors.text.secondary, marginTop: 12 }}>
            Toca para seleccionar archivos
          </Text>
          <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 4 }}>
            Puedes seleccionar múltiples {allowedMediaTypes.includes('video') && !allowedMediaTypes.includes('image') ? 'videos' : 'imágenes'}
          </Text>
        </TouchableOpacity>

        {selectedMedia.length > 0 && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12 }}>
              Archivos seleccionados ({selectedMedia.length})
            </Text>
            
            <FlatList
              data={selectedMedia}
              numColumns={3}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={{
                  width: (width - 32 - 16) / 3, // 3 columns, 32 padding, 16 gap
                  height: (width - 32 - 16) / 3,
                  marginBottom: 8,
                  marginRight: (index % 3 !== 2) ? 8 : 0,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: colors.bg.secondary,
                  position: 'relative'
                }}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  
                  {item.type === 'video' && (
                    <View style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 4,
                      padding: 4
                    }}>
                      <Ionicons name="videocam" size={12} color="#fff" />
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => removeMedia(index)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
}
