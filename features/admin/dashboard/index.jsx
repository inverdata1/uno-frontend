import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui/text';
import { BrandLogo } from '../../../shared/components/ui/brand-logo';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import { useAdminOverview, useReviewCommissionPayment } from '../../../shared/hooks/use-admin';
import { resolveMediaUrl } from '../../../shared/utils/media-url';
import { formatPeriod } from '../../../shared/utils/payment-accounts';

const money = (value) =>
  `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const count = (value) => Number(value || 0).toLocaleString('es-ES');

const shiftPeriod = (period, delta) => {
  const [year, month] = period.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const shortMonth = (period) => {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
};

const PAYMENT_STATUS = {
  reported: { label: 'Por revisar', color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'Cobrado', color: '#047857', bg: '#d1fae5' },
  rejected: { label: 'Rechazado', color: '#b91c1c', bg: '#fee2e2' },
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: 18,
  padding: 16,
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};

function StatCard({ icon, color, label, value, hint }) {
  return (
    <View style={[card, { flexGrow: 1, flexBasis: '45%' }]}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}1A`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>{value}</Text>
      <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</Text>
      {!!hint && <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600', marginTop: 4 }}>{hint}</Text>}
    </View>
  );
}

const CHART_BAR_MAX = 100;

function ActivityChart({ activity }) {
  const max = Math.max(1, ...activity.map((a) => a.activeUsers));
  return (
    <View style={card}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Usuarios activos por mes</Text>
      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Personas distintas que usaron la app cada mes</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 16, gap: 8 }}>
        {activity.map((item, index) => {
          const isLast = index === activity.length - 1;
          return (
            <View key={item.period} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: isLast ? '#ef4444' : '#475569', marginBottom: 4 }}>
                {count(item.activeUsers)}
              </Text>
              <View style={{
                width: '100%', maxWidth: 34, borderRadius: 8,
                height: Math.max(4, (item.activeUsers / max) * CHART_BAR_MAX),
                backgroundColor: isLast ? '#ef4444' : '#fecaca',
              }} />
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>{shortMonth(item.period)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BusinessRow({ business, rate, onReview, reviewing }) {
  const logo = resolveMediaUrl(business.logoUrl);
  const status = business.payment && PAYMENT_STATUS[business.payment.status];

  return (
    <View style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
          {logo ? (
            <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: '#ef4444', fontWeight: '800' }}>{business.businessName?.charAt(0)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', flexShrink: 1 }} numberOfLines={1}>
              {business.businessName}
            </Text>
            {!business.isActive && (
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                INACTIVO
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1}>
            {[business.category, business.ownerEmail].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>{money(business.sales)}</Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>{business.ordersCount} pedidos</Text>
        </View>
      </View>

      {business.commission > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>Comisión {Math.round(rate * 100)}%</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#ef4444' }}>{money(business.commission)}</Text>
          </View>
          {status ? (
            <View style={{ backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: status.color }}>{status.label}</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Sin pagar</Text>
            </View>
          )}
        </View>
      )}

      {business.payment?.status === 'reported' && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#475569' }}>
            Pagó {money(business.payment.amount)}
            {business.payment.method ? ` por ${business.payment.method.replace('_', ' ')}` : ''}
            {business.payment.reference ? ` · Ref. ${business.payment.reference}` : ''}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!!business.payment.receiptUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(resolveMediaUrl(business.payment.receiptUrl)).catch(() => {})}
                style={{ flex: 1, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Ionicons name="receipt-outline" size={15} color="#0f172a" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>Comprobante</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onReview(business, 'rejected')}
              disabled={reviewing}
              style={{ flex: 1, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onReview(business, 'confirmed')}
              disabled={reviewing}
              style={{ flex: 1, height: 38, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}
            >
              {reviewing ? <ActivityIndicator size="small" color="#ffffff" /> : (
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Super user dashboard: platform size, monthly active users and each
 * business' sales with the app commission owed.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const [period, setPeriod] = useState(null); // null = current month
  const [search, setSearch] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const { data, isLoading, isRefetching, refetch, error } = useAdminOverview(period);
  const review = useReviewCommissionPayment();

  const businesses = useMemo(() => {
    const list = data?.businesses || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((b) =>
      [b.businessName, b.ownerEmail, b.ownerName, b.category].some((v) => v?.toLowerCase().includes(q))
    );
  }, [data, search]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const handleReview = (business, status) => {
    const confirmed = status === 'confirmed';
    Alert.alert(
      confirmed ? 'Confirmar pago' : 'Rechazar pago',
      `${business.businessName}: ${money(business.payment.amount)} de ${formatPeriod(data.period)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: confirmed ? 'Confirmar' : 'Rechazar',
          style: confirmed ? 'default' : 'destructive',
          onPress: async () => {
            setReviewingId(business.id);
            try {
              await review.mutateAsync({ id: business.payment.id, status });
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el pago.');
            } finally {
              setReviewingId(null);
            }
          },
        },
      ]
    );
  };

  if (error?.response?.status === 403) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#ffffff' }}>
        <Ionicons name="lock-closed-outline" size={44} color="#94a3b8" />
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginTop: 12 }}>Acceso solo para administradores</Text>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 16 }}>
          <Text style={{ color: '#ef4444', fontWeight: '700' }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totals = data?.totals;
  const currentPeriod = data?.currentPeriod;
  const shownPeriod = data?.period;
  const pendingReview = (data?.businesses || []).filter((b) => b.payment?.status === 'reported').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', gap: 10 }}>
        <BrandLogo height={26} />
        <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 }}>ADMIN</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleLogout} accessibilityLabel="Cerrar sesión" style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="log-out-outline" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {isLoading || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {error ? (
            <>
              <Text style={{ color: '#64748b' }}>No se pudo cargar el panel</Text>
              <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 12 }}>
                <Text style={{ color: '#ef4444', fontWeight: '700' }}>Reintentar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color="#ef4444" />
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#ef4444" />}
          keyboardShouldPersistTaps="handled"
        >
          {/* Month selector */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setPeriod(shiftPeriod(shownPeriod, -1))} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={20} color="#0f172a" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{formatPeriod(shownPeriod)}</Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>{shownPeriod === currentPeriod ? 'Mes en curso' : 'Mes cerrado'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPeriod(shiftPeriod(shownPeriod, 1))}
              disabled={shownPeriod >= currentPeriod}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', opacity: shownPeriod >= currentPeriod ? 0.4 : 1 }}
            >
              <Ionicons name="chevron-forward" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Commission highlight */}
          <View style={[card, { backgroundColor: '#0f172a' }]}>
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>Comisión de la app ({Math.round(data.rate * 100)}%)</Text>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#ffffff', marginTop: 2 }}>{money(totals.commission)}</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>sobre {money(totals.sales)} en ventas entregadas</Text>
            <View style={{ flexDirection: 'row', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>COBRADO</Text>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#34d399' }}>{money(totals.commissionCollected)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>POR COBRAR</Text>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#f87171' }}>
                  {money(Math.max(0, totals.commission - totals.commissionCollected))}
                </Text>
              </View>
            </View>
          </View>

          {/* KPIs */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <StatCard icon="people" color="#3b82f6" label="Usuarios registrados" value={count(totals.users)} hint={totals.newUsers ? `+${count(totals.newUsers)} este mes` : null} />
            <StatCard icon="storefront" color="#ef4444" label="Comercios" value={count(totals.businesses)} hint={totals.newBusinesses ? `+${count(totals.newBusinesses)} este mes` : null} />
            <StatCard
              icon="pulse"
              color="#8b5cf6"
              label="Activos en el mes"
              value={count(totals.activeUsers)}
              hint={totals.activeToday != null ? `${count(totals.activeToday)} hoy` : null}
            />
            <StatCard icon="bag-check" color="#10b981" label="Ventas del mes" value={money(totals.sales)} />
          </View>

          <ActivityChart activity={data.activity} />

          {/* Businesses */}
          <View style={card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Comercios ({data.businesses.length})</Text>
              {pendingReview > 0 && (
                <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#b45309' }}>{pendingReview} pagos por revisar</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, marginTop: 12, marginBottom: 4 }}>
              <Ionicons name="search" size={16} color="#94a3b8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar comercio o correo"
                placeholderTextColor="#94a3b8"
                style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
              />
            </View>
            {businesses.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748b', paddingVertical: 20 }}>Sin resultados</Text>
            ) : (
              businesses.map((business) => (
                <BusinessRow
                  key={business.id}
                  business={business}
                  rate={data.rate}
                  onReview={handleReview}
                  reviewing={reviewingId === business.id}
                />
              ))
            )}
          </View>

          {/* All time */}
          <View style={[card, { flexDirection: 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Ventas históricas</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>{money(totals.allTimeSales)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Comisión histórica</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#ef4444' }}>{money(totals.allTimeCommission)}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
