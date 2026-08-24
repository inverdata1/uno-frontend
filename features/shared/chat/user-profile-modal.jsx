import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui/text';
import ConversationModal from './conversation-modal';
import { useAuthStore } from '../../../core/auth/stores/auth-store';

/**
 * UserProfileModal Component
 * Displays a user profile modal when clicking on a user (e.g. from comments)
 * includes a "Mensaje" button to chat client-to-client.
 */
export default function UserProfileModal({
  visible,
  onClose,
  targetUser // { id, name, avatar, email }
}) {
  const { user } = useAuthStore();
  const [chatModalVisible, setChatModalVisible] = useState(false);

  if (!targetUser) return null;

  const isSelf = user?.id === targetUser.id;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 36,
          alignItems: 'center'
        }}>
          {/* Grab Handle */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', marginBottom: 20 }} />

          {/* User Avatar */}
          <View style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 14,
            borderWidth: 3,
            borderColor: '#fef2f2'
          }}>
            {targetUser.avatar ? (
              <Image source={{ uri: targetUser.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '700' }}>
                {(targetUser.name || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* User Name */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            {targetUser.name || 'Usuario'}
          </Text>

          <View style={{
            backgroundColor: '#f3f4f6',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 24
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280' }}>
              Cliente en Uno Delivery
            </Text>
          </View>

          {/* Actions */}
          {!isSelf && (
            <TouchableOpacity
              onPress={() => setChatModalVisible(true)}
              activeOpacity={0.85}
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3
              }}
            >
              <Ionicons name="chatbubbles" size={20} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                Enviar Mensaje
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 12, paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation Modal */}
      <ConversationModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        targetParticipant={{
          id: targetUser.id,
          type: 'user',
          name: targetUser.name || 'Usuario',
          avatar: targetUser.avatar || null,
        }}
      />
    </Modal>
  );
}
