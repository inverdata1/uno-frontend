import React from 'react';
import { View, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';

/**
 * PostOptionsModal Component
 * Displays 3-dots post options menu (Report, Save, Favorite)
 */
export const PostOptionsModal = ({
  visible,
  onClose,
  post,
  businessData,
  isSaved = false,
  onSave
}) => {
  const handleReport = () => {
    onClose();
    Alert.alert(
      'Reportar Publicación',
      'Gracias por ayudarnos a mantener segura la comunidad. Hemos recibido tu reporte y revisaremos este contenido.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleToggleSave = () => {
    onClose();
    onSave?.();
    Alert.alert(
      isSaved ? 'Eliminado' : 'Guardado',
      isSaved ? 'Publicación eliminada de tus elementos guardados.' : 'Publicación guardada con éxito en tus marcadores.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleFavoriteBusiness = () => {
    onClose();
    Alert.alert(
      'Negocio Favorito',
      `¡${businessData?.name || 'Este negocio'} ha sido marcado como uno de tus favoritos!`,
      [{ text: 'Genial', style: 'default' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32
        }}>
          {/* Grab Handle */}
          <View style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#e5e7eb',
            alignSelf: 'center',
            marginBottom: 16
          }} />

          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
            Opciones de la publicación
          </Text>

          {/* Option 1: Report */}
          <TouchableOpacity
            onPress={handleReport}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
              gap: 14
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#fef2f2',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="flag-outline" size={20} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>
                Reportar publicación
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Notificar contenido inapropiado o engañoso
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Save */}
          <TouchableOpacity
            onPress={handleToggleSave}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
              gap: 14
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color="#111827" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                {isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Guarda esta publicación para verla después
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 3: Favorite Business */}
          <TouchableOpacity
            onPress={handleFavoriteBusiness}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              gap: 14
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#fffbeb',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                Marcar negocio como favorito
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Recibe novedades y publicaciones de {businessData?.name || 'este negocio'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
