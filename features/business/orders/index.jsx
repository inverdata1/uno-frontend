import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useBusinessOrders, useUpdateOrderPayment, useUpdateOrderStatus } from '../../../shared/hooks/use-orders';
import {
  ACTIVE_STATUSES,
  CANCELLED_STATUSES,
  FINISHED_STATUSES,
  canBusinessCancel,
  formatMoney,
  formatOrderDate,
  getClientName,
  getMapsUrl,
  getNextBusinessAction,
  getOrderStatus,
  getPaymentMethodLabel,
} from '../../../shared/utils/order-status';
import BusinessChatFAB from '../chat/components/business-chat-fab';
import ConversationModal from '../../shared/chat/conversation-modal';
import { CommissionsPanel } from './commissions-panel';

const TABS = [
  { id: 'in_progress', label: 'En proceso', statuses: ACTIVE_STATUSES },
  { id: 'completed', label: 'Completados', statuses: FINISHED_STATUSES },
  { id: 'cancelled', label: 'Cancelados', statuses: CANCELLED_STATUSES },
];

const EMPTY_TEXT = {
  in_progress: 'Cuando un cliente haga un pedido aparecerá aquí para que lo aceptes.',
  completed: 'Aquí verás los pedidos que ya entregaste.',
  cancelled: 'Aquí verás los pedidos rechazados o cancelados.',
};

function StatusBadge({ status }) {
  const s = getOrderStatus(status);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: s.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
      <Ionicons name={s.icon} size={13} color={s.color} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: s.color }}>{s.label}</Text>
    </View>
  );
}

