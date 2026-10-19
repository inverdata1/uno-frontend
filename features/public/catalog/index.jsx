import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui/text';
import { BrandLogo } from '../../../shared/components/ui/brand-logo';
import { API_CONFIG } from '../../../shared/config/api-config';
import { normalizeMediaUrls } from '../../../shared/utils/media-url';
import { shareBusinessCatalog } from '../../../shared/utils/share-catalog';
import { useAuthStore } from '../../../core/auth/stores/auth-store';

const MAX_WIDTH = 760;

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const productImage = (product) => {
  const images = Array.isArray(product.images) ? product.images : [];
  return product.thumbnailUrl || images[0] || null;
};

/**
 * Public, shareable storefront: business profile + catalog.
 * Works without an account; ordering sends the visitor into the app.
 */
export function PublicCatalog({ businessId }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuthStore();

  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [categoryId, setCategoryId] = useState('all');

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;

    fetch(`${API_CONFIG.baseURL.replace(/\/+$/, '')}/public/businesses/${businessId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'NOT_FOUND' : 'FAILED');
        return normalizeMediaUrls(await res.json());
      })
      .then((data) => !cancelled && setBusiness(data))
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const products = useMemo(() => {
    const list = business?.products || [];
    return categoryId === 'all' ? list : list.filter((p) => p.categoryId === categoryId);
  }, [business, categoryId]);

  // Only offer categories that actually have products
  const categories = useMemo(
    () => (business?.categories || []).filter((c) => business.products.some((p) => p.categoryId === c.id)),
    [business]
  );

  const contentWidth = Math.min(width, MAX_WIDTH);
  const columns = contentWidth >= 600 ? 3 : 2;
  const cardWidth = (contentWidth - 32 - (columns - 1) * 12) / columns;

  const goToApp = (path) => {
    router.push(isAuthenticated ? path : '/(auth)/welcome');
  };

  if (error || !business) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {error ? (
          <>
            <BrandLogo height={36} style={{ marginBottom: 24 }} />
            <Ionicons name="storefront-outline" size={44} color="#9ca3af" />
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 12 }}>
              {error === 'NOT_FOUND' ? 'Este negocio no está disponible' : 'No se pudo cargar el catálogo'}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 16 }}>
              <Text style={{ color: '#ef4444', fontWeight: '700' }}>Ir a UNO AI</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" color="#ef4444" />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Top bar */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{
          width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10,
        }}>
          <BrandLogo height={24} />
          <TouchableOpacity
            onPress={() => shareBusinessCatalog({ id: business.id, name: business.businessName })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#f3f4f6' }}
          >
            <Ionicons name="share-social-outline" size={16} color="#111827" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' }}>
          {/* Banner + logo */}
          <View style={{ height: 160, backgroundColor: '#fee2e2' }}>
            {business.bannerUrl && (
              <Image source={{ uri: business.bannerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            )}
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: -40 }}>
            <View style={{
              width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#ffffff',
              backgroundColor: '#ef4444', overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
            }}>
              {business.logoUrl ? (
                <Image source={{ uri: business.logoUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: '800' }}>{business.businessName?.charAt(0)}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', flexShrink: 1 }}>{business.businessName}</Text>
              {business.isVerified && <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              {!!(business.category || business.businessType) && (
                <Text style={{ fontSize: 14, color: '#6b7280' }}>{business.category || business.businessType}</Text>
              )}
              {Number(business.rating) > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{Number(business.rating).toFixed(1)}</Text>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>({business.reviewsCount})</Text>
                </View>
              )}
            </View>

            {!!business.description && (
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 10 }}>{business.description}</Text>
            )}

            <View style={{ gap: 6, marginTop: 12 }}>
              {!!business.businessHours && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={{ fontSize: 13, color: '#374151' }}>{business.businessHours}</Text>
                </View>
              )}
              {!!business.address && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={{ fontSize: 13, color: '#374151', flex: 1 }}>{business.address}</Text>
                </View>
              )}
              {!!business.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${business.phone}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '600' }}>{business.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Catalog */}
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 24, marginBottom: 10, paddingHorizontal: 16 }}>
            Catálogo ({business.products.length})
          </Text>

          {categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
              {[{ id: 'all', name: 'Todo' }, ...categories].map((c) => {
                const active = categoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                      backgroundColor: active ? '#111827' : '#ffffff', borderWidth: 1, borderColor: active ? '#111827' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#ffffff' : '#374151' }}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {products.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 24 }}>Este negocio aún no tiene productos publicados.</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 }}>
              {products.map((product) => {
                const image = productImage(product);
                const hasDiscount = product.isDiscountActive && product.discountPrice != null;
                return (
                  <TouchableOpacity
                    key={product.id}
                    activeOpacity={0.85}
                    onPress={() => goToApp(`/client/product/${product.id}`)}
                    style={{ width: cardWidth, backgroundColor: '#ffffff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' }}
                  >
                    <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#f3f4f6' }}>
                      {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="bag-handle-outline" size={32} color="#cbd5e1" />
                        </View>
                      )}
                      {!product.isAvailable && (
                        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(17,24,39,0.8)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>Agotado</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: 10, gap: 2 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }} numberOfLines={2}>{product.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#ef4444' }}>
                          {formatPrice(hasDiscount ? product.discountPrice : product.price)}
                        </Text>
                        {hasDiscount && (
                          <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}>{formatPrice(product.price)}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Order CTA */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', padding: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => goToApp(`/client/business/${business.id}`)}
            activeOpacity={0.85}
            style={{ height: 50, borderRadius: 14, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Ionicons name="bag-handle" size={20} color="#ffffff" />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff' }}>
              {isAuthenticated ? 'Hacer mi pedido' : 'Pedir en UNO AI'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default PublicCatalog;
