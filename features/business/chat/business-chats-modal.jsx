import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui/text';
import { apiClient } from '../../../shared/config/api-client';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import ConversationModal from '../../shared/chat/conversation-modal';

/**
 * BusinessChatsModal Component
 * Modal for Business Owners displaying active customer chats
 */
export default function BusinessChatsModal({ visible, onClose }) {
  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeChatModal, setActiveChatModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const fetchConversations = useCallback(async (showIndicator = true) => {
    if (!businessId) return;
    if (showIndicator) setLoading(true);

    try {
      const res = await apiClient.get('/chat/conversations', {
        params: {
          participantId: businessId,
          participantType: 'business'
        }
      });
      if (res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error fetching business conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!visible) return;
    fetchConversations(true);

    const interval = setInterval(() => {
      fetchConversations(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [visible, fetchConversations]);

  const handleOpenConversation = (conv) => {
    setSelectedParticipant(conv.otherParticipant);
    setSelectedConversationId(conv.id);
    setActiveChatModal(true);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
          backgroundColor: '#ffffff'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chatbubbles" size={22} color="#ef4444" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                Mensajes de Clientes
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Consultas y conversaciones con tus compradores
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchConversations(false);
              }}
              tintColor="#ef4444"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40 }}
        >
          {conversations.length === 0 ? (
            /* Empty State */
            <View style={{
              backgroundColor: '#f9fafb',
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 40,
              borderWidth: 1,
              borderColor: '#e5e7eb'
            }}>
              <View style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color="#ef4444" />
              </View>

              <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
                Sin mensajes de clientes
              </Text>

              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', leading: 20 }}>
                Cuando los clientes te envíen preguntas o mensajes desde tu perfil, aparecerán aquí para que puedas responderles.
              </Text>
            </View>
          ) : (
            /* Conversations List Cards */
            conversations.map((conv) => {
              const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conv;

              return (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => handleOpenConversation(conv)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    gap: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1
                  }}
                >
                  {/* Customer Avatar */}
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#ef4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {otherParticipant?.avatar ? (
                      <Image source={{ uri: otherParticipant.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>
                        {(otherParticipant?.name || 'C').charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 }} numberOfLines={1}>
                        {otherParticipant?.name || 'Cliente'}
                      </Text>
                      <Text style={{ fontSize: 11, color: unreadCount > 0 ? '#ef4444' : '#9ca3af', fontWeight: unreadCount > 0 ? '700' : '400' }}>
                        {formatTimestamp(lastMessageAt)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: unreadCount > 0 ? '#111827' : '#6b7280',
                          fontWeight: unreadCount > 0 ? '600' : '400',
                          flex: 1
                        }}
                        numberOfLines={1}
                      >
                        {lastMessage || 'Conversación iniciada'}
                      </Text>

                      {unreadCount > 0 && (
                        <View style={{
                          backgroundColor: '#ef4444',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          marginLeft: 8
                        }}>
                          <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                            {unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Active Chat Modal */}
        {selectedParticipant && (
          <ConversationModal
            visible={activeChatModal}
            onClose={() => {
              setActiveChatModal(false);
              fetchConversations(false);
            }}
            targetParticipant={selectedParticipant}
            initialConversationId={selectedConversationId}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
