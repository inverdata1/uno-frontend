import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { apiClient } from '../../../shared/config/api-client';
import { useCommissions, useReportCommissionPayment } from '../../../shared/hooks/use-payments';
import { compressImageForUpload } from '../../../shared/utils/compress-image';
import { formatMoney } from '../../../shared/utils/order-status';
import { ACCOUNT_TYPE_IDS, ACCOUNT_TYPES, formatPeriod, getAccountRows, getAccountType } from '../../../shared/utils/payment-accounts';

const PAYMENT_STATUS = {
  reported: { label: 'En revisión', color: '#f59e0b', bg: '#fffbeb', icon: 'time-outline' },
  confirmed: { label: 'Pagado', color: '#10b981', bg: '#ecfdf5', icon: 'checkmark-circle' },
  rejected: { label: 'Pago rechazado', color: '#ef4444', bg: '#fef2f2', icon: 'alert-circle' },
};

const uploadReceipt = async (localUri) => {
  const uri = await compressImageForUpload(localUri);
  const formData = new FormData();
  const fileName = `commission_${Date.now()}.jpg`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    formData.append('image', blob, fileName);
  } else {
    formData.append('image', { uri, name: fileName, type: 'image/jpeg' });
  }
  formData.append('productName', 'commission_receipt');
  const res = await apiClient.post('/upload/image', formData, {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  });
  if (!res.data?.url) throw new Error('No URL returned from upload');
  return res.data.url;
};

