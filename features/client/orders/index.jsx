import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui';
import { useMyOrders, useUpdateOrderStatus } from '../../../shared/hooks/use-orders';
import {
  ACTIVE_STATUSES,
  formatMoney,
  formatOrderDate,
  getOrderStatus,
  getOrderSteps,
  getPaymentMethodLabel,
} from '../../../shared/utils/order-status';
import ConversationModal from '../../shared/chat/conversation-modal';

function OrderProgress({ order }) {
  const steps = getOrderSteps(order.deliveryMethod);
  const current = steps.indexOf(order.status);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
      {steps.map((step, index) => {
        const done = index <= current;
        const isLast = index === steps.length - 1;
        return (
          <React.Fragment key={step}>
            <View style={{
              width: index === current ? 14 : 10, height: index === current ? 14 : 10, borderRadius: 7,
              backgroundColor: done ? '#ef4444' : '#e5e7eb',
              borderWidth: index === current ? 3 : 0, borderColor: '#fecaca',
            }} />
            {!isLast && <View style={{ flex: 1, height: 3, backgroundColor: index < current ? '#ef4444' : '#e5e7eb' }} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ClientOrderCard({ order, onChat, onCancel, onShareLocation, busy }) {
  const status = getOrderStatus(order.status);
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const needsLocation = isActive && order.deliveryMethod === 'delivery' && order.deliveryAddress?.latitude == null;
  const itemsText = order.items.map((i) => `${i.quantity}x ${i.product?.name || 'Producto'}`).join(', ');

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 18, padding: 14, gap: 12,
      shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {order.business?.logoUrl ? (
          <Image source={{ uri: order.business.logoUrl }} style={{ width: 42, height: 42, borderRadius: 21 }} />
        ) : (
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="storefront" size={20} color="#ef4444" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
            {order.business?.businessName || 'Negocio'}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>{order.orderNumber} · {formatOrderDate(order.createdAt)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: status.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
          <Ionicons name={status.icon} size={13} color={status.color} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: status.color }}>{status.label}</Text>
        </View>
      </View>

      {isActive && <OrderProgress order={order} />}

      <Text style={{ fontSize: 13, color: '#374151' }} numberOfLines={2}>{itemsText}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          {order.deliveryMethod === 'pickup' ? 'Retiro en tienda' : 'Delivery'} · {getPaymentMethodLabel(order.paymentMethod)}
          {order.paymentStatus === 'paid' ? ' · Pagado' : ''}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>{formatMoney(order.totalAmount)}</Text>
      </View>

      {!!order.cancelReason && (
        <Text style={{ fontSize: 12, color: '#6b7280' }}>Motivo: {order.cancelReason}</Text>
      )}

      {needsLocation && (
        <TouchableOpacity
          onPress={onShareLocation}
          activeOpacity={0.85}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 12, padding: 10 }}
        >
          <Ionicons name="location" size={18} color="#ef4444" />
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#991b1b' }}>
            Falta tu ubicación de entrega. Compártela en el chat.
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#991b1b" />
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {order.status === 'pending' && (
          <TouchableOpacity
            onPress={onCancel}
            disabled={busy}
            style={{ flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}
          >
            {busy ? <ActivityIndicator size="small" color="#6b7280" /> : (
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280' }}>Cancelar</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onChat}
          activeOpacity={0.85}
          style={{ flex: 2, height: 42, borderRadius: 12, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Ionicons name="chatbubble-ellipses" size={17} color="#ffffff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Chatear con el negocio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Orders Screen - Client follows their orders and talks to each business
 */
export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders = [], isLoading, isRefetching, refetch } = useMyOrders();
  const updateStatus = useUpdateOrderStatus();
  const [chat, setChat] = useState(null); // { participant, pendingLocationOrder }
  const [busyOrderId, setBusyOrderId] = useState(null);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const openChat = (order, askLocation = false) => {
    setChat({
      participant: {
        id: order.businessId,
        type: 'business',
        name: order.business?.businessName || 'Negocio',
        avatar: order.business?.logoUrl,
      },
      pendingLocationOrder: askLocation ? { id: order.id, orderNumber: order.orderNumber } : null,
    });
  };

  const cancelOrder = (order) => {
    Alert.alert('Cancelar pedido', `¿Seguro que quieres cancelar el pedido ${order.orderNumber}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          setBusyOrderId(order.id);
          try {
            await updateStatus.mutateAsync({ orderId: order.id, status: 'cancelled' });
          } catch (error) {
            const message = error?.response?.data?.message;
            Alert.alert('No se pudo cancelar', typeof message === 'string' ? message : 'Intenta de nuevo.');
          } finally {
            setBusyOrderId(null);
          }
        },
      },
    ]);
  };

  const renderOrder = (order) => (
    <ClientOrderCard
      key={order.id}
      order={order}
      busy={busyOrderId === order.id}
      onChat={() => openChat(order)}
      onCancel={() => cancelOrder(order)}
      onShareLocation={() => openChat(order, true)}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['top']}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>Mis Pedidos</Text>
      </View>

      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#ef4444" />}
        >
          {orders.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="bag-handle-outline" size={32} color="#9ca3af" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 }}>No tienes pedidos aún</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
                Cuando hagas tu primer pedido podrás seguirlo aquí.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/client')}
                style={{ backgroundColor: '#ef4444', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Explorar negocios</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {activeOrders.length > 0 && (
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  En curso
                </Text>
              )}
              {activeOrders.map(renderOrder)}

              {pastOrders.length > 0 && (
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: activeOrders.length ? 8 : 0 }}>
                  Anteriores
                </Text>
              )}
              {pastOrders.map(renderOrder)}
            </>
          )}
        </ScrollView>
      )}

      {chat && (
        <ConversationModal
          visible={!!chat}
          onClose={() => {
            setChat(null);
            refetch();
          }}
          targetParticipant={chat.participant}
          pendingLocationOrder={chat.pendingLocationOrder}
        />
      )}
    </SafeAreaView>
  );
}
