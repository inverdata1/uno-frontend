import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui/text';
import { apiClient } from '../../../shared/config/api-client';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';

/**
 * ConversationModal Component
 * Full-screen real-time chat modal between Client <-> Business or Client <-> Client
 */
export default function ConversationModal({
  visible,
  onClose,
  targetParticipant, // { id, type: 'user' | 'business', name, avatar }
  initialConversationId = null
}) {
  const { user } = useAuthStore();
  const { currentUserType, currentContext } = useCurrentUserType();

  // Determine current sender credentials
  const currentSenderId = currentUserType === 'business' ? currentContext?.businessId : user?.id;
  const currentSenderType = currentUserType === 'business' ? 'business' : 'user';

  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollViewRef = useRef(null);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!visible || !targetParticipant?.id || !currentSenderId) return;

    let isMounted = true;
    setLoading(true);

    const initConversation = async () => {
      try {
        const res = await apiClient.post('/chat/conversations', {
          p1Id: currentSenderId,
          p1Type: currentSenderType,
          p2Id: targetParticipant.id,
          p2Type: targetParticipant.type || 'user'
        });

        if (isMounted && res.data?.id) {
          setConversationId(res.data.id);
          fetchMessages(res.data.id);
        }
      } catch (err) {
        console.error('Error initializing conversation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initConversation();

    return () => {
      isMounted = false;
    };
  }, [visible, targetParticipant?.id, currentSenderId]);

  // Poll for new messages every 3 seconds while modal is open
  useEffect(() => {
    if (!visible || !conversationId) return;

    const interval = setInterval(() => {
      fetchMessages(conversationId, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [visible, conversationId]);

  const fetchMessages = async (convId, showLoading = true) => {
    try {
      const res = await apiClient.get(`/chat/conversations/${convId}/messages`, {
        params: { currentParticipantId: currentSenderId }
      });
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !conversationId || sending) return;

    setInputText('');
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId,
      senderId: currentSenderId,
      senderType: currentSenderType,
      receiverId: targetParticipant.id,
      receiverType: targetParticipant.type || 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
        senderId: currentSenderId,
        senderType: currentSenderType,
        receiverId: targetParticipant.id,
        receiverType: targetParticipant.type || 'user',
        content: trimmed
      });

      if (res.data) {
        setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic msg on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!targetParticipant) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
            backgroundColor: '#ffffff'
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Target Participant Profile */}
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginRight: 12
            }}>
              {targetParticipant.avatar ? (
                <Image source={{ uri: targetParticipant.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                  {(targetParticipant.name || 'U').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                {targetParticipant.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600' }}>
                Activo
              </Text>
            </View>
          </View>

          {/* Messages Area */}
          <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Cargando conversación...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#ef4444" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' }}>
                  Inicia la conversación
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                  Envía un mensaje a {targetParticipant.name} para comenzar a chatear.
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 10 }}
              >
                {messages.map((item) => {
                  const isMine = item.senderId === currentSenderId;

                  return (
                    <View
                      key={item.id}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        backgroundColor: isMine ? '#ef4444' : '#ffffff',
                        borderRadius: 16,
                        borderBottomRightRadius: isMine ? 4 : 16,
                        borderBottomLeftRadius: isMine ? 16 : 4,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    >
                      <Text style={{ fontSize: 15, color: isMine ? '#ffffff' : '#111827', leading: 20 }}>
                        {item.content}
                      </Text>
                      <Text style={{
                        fontSize: 10,
                        color: isMine ? 'rgba(255,255,255,0.75)' : '#9ca3af',
                        alignSelf: 'flex-end',
                        marginTop: 4
                      }}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Input Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            backgroundColor: '#ffffff',
            gap: 10
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Escribe un mensaje a ${targetParticipant.name}...`}
              placeholderTextColor="#9ca3af"
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 15,
                color: '#111827',
                maxHeight: 100
              }}
              multiline
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.8}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: inputText.trim() ? '#ef4444' : '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="paper-plane" size={20} color={inputText.trim() ? '#ffffff' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
