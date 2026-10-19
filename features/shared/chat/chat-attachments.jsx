import { useState } from 'react';
import { Alert, Image, Linking, Modal, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/ui/text';
import {
  formatMoney,
  getMapsUrl,
  getOrderStatus,
  getPaymentMethodLabel,
} from '../../../shared/utils/order-status';
import { resolveMediaUrl } from '../../../shared/utils/media-url';
import { amountForCopy, formatAmount, getAccountRows, getAccountText, getAccountType } from '../../../shared/utils/payment-accounts';

export const ATTACHMENT_TYPES = ['order', 'order_status', 'location', 'image', 'payment_account'];

/**
 * Order, location and image messages carry their data as JSON in `mediaUrl`.
 * Returns that payload when the message is one of them, otherwise null.
 */
export function parseChatAttachment(item) {
  const media = item?.mediaUrl;
  if (!media) return null;

  let parsed = media;
  if (typeof media === 'string') {
    try {
      parsed = JSON.parse(media);
      // Some messages were stored double-encoded
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  return parsed && typeof parsed === 'object' && ATTACHMENT_TYPES.includes(parsed.type) ? parsed : null;
}

export function OrderCard({ order, isStatusUpdate, canShareLocation, onShareLocation, sharingLocation }) {
  const status = getOrderStatus(order.status);

  if (isStatusUpdate) {
    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: status.bg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
        borderWidth: 1, borderColor: `${status.color}33`, marginBottom: 6,
      }}>
        <Ionicons name={status.icon} size={18} color={status.color} />
        <View>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Pedido {order.orderNumber}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: status.color }}>{status.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      width: 250, backgroundColor: '#ffffff', borderRadius: 18, overflow: 'hidden', marginBottom: 6,
      borderWidth: 1, borderColor: '#e2e8f0',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#fef2f2' }}>
        {order.businessLogo ? (
          <Image source={{ uri: order.businessLogo }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        ) : (
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="receipt" size={16} color="#ffffff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#991b1b', fontWeight: '600' }}>Nuevo pedido</Text>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>{order.orderNumber}</Text>
        </View>
      </View>

      <View style={{ padding: 12, gap: 4 }}>
        {(order.items || []).map((item, index) => (
          <Text key={index} style={{ fontSize: 13, color: '#334155' }} numberOfLines={1}>
            {item.quantity}x {item.name}
          </Text>
        ))}
        {order.itemsCount > (order.items || []).reduce((s, i) => s + i.quantity, 0) && (
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>y más productos…</Text>
        )}

        <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 6 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            {order.deliveryMethod === 'pickup' ? 'Retiro en tienda' : 'Delivery'} · {getPaymentMethodLabel(order.paymentMethod)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }}>Total</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#ef4444' }}>{formatMoney(order.total)}</Text>
        </View>
      </View>

      {canShareLocation && (
        <TouchableOpacity
          onPress={onShareLocation}
          disabled={sharingLocation}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            backgroundColor: '#ef4444', margin: 12, marginTop: 0, paddingVertical: 10, borderRadius: 12,
            opacity: sharingLocation ? 0.6 : 1,
          }}
        >
          <Ionicons name="location" size={16} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
            {sharingLocation ? 'Obteniendo ubicación…' : 'Compartir ubicación de entrega'}
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

export function LocationCard({ location, isMine }) {
  const openMaps = () => {
    Linking.openURL(getMapsUrl(location)).catch(() => {});
  };

  return (
    <TouchableOpacity
      onPress={openMaps}
      activeOpacity={0.9}
      style={{
        width: 240, borderRadius: 18, overflow: 'hidden', marginBottom: 6,
        backgroundColor: isMine ? '#ef4444' : '#ffffff',
        borderWidth: isMine ? 0 : 1, borderColor: '#e2e8f0',
      }}
    >
      <View style={{
        height: 90, alignItems: 'center', justifyContent: 'center',
        backgroundColor: isMine ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
      }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="location" size={26} color="#ef4444" />
        </View>
      </View>
      <View style={{ padding: 12, gap: 2 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: isMine ? '#ffffff' : '#0f172a' }}>
          {location.orderNumber ? `Ubicación de entrega · ${location.orderNumber}` : 'Ubicación compartida'}
        </Text>
        <Text style={{ fontSize: 12, color: isMine ? 'rgba(255,255,255,0.85)' : '#64748b' }} numberOfLines={2}>
          {location.address || `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}`}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Ionicons name="map-outline" size={14} color={isMine ? '#ffffff' : '#ef4444'} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: isMine ? '#ffffff' : '#ef4444' }}>Abrir en el mapa</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Photo sent in the chat (e.g. a payment receipt). Tap to see it full screen.
 */
export function ImageCard({ image, isMine }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const uri = resolveMediaUrl(image.url);
  const isReceipt = image.kind === 'receipt';

  if (!uri) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setViewerOpen(true)}
        activeOpacity={0.9}
        style={{
          width: 220, borderRadius: 18, overflow: 'hidden', marginBottom: 6,
          backgroundColor: isMine ? '#ef4444' : '#ffffff',
          borderWidth: isMine ? 0 : 1, borderColor: '#e2e8f0',
        }}
      >
        <Image source={{ uri }} style={{ width: '100%', height: 260, backgroundColor: '#e2e8f0' }} resizeMode="cover" />
        {isReceipt && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Ionicons name="receipt-outline" size={15} color={isMine ? '#ffffff' : '#ef4444'} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: isMine ? '#ffffff' : '#0f172a' }}>
              Comprobante de pago
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' }}>
          <Image source={{ uri }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          <TouchableOpacity
            onPress={() => setViewerOpen(false)}
            accessibilityLabel="Cerrar"
            style={{
              position: 'absolute', top: 56, right: 20, width: 40, height: 40, borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const copyToClipboard = async (text, what) => {
  try {
    await Clipboard.setStringAsync(String(text));
    Alert.alert('Copiado', `${what} copiado al portapapeles`);
  } catch {
    Alert.alert('Error', 'No se pudo copiar');
  }
};

/**
 * Bank / Pago móvil / Zelle / Binance details sent by the business.
 * Each value can be copied on its own, or all of them at once.
 */
export function PaymentAccountCard({ account, isMine }) {
  const type = getAccountType(account.accountType);
  const data = { ...account, type: account.accountType };
  const rows = getAccountRows(data);

  return (
    <View style={{
      width: 260, backgroundColor: '#ffffff', borderRadius: 18, overflow: 'hidden', marginBottom: 6,
      borderWidth: 1, borderColor: isMine ? '#fecaca' : '#e2e8f0',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: `${type.color}14` }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={type.icon} size={18} color={type.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Datos para pagar</Text>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>{type.label}</Text>
        </View>
      </View>

      {!!account.amount && (
        <TouchableOpacity
          onPress={() => copyToClipboard(amountForCopy(account.amount, account.currency), 'Monto')}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 10, padding: 12,
            borderRadius: 12, backgroundColor: '#fef2f2',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#991b1b' }}>Monto a pagar</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#ef4444' }} selectable>
              {formatAmount(account.amount, account.currency)}
            </Text>
          </View>
          <Ionicons name="copy-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}

      <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        {rows.map((row) => (
          <TouchableOpacity
            key={row.key}
            onPress={() => copyToClipboard(row.value, row.label)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{row.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} selectable>{row.value}</Text>
            </View>
            <Ionicons name="copy-outline" size={16} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => copyToClipboard(getAccountText(data), 'Datos de pago')}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          margin: 12, marginTop: 6, paddingVertical: 9, borderRadius: 12, backgroundColor: '#0f172a',
        }}
      >
        <Ionicons name="copy" size={15} color="#ffffff" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>Copiar todo</Text>
      </TouchableOpacity>
    </View>
  );
}