function PayCommissionModal({ visible, month, rate, platformAccounts, businessId, onClose }) {
  const insets = useSafeAreaInsets();
  const report = useReportCommissionPayment();
  const [method, setMethod] = useState(platformAccounts[0]?.type || 'pago_movil');
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState(null); // local uri
  const [submitting, setSubmitting] = useState(false);

  if (!month) return null;

  const accountsForMethod = platformAccounts.filter((a) => a.type === method);
  const methods = platformAccounts.length
    ? ACCOUNT_TYPE_IDS.filter((id) => platformAccounts.some((a) => a.type === id))
    : ACCOUNT_TYPE_IDS;

  const pickReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Galería bloqueada', 'Activa el acceso a tus fotos en los ajustes de tu teléfono.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!result.canceled && result.assets?.[0]) setReceipt(result.assets[0].uri);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const receiptUrl = receipt ? await uploadReceipt(receipt) : undefined;
      await report.mutateAsync({
        period: month.period,
        businessId,
        method,
        reference: reference.trim() || undefined,
        receiptUrl,
      });
      Alert.alert('Pago enviado', 'Revisaremos tu pago y lo marcaremos como pagado.');
      setReference('');
      setReceipt(null);
      onClose();
    } catch (error) {
      const message = error?.response?.data?.message;
      Alert.alert('No se pudo enviar', typeof message === 'string' ? message : 'Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (reference.trim() || receipt) && !submitting;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
          <View style={{
            backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%',
            paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 14 }} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Pagar comisión</Text>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {formatPeriod(month.period)} · {Math.round(rate * 100)}% de {formatMoney(month.sales)}
              </Text>

              <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, marginTop: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#991b1b' }}>Monto a pagar</Text>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#ef4444' }}>{formatMoney(month.commission)}</Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 18, marginBottom: 8 }}>Método</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {methods.map((id) => {
                  const t = ACCOUNT_TYPES[id];
                  const active = method === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setMethod(id)}
                      style={{
                        flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 12,
                        borderWidth: 2, borderColor: active ? '#ef4444' : '#e5e7eb', backgroundColor: active ? '#fef2f2' : '#ffffff',
                      }}
                    >
                      <Ionicons name={t.icon} size={18} color={active ? '#ef4444' : t.color} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#ef4444' : '#374151' }}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* UNO's accounts for the chosen method */}
              <View style={{ marginTop: 12, gap: 8 }}>
                {accountsForMethod.length === 0 ? (
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    Escríbenos para recibir los datos de {getAccountType(method).label} de UNO AI.
                  </Text>
                ) : (
                  accountsForMethod.map((account, index) => (
                    <View key={index} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 12, gap: 6 }}>
                      {getAccountRows(account).map((row) => (
                        <TouchableOpacity
                          key={row.key}
                          onPress={() => Clipboard.setStringAsync(String(row.value)).then(() => Alert.alert('Copiado', `${row.label} copiado`))}
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: '#9ca3af' }}>{row.label}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{row.value}</Text>
                          </View>
                          <Ionicons name="copy-outline" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
                )}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 18, marginBottom: 8 }}>Referencia del pago</Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Número de referencia o confirmación"
                placeholderTextColor="#9ca3af"
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111827' }}
              />

              <TouchableOpacity
                onPress={pickReceipt}
                style={{
                  marginTop: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 12,
                  padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                {receipt ? (
                  <Image source={{ uri: receipt }} style={{ width: 44, height: 44, borderRadius: 8 }} />
                ) : (
                  <Ionicons name="receipt-outline" size={22} color="#6b7280" />
                )}
                <Text style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                  {receipt ? 'Comprobante adjunto (toca para cambiarlo)' : 'Adjuntar comprobante (opcional)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submit}
                disabled={!canSubmit}
                activeOpacity={0.85}
                style={{
                  marginTop: 18, height: 50, borderRadius: 14, backgroundColor: '#ef4444',
                  alignItems: 'center', justifyContent: 'center', opacity: canSubmit ? 1 : 0.5,
                }}
              >
                {submitting ? <ActivityIndicator color="#ffffff" /> : (
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#ffffff' }}>Enviar pago de {formatMoney(month.commission)}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * App commission owed per month: a percentage of delivered sales, paid monthly.
 */
export function CommissionsPanel({ businessId }) {
  const { data, isLoading } = useCommissions(businessId);
  const [payingMonth, setPayingMonth] = useState(null);

  if (isLoading) {
    return <ActivityIndicator color="#ef4444" style={{ marginVertical: 16 }} />;
  }
  if (!data) return null;

  const ratePct = `${Math.round(data.rate * 100)}%`;
  const current = data.months.find((m) => m.isCurrent) || { period: data.currentPeriod, ordersCount: 0, sales: 0, commission: 0 };
  const previous = data.months.filter((m) => !m.isCurrent && m.commission > 0);
  const totalPending = data.months
    .filter((m) => m.commission > 0 && m.payment?.status !== 'confirmed' && m.payment?.status !== 'reported')
    .reduce((sum, m) => sum + m.commission, 0);

  const renderAction = (month) => {
    const status = month.payment && PAYMENT_STATUS[month.payment.status];
    if (status && month.payment.status !== 'rejected') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
          <Ionicons name={status.icon} size={14} color={status.color} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: status.color }}>{status.label}</Text>
        </View>
      );
    }
    if (month.commission <= 0) return null;
    return (
      <TouchableOpacity
        onPress={() => setPayingMonth(month)}
        activeOpacity={0.85}
        style={{ backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
      >
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>
          {month.payment?.status === 'rejected' ? 'Pagar de nuevo' : 'Pagar'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Current month */}
      <View style={{
        backgroundColor: '#111827', borderRadius: 18, padding: 16,
        shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Comisiones UNO AI · {formatPeriod(current.period)}</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>{ratePct} de ventas</Text>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Ventas entregadas</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>{formatMoney(current.sales)}</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>{current.ordersCount} pedidos</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#374151', marginHorizontal: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Comisión ({ratePct})</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#f87171' }}>{formatMoney(current.commission)}</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Se paga al cerrar el mes</Text>
          </View>
        </View>

        {/* The running month is paid once it closes; only show a payment already sent */}
        {current.payment && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            {renderAction(current)}
          </View>
        )}
      </View>

      {/* Previous months */}
      {previous.length > 0 && (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>Meses anteriores</Text>
            {totalPending > 0 && (
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>Por pagar: {formatMoney(totalPending)}</Text>
            )}
          </View>
          {previous.map((month, index) => (
            <View
              key={month.period}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12,
                borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f3f4f6',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{formatPeriod(month.period)}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {month.ordersCount} pedidos · {formatMoney(month.sales)} → {formatMoney(month.commission)}
                </Text>
              </View>
              {renderAction(month)}
            </View>
          ))}
        </View>
      )}

      <PayCommissionModal
        visible={!!payingMonth}
        month={payingMonth}
        rate={data.rate}
        platformAccounts={data.platformAccounts || []}
        businessId={businessId}
        onClose={() => setPayingMonth(null)}
      />
    </View>
  );
}

export default CommissionsPanel;
