import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui/text';
import { apiClient } from '../../../shared/config/api-client';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';

/**
 * Inner Conversation Content
 * Uses safe area insets to avoid iOS notch/status bar collisions
 */
function ConversationContent({
  onClose,
  targetParticipant, // { id, type: 'user' | 'business', name, avatar }
  initialConversationId = null,
  attachedProduct: initialAttachedProduct = null,
  onProductPress
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
  const [currentAttachedProduct, setCurrentAttachedProduct] = useState(initialAttachedProduct);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (initialAttachedProduct) {
      setCurrentAttachedProduct(initialAttachedProduct);
      if (!inputText) {
        setInputText('Hola, ¿este producto está disponible?');
      }
    }
  }, [initialAttachedProduct]);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!targetParticipant?.id || !currentSenderId) return;

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
  }, [targetParticipant?.id, currentSenderId]);

  // Poll for new messages every 3 seconds while modal is open
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      fetchMessages(conversationId, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

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
    if ((!trimmed && !currentAttachedProduct) || !conversationId || sending) return;

    const contentToSend = trimmed || (currentAttachedProduct ? `Hola, me interesa ${currentAttachedProduct.name}` : '');
    const mediaPayload = currentAttachedProduct
      ? JSON.stringify({
          type: 'product',
          id: currentAttachedProduct.id,
          name: currentAttachedProduct.name,
          price: currentAttachedProduct.price,
          imageUrl: currentAttachedProduct.imageUrl || currentAttachedProduct.thumbnailUrl,
          businessName: currentAttachedProduct.businessName || targetParticipant.name,
          businessLogo: currentAttachedProduct.businessLogo || targetParticipant.avatar
        })
      : null;

    setInputText('');
    const productBackup = currentAttachedProduct;
    setCurrentAttachedProduct(null);
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
      content: contentToSend,
      mediaUrl: mediaPayload,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
        senderId: currentSenderId,
        senderType: currentSenderType,
        receiverId: targetParticipant.id,
        receiverType: targetParticipant.type || 'user',
        content: contentToSend,
        mediaUrl: mediaPayload
      });

      if (res.data) {
        setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Revert on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setCurrentAttachedProduct(productBackup);
    } finally {
      setSending(false);
    }
  };

  const handleProductCardPress = (productInfo) => {
    if (onProductPress) {
      onProductPress(productInfo);
    } else if (productInfo?.id) {
      onClose?.();
      router.push(`/client/product/${productInfo.id}`);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const parseProductFromMedia = (mediaUrl) => {
    if (!mediaUrl || typeof mediaUrl !== 'string') return null;
    try {
      const parsed = JSON.parse(mediaUrl);
      if (parsed && (parsed.type === 'product' || parsed.id)) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  if (!targetParticipant) return null;

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0));
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: topPadding, paddingBottom: bottomPadding }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header with Safe Spacing */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          backgroundColor: '#ffffff'
        }}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
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
            marginRight: 12,
            borderWidth: 1.5,
            borderColor: '#ef4444'
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10b981' }} />
              <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600' }}>
                Activo
              </Text>
            </View>
          </View>
        </View>

        {/* Messages Area */}
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#ef4444" />
              <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Cargando conversación...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="chatbubbles-outline" size={32} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' }}>
                Inicia la conversación
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>
                Envía un mensaje a {targetParticipant.name} para consultar sobre sus productos o servicios.
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 14 }}
            >
              {messages.map((item) => {
                const isMine = item.senderId === currentSenderId;
                const attachedProductData = parseProductFromMedia(item.mediaUrl);

                return (
                  <View
                    key={item.id}
                    style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      alignItems: isMine ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {/* Tagged Product Card in Message (Rhode Style from Image 3) */}
                    {attachedProductData && (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleProductCardPress(attachedProductData)}
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: 18,
                          overflow: 'hidden',
                          marginBottom: 6,
                          width: 240,
                          borderWidth: 1,
                          borderColor: '#e2e8f0',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.06,
                          shadowRadius: 4,
                          elevation: 2
                        }}
                      >
                        {/* Product Card Top Business Header */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          gap: 8,
                          backgroundColor: '#f1f5f9'
                        }}>
                          <View style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: '#ef4444',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            {attachedProductData.businessLogo ? (
                              <Image source={{ uri: attachedProductData.businessLogo }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>
                                {(attachedProductData.businessName || 'N').charAt(0).toUpperCase()}
                              </Text>
                            )}
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', flex: 1 }} numberOfLines={1}>
                            {attachedProductData.businessName || targetParticipant.name}
                          </Text>
                        </View>

                        {/* Large Crisp Product Image */}
                        <View style={{ width: '100%', height: 160, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                          {attachedProductData.imageUrl ? (
                            <Image
                              source={{ uri: attachedProductData.imageUrl }}
                              style={{ width: '100%', height: '100%', borderRadius: 8 }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Ionicons name="bag-handle" size={48} color="#94a3b8" />
                          )}
                        </View>

                        {/* Product Title & Price Footer */}
                        <View style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                            {attachedProductData.name}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: '800', color: '#ef4444', marginTop: 2 }}>
                            ${Number(attachedProductData.price || 0).toFixed(2)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Text Message Bubble */}
                    {Boolean(item.content) && (
                      <View
                        style={{
                          backgroundColor: isMine ? '#ef4444' : '#ffffff',
                          borderRadius: 18,
                          borderBottomRightRadius: isMine ? 4 : 18,
                          borderBottomLeftRadius: isMine ? 18 : 4,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                          borderWidth: isMine ? 0 : 1,
                          borderColor: '#f1f5f9'
                        }}
                      >
                        <Text style={{ fontSize: 15, color: isMine ? '#ffffff' : '#0f172a', lineHeight: 20 }}>
                          {item.content}
                        </Text>
                        <Text style={{
                          fontSize: 10,
                          color: isMine ? 'rgba(255,255,255,0.75)' : '#94a3b8',
                          alignSelf: 'flex-end',
                          marginTop: 4
                        }}>
                          {formatTime(item.createdAt)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Attached Product Preview Bar before sending */}
        {currentAttachedProduct && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fef2f2',
            borderTopWidth: 1,
            borderTopColor: '#fee2e2',
            paddingHorizontal: 14,
            paddingVertical: 8,
            gap: 10
          }}>
            <View style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#fee2e2' }}>
              {currentAttachedProduct.imageUrl || currentAttachedProduct.thumbnailUrl ? (
                <Image
                  source={{ uri: currentAttachedProduct.imageUrl || currentAttachedProduct.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="pricetag" size={18} color="#ef4444" style={{ alignSelf: 'center', marginTop: 8 }} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#991b1b' }}>
                Producto enlazado a la consulta:
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                {currentAttachedProduct.name} • ${Number(currentAttachedProduct.price || 0).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setCurrentAttachedProduct(null)}
              style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="close" size={14} color="#991b1b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Compose Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          backgroundColor: '#ffffff',
          gap: 10
        }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Escribe un mensaje a ${targetParticipant.name}...`}
            placeholderTextColor="#94a3b8"
            style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 14,
              color: '#0f172a',
              maxHeight: 100
            }}
            multiline
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={(!inputText.trim() && !currentAttachedProduct) || sending}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: (inputText.trim() || currentAttachedProduct) ? '#ef4444' : '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="paper-plane"
                size={20}
                color={(inputText.trim() || currentAttachedProduct) ? '#ffffff' : '#94a3b8'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * ConversationModal Component
 * Full-screen real-time chat modal with safe area insets for iOS/Android
 * Supports attaching tagged products in messages (Rhode/Instagram style)
 */
export default function ConversationModal(props) {
  if (!props.visible) return null;

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={props.onClose}
    >
      <SafeAreaProvider>
        <ConversationContent {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}
