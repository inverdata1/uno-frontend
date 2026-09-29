import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui/text';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    type: 'order',
    title: '¡Tu pedido está en camino! 🛵',
    message: 'El repartidor está en ruta con tu pedido de KFC La Castellana.',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    isRead: false,
    data: { orderId: 'ord-101', route: '/client/orders' }
  },
  {
    id: 'n-2',
    type: 'chat',
    title: 'Nuevo mensaje de Hamburguesas 212 💬',
    message: 'Hola, hemos recibido tus instrucciones especiales para la salsa.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    data: { route: '/client/chats' }
  },
  {
    id: 'n-3',
    type: 'order',
    title: 'Pedido confirmado ✅',
    message: 'Tu pago por $18.50 fue aprobado con éxito.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: true,
    data: { orderId: 'ord-100', route: '/client/orders' }
  },
  {
    id: 'n-4',
    type: 'promo',
    title: '¡20% de descuento hoy! 🏷️',
    message: 'Aprovecha ofertas exclusivas en combos familiares en tus tiendas favoritas.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isRead: true,
    data: { route: '/client' }
  }
];

const FILTER_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'order', label: 'Pedidos 📦' },
  { id: 'chat', label: 'Mensajes 💬' },
  { id: 'promo', label: 'Promos 🏷️' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (item) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.data?.route) {
      router.push(item.data.route);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return { name: 'bicycle', color: '#10b981', bg: '#ecfdf5' };
      case 'chat':
        return { name: 'chatbubble-ellipses', color: '#3b82f6', bg: '#eff6ff' };
      case 'promo':
        return { name: 'pricetag', color: '#ef4444', bg: '#fef2f2' };
      default:
        return { name: 'notifications', color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const renderItem = ({ item }) => {
    const iconConfig = getNotificationIcon(item.type);
    const timeAgo = getTimeAgo(item.timestamp);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: item.isRead ? '#ffffff' : '#fef2f2',
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          gap: 12
        }}
      >
        {/* Icon Circle */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconConfig.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2
        }}>
          <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: item.isRead ? '600' : '800', color: '#0f172a', flex: 1 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>
              {timeAgo}
            </Text>
          </View>

          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {/* Unread indicator dot */}
        {!item.isRead && (
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#ef4444',
            marginTop: 8
          }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      {/* Top App Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#f8fafc',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>
              Notificaciones
            </Text>
            {unreadCount > 0 && (
              <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>
                {unreadCount} sin leer
              </Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={{ paddingHorizontal: 10, paddingVertical: 5 }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>
              Leer todas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTER_TABS.map(tab => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isSelected ? '#ef4444' : '#f8fafc',
                  borderWidth: 1,
                  borderColor: isSelected ? '#ef4444' : '#e2e8f0'
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: isSelected ? '700' : '600',
                  color: isSelected ? '#ffffff' : '#475569'
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#ef4444" />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="notifications-off-outline" size={28} color="#94a3b8" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', textAlign: 'center', marginBottom: 6 }}>
              No tienes notificaciones
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>
              Aquí recibirás actualizaciones sobre el estado de tus pedidos, respuestas en chats y promociones.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffMins = Math.floor((now - time) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}
