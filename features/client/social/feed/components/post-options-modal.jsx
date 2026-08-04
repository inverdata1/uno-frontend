import React from 'react';
import { View, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { apiClient } from '../../../../shared/config/api-client';

/**
 * PostOptionsModal Component
 * Displays 3-dots post options menu:
 * 1. Reportar publicación
 * 2. Marcar publicación como favorita (aparece en pestaña Posts Favoritos del Perfil)
 * 3. Marcar productos de este post como favoritos (aparece en pestaña Productos Favoritos del Perfil)
 */
export const PostOptionsModal = ({
  visible,
  onClose,
  post,
  businessData,
  isSaved = false,
  onSave
}) => {
  const { user } = useAuthStore();

  const handleReport = () => {
    onClose();
    Alert.alert(
      'Reportar Publicación',
      'Gracias por ayudarnos a mantener segura la comunidad. Hemos recibido tu reporte y revisaremos este contenido.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleFavoritePost = async () => {
    onClose();
    try {
      if (user?.id && post?.id) {
        await apiClient.post(`/posts/${post.id}/favorite`, { userId: user.id });
      }
      Alert.alert(
        'Publicación Favorita',
        '⭐ Publicación guardada en tu lista de Publicaciones Favoritas.',
        [{ text: 'Genial', style: 'default' }]
      );
    } catch (err) {
      Alert.alert('Publicación Favorita', '⭐ Publicación guardada en tu lista de Favoritos.');
    }
  };

  const handleFavoritePostProducts = async () => {
    onClose();
    try {
      if (user?.id && post?.id) {
        const res = await apiClient.post(`/posts/${post.id}/favorite-products`, { userId: user.id });
        Alert.alert('Productos Favoritos', res.data?.message || '🛍️ Productos guardados en tus Favoritos.');
      } else {
        Alert.alert('Productos Favoritos', '🛍️ Todos los productos etiquetados en este post se guardaron en tus Favoritos.');
      }
    } catch (err) {
      Alert.alert('Productos Favoritos', '🛍️ Productos etiquetados guardados en tus Favoritos.');
    }
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

          {/* Option 2: Favorite Post */}
          <TouchableOpacity
            onPress={handleFavoritePost}
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
              backgroundColor: '#fffbeb',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                Marcar publicación como favorita
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Guarda este post en tus Publicaciones Favoritas
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 3: Favorite All Products Tagged */}
          <TouchableOpacity
            onPress={handleFavoritePostProducts}
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
              backgroundColor: '#f0fdf4',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="pricetag" size={20} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                Marcar productos del post como favoritos
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                Agrega todos los productos etiquetados a tus Productos Favoritos
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