function OrderItemCard({ order, onAdvance, onReject, onCancel, onTogglePaid, onChat, busy }) {
  const nextAction = getNextBusinessAction(order);
  const location = order.deliveryAddress?.latitude != null ? order.deliveryAddress : null;
  const isPaid = order.paymentStatus === 'paid';
  const isOpen = ACTIVE_STATUSES.includes(order.status);

  return (
    <View style={{
      backgroundColor: colors.bg.primary, borderRadius: 16, padding: 14, gap: 12,
      shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {order.client?.avatarUrl ? (
          <Image source={{ uri: order.client.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary[600], fontWeight: '800' }}>{getClientName(order.client).charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }} numberOfLines={1}>{getClientName(order.client)}</Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>{order.orderNumber} · {formatOrderDate(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Items */}
      <View style={{ backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 10, gap: 4 }}>
        {order.items.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 13, color: colors.text.primary }} numberOfLines={1}>
              {item.quantity}x {item.product?.name || 'Producto'}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary }}>{formatMoney(item.totalPrice)}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: colors.border.light, marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary[500] }}>{formatMoney(order.totalAmount)}</Text>
        </View>
      </View>

      {/* Delivery + payment */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name={order.deliveryMethod === 'pickup' ? 'walk-outline' : 'bicycle-outline'} size={16} color={colors.text.secondary} />
          <Text style={{ flex: 1, fontSize: 13, color: colors.text.primary }} numberOfLines={2}>
            {order.deliveryMethod === 'pickup'
              ? 'Retira en tienda'
              : location
                ? location.address || 'Ubicación compartida'
                : 'Delivery · esperando ubicación del cliente'}
          </Text>
          {location && (
            <TouchableOpacity
              onPress={() => Linking.openURL(getMapsUrl(location)).catch(() => {})}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primary[50] }}
            >
              <Ionicons name="map-outline" size={14} color={colors.primary[500]} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary[500] }}>Mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="wallet-outline" size={16} color={colors.text.secondary} />
          <Text style={{ flex: 1, fontSize: 13, color: colors.text.primary }}>
            {getPaymentMethodLabel(order.paymentMethod)} ·{' '}
            <Text style={{ fontSize: 13, fontWeight: '700', color: isPaid ? '#10b981' : '#f59e0b' }}>
              {isPaid ? 'Pagado' : 'Pago pendiente'}
            </Text>
          </Text>
          {isOpen && (
            <TouchableOpacity
              onPress={onTogglePaid}
              disabled={busy}
              style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: isPaid ? colors.border.light : '#10b981' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: isPaid ? colors.text.secondary : '#10b981' }}>
                {isPaid ? 'Desmarcar' : 'Confirmar pago'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!!order.notes && (
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#fffbeb', borderRadius: 10, padding: 10 }}>
            <Ionicons name="document-text-outline" size={16} color="#b45309" />
            <Text style={{ flex: 1, fontSize: 13, color: '#92400e' }}>{order.notes}</Text>
          </View>
        )}

        {!!order.cancelReason && (
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Motivo: {order.cancelReason}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={onChat}
          style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        {order.status === 'pending' && (
          <TouchableOpacity
            onPress={onReject}
            disabled={busy}
            style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ef4444' }}>Rechazar</Text>
          </TouchableOpacity>
        )}

        {canBusinessCancel(order.status) && (
          <TouchableOpacity
            onPress={onCancel}
            disabled={busy}
            style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}

        {nextAction && (
          <TouchableOpacity
            onPress={() => onAdvance(nextAction.status)}
            disabled={busy}
            activeOpacity={0.85}
            style={{
              flex: 2, height: 44, borderRadius: 12, backgroundColor: colors.primary[500],
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name={nextAction.icon} size={18} color="#ffffff" />}
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>{nextAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function BusinessOrdersScreen() {
  const [activeTab, setActiveTab] = useState('in_progress');
  const [chatClient, setChatClient] = useState(null);
  const [busyOrderId, setBusyOrderId] = useState(null);

  const { currentContext } = useCurrentUserType();
  const businessId = currentContext?.businessId;

  const { data: orders = [], isLoading, isRefetching, refetch } = useBusinessOrders(businessId);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdateOrderPayment();

  const counts = useMemo(() => {
    const result = {};
    TABS.forEach((tab) => {
      result[tab.id] = orders.filter((o) => tab.statuses.includes(o.status)).length;
    });
    return result;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    return orders.filter((o) => tab.statuses.includes(o.status));
  }, [orders, activeTab]);

  const runAction = async (orderId, action) => {
    setBusyOrderId(orderId);
    try {
      await action();
    } catch (error) {
      const message = error?.response?.data?.message;
      Alert.alert('No se pudo actualizar', typeof message === 'string' ? message : 'Intenta de nuevo.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const changeStatus = (order, status, reason) =>
    runAction(order.id, () => updateStatus.mutateAsync({ orderId: order.id, status, reason }));

  const confirmClose = (order, status) => {
    const isReject = status === 'rejected';
    Alert.alert(
      isReject ? 'Rechazar pedido' : 'Cancelar pedido',
      'El cliente recibirá el aviso en el chat. Puedes explicarle el motivo ahí.',
      // Android shows at most three buttons
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sin disponibilidad', onPress: () => changeStatus(order, status, 'Producto sin disponibilidad') },
        { text: isReject ? 'Rechazar' : 'Cancelar pedido', style: 'destructive', onPress: () => changeStatus(order, status) },
      ]
    );
  };

  const togglePaid = (order) =>
    runAction(order.id, () =>
      updatePayment.mutateAsync({ orderId: order.id, paymentStatus: order.paymentStatus === 'paid' ? 'pending' : 'paid' })
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
      {/* Minimal Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.bg.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border.light
      }}>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text.primary,
          letterSpacing: 0.3
        }}>
          Pedidos
        </Text>
        <BusinessChatFAB />
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: colors.bg.primary }}>
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginVertical: 12,
          backgroundColor: colors.bg.secondary,
          borderRadius: 8,
          padding: 4,
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: isActive ? colors.bg.primary : 'transparent',
                  borderRadius: 6,
                  shadowColor: isActive ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? colors.text.primary : colors.text.secondary
                }}>
                  {tab.label}
                </Text>
                {counts[tab.id] > 0 && (
                  <View style={{
                    minWidth: 18, paddingHorizontal: 5, height: 18, borderRadius: 9,
                    backgroundColor: tab.id === 'in_progress' ? colors.primary[500] : colors.border.light,
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: tab.id === 'in_progress' ? '#ffffff' : colors.text.secondary }}>
                      {counts[tab.id]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary[500]} />}
        >
          {activeTab === 'completed' && <CommissionsPanel businessId={businessId} />}

          {visibleOrders.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36, backgroundColor: colors.bg.primary,
                justifyContent: 'center', alignItems: 'center', marginBottom: 16,
              }}>
                <Ionicons name="receipt-outline" size={32} color={colors.text.secondary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 6 }}>
                No hay pedidos aquí
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 }}>
                {EMPTY_TEXT[activeTab]}
              </Text>
            </View>
          ) : (
            visibleOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                busy={busyOrderId === order.id}
                onAdvance={(status) => changeStatus(order, status)}
                onReject={() => confirmClose(order, 'rejected')}
                onCancel={() => confirmClose(order, 'cancelled')}
                onTogglePaid={() => togglePaid(order)}
                onChat={() =>
                  setChatClient({
                    id: order.clientId,
                    type: 'user',
                    name: getClientName(order.client),
                    avatar: order.client?.avatarUrl,
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}

      {chatClient && (
        <ConversationModal
          visible={!!chatClient}
          onClose={() => setChatClient(null)}
          targetParticipant={chatClient}
        />
      )}
    </SafeAreaView>
  );
}
