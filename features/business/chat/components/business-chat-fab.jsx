import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../../../shared/config/api-client';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import BusinessChatsModal from '../business-chats-modal';

/**
 * BusinessChatFAB Component
 * Floating Action Button for Business Owners with unread message badge counter
 */
export default function BusinessChatFAB() {
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUnreadCount = async () => {
    if (!businessId) return;
    try {
      const res = await apiClient.get('/chat/unread-count', {
        params: { participantId: businessId }
      });
      if (res.data && typeof res.data.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching business unread chat count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [businessId]);

  if (!businessId) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: '#ef4444',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          shadowColor: '#ef4444',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#ffffff" />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#111827',
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#ffffff',
            minWidth: 22,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Business Conversations Modal */}
      <BusinessChatsModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          fetchUnreadCount();
        }}
      />
    </>
  );
}
