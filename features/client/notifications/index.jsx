import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text } from '../../../shared/components/ui/text';
import { apiClient } from '../../../shared/config/api-client';
import { resolveMediaUrl } from '../../../shared/utils/media-url';
import { formatAmount, getAccountType } from '../../../shared/utils/payment-accounts';
import { getOrderStatus } from '../../../shared/utils/order-status';
import ConversationModal, { getCleanMessageContent } from '../../shared/chat/conversation-modal';
import {
  ImageCard,
  LocationCard,
  OrderCard,
  PaymentAccountCard,
  parseChatAttachment,
} from '../../shared/chat/chat-attachments';

const FILTER_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'order', label: 'Pedidos 📦' },
  { id: 'payment', label: 'Pagos 💳' },
  { id: 'chat', label: 'Mensajes 💬' },
];

const KIND_ICON = {
  order: { name: 'receipt', color: '#10b981', bg: '#ecfdf5' },
  payment: { name: 'wallet', color: '#8b5cf6', bg: '#f5f3ff' },
  chat: { name: 'chatbubble-ellipses', color: '#3b82f6', bg: '#eff6ff' },
};

/**
 * Turns a received chat message into what the notifications list shows.
 */
const toNotification = (message) => {
  const attachment = parseChatAttachment(message);
  const senderName = message.sender?.name || 'Negocio';
  let kind = 'chat';
  let title = `Nuevo mensaje de ${senderName}`;

  if (attachment?.type === 'order' || attachment?.type === 'order_status') {
    kind = 'order';
    title = attachment.type === 'order'
      ? `Pedido ${attachment.orderNumber} enviado`
      : `Pedido ${attachment.orderNumber}: ${getOrderStatus(attachment.status).label}`;
  } else if (attachment?.type === 'payment_account') {
    kind = 'payment';
    const amount = attachment.amount ? ` · ${formatAmount(attachment.amount, attachment.currency)}` : '';
    title = `${senderName} te envió datos de pago${amount}`;
  } else if (attachment?.type === 'image') {
    title = `${senderName} te envió una imagen`;
  } else if (attachment?.type === 'location') {
    title = `${senderName} compartió una ubicación`;
  }

  const preview =
    attachment?.type === 'payment_account'
      ? `${getAccountType(attachment.accountType).label} · toca para ver los datos`
      : getCleanMessageContent(message.content);

  return { ...message, attachment, kind, title, preview };
};

function NotificationDetail({ notification, onClose, onOpenChat }) {
  if (!notification) return null;
  const { sender, attachment } = notification;
  const avatar = resolveMediaUrl(sender?.avatar);
  const text = getCleanMessageContent(notification.content);
  const showText = text && (!attachment || attachment.type === 'order_status');

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>Notificación</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Sender */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>{(sender?.name || 'N').charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>{sender?.name || 'Negocio'}</Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                {new Date(notification.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{notification.title}</Text>

          {/* The message itself */}
          <View style={{ alignItems: 'flex-start', gap: 8 }}>
            {attachment?.type === 'payment_account' && <PaymentAccountCard account={attachment} />}
            {(attachment?.type === 'order' || attachment?.type === 'order_status') && (
              <OrderCard order={attachment} isStatusUpdate={attachment.type === 'order_status'} />
            )}
            {attachment?.type === 'image' && <ImageCard image={attachment} />}
            {attachment?.type === 'location' && <LocationCard location={attachment} />}
            {showText && (
              <View style={{ backgroundColor: '#f1f5f9', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' }}>
                <Text style={{ fontSize: 16, color: '#0f172a', lineHeight: 22 }}>{text}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <TouchableOpacity
            onPress={onOpenChat}
            activeOpacity={0.85}
            style={{ height: 50, borderRadius: 14, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#ffffff" />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#ffffff' }} numberOfLines={1}>
              Ir al chat con {sender?.name || 'el negocio'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [chatWith, setChatWith] = useState(null);

  const { data = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/chat/notifications').then((res) => res.data),
    staleTime: 0,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id) => apiClient.patch(`/chat/notifications/${id}/read`),
    onMutate: (id) => {
      queryClient.setQueryData(['notifications'], (old = []) => old.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    },
  });

  const notifications = useMemo(() => data.map(toNotification), [data]);
  const filtered = notifications.filter((n) => activeFilter === 'all' || n.kind === activeFilter);
  const unread = notifications.filter((n) => !n.isRead);

  const openNotification = (item) => {
    setSelected(item);
    if (!item.isRead) markRead.mutate(item.id);
  };

  const markAllRead = () => unread.forEach((n) => markRead.mutate(n.id));

  const openChat = () => {
    const sender = selected?.sender;
    setSelected(null);
    if (sender?.id) {
      setChatWith({ id: sender.id, type: sender.type || 'business', name: sender.name, avatar: resolveMediaUrl(sender.avatar) });
    }
  };

  const renderItem = ({ item }) => {
    const icon = KIND_ICON[item.kind];
    const avatar = resolveMediaUrl(item.sender?.avatar);

    return (
      <TouchableOpacity
        onPress={() => openNotification(item)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14,
          backgroundColor: item.isRead ? '#ffffff' : '#fef2f2', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        }}
      >
        <View style={{ width: 46, height: 46 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#475569' }}>{(item.sender?.name || 'N').charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={{
            position: 'absolute', right: -3, bottom: -3, width: 22, height: 22, borderRadius: 11,
            backgroundColor: icon.bg, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={icon.name} size={11} color={icon.color} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: item.isRead ? '600' : '800', color: '#0f172a', flex: 1 }} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          {!!item.preview && (
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }} numberOfLines={2}>{item.preview}</Text>
          )}
        </View>

        {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginTop: 8 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Notificaciones</Text>
            {unread.length > 0 && (
              <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>{unread.length} sin leer</Text>
            )}
          </View>
        </View>
        {unread.length > 0 && (
          <TouchableOpacity onPress={markAllRead} style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>Leer todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: isSelected ? '#ef4444' : '#f8fafc', borderWidth: 1, borderColor: isSelected ? '#ef4444' : '#e2e8f0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#ffffff' : '#475569' }}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#ef4444" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="notifications-off-outline" size={28} color="#94a3b8" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', textAlign: 'center', marginBottom: 6 }}>No tienes notificaciones</Text>
              <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>
                Aquí verás los mensajes de los negocios, el estado de tus pedidos y los datos de pago que te envíen.
              </Text>
            </View>
          }
        />
      )}

      <NotificationDetail notification={selected} onClose={() => setSelected(null)} onOpenChat={openChat} />

      {chatWith && (
        <ConversationModal
          visible={!!chatWith}
          onClose={() => {
            setChatWith(null);
            refetch();
          }}
          targetParticipant={chatWith}
        />
      )}
    </SafeAreaView>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diffMins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}
