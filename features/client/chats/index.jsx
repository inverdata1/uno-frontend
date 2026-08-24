import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui/text';
import { apiClient } from '../../../shared/config/api-client';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import ConversationModal from '../../shared/chat/conversation-modal';

/**
 * ClientChatsScreen Component
 * WhatsApp-style list of active client conversations (with Businesses and other Clients)
 */
export default function ClientChatsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeChatModal, setActiveChatModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const fetchConversations = useCallback(async (showIndicator = true) => {
    if (!user?.id) return;
    if (showIndicator) setLoading(true);

    try {
      const res = await apiClient.get('/chat/conversations', {
        params: {
          participantId: user.id,
          participantType: 'user'
        }
      });
      if (res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error fetching client conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['top']}>
      {/* Top Header */}
      <View style={{
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
            Chats
          </Text>
          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            Tus conversaciones con negocios y otros usuarios
          </Text>
        </View>
      </View>

      {/* Conversations List */}
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
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="chatbubbles-outline" size={40} color="#ef4444" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
              Aún no tienes conversaciones
            </Text>

            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', leading: 20, marginBottom: 24 }}>
              Visita el perfil de un negocio o presiona en los comentarios para chatear con otros usuarios.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/client')}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#ef4444',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Ionicons name="compass-outline" size={18} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                Explorar Negocios
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Conversations List Cards (WhatsApp Style) */
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
                {/* Avatar */}
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {otherParticipant?.avatar ? (
                    <Image source={{ uri: otherParticipant.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700' }}>
                      {(otherParticipant?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 }} numberOfLines={1}>
                      {otherParticipant?.name || 'Usuario'}
                    </Text>
                    <Text style={{ fontSize: 12, color: unreadCount > 0 ? '#ef4444' : '#9ca3af', fontWeight: unreadCount > 0 ? '700' : '400' }}>
                      {formatTimestamp(lastMessageAt)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: unreadCount > 0 ? '#111827' : '#6b7280',
                        fontWeight: unreadCount > 0 ? '600' : '400',
                        flex: 1
                      }}
                      numberOfLines={1}
                    >
                      {lastMessage || 'Inicia la conversación...'}
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

      {/* Active Conversation Chat Modal */}
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
  );
}
