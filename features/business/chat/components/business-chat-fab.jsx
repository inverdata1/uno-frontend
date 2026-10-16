import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../../../shared/config/api-client';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import BusinessChatsModal from '../business-chats-modal';

/**
 * BusinessChatFAB Component
 * Header button (shown on Pedidos) that opens the business' chats, with an
 * unread message badge counter
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
        activeOpacity={0.8}
        accessibilityLabel="Mensajes"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#fef2f2',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={21} color="#ef4444" />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -3,
            right: -5,
            backgroundColor: '#ef4444',
            paddingHorizontal: 5,
            paddingVertical: 1,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#ffffff',
            minWidth: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '800' }}>
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
