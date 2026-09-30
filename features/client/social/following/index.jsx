import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../../shared/components/ui';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { resolveMediaUrl } from '../../../../shared/utils/media-url';
import {
  useFollowedBusinesses,
  useToggleFollowBusiness
} from '../../../shared/social/hooks/use-businesses';

const { width } = Dimensions.get('window');

/**
 * FollowedBusinessesScreen Component
 * Displays the list of businesses that the client is currently following,
 * with search, quick unfollow/follow toggle, and direct navigation to business profiles.
 */
export default function FollowedBusinessesScreen({ onBusinessPress }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: businesses = [], isLoading, refetch } = useFollowedBusinesses(user?.id);
  const toggleFollowMutation = useToggleFollowBusiness();

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase().trim();
    return businesses.filter((b) =>
      b.businessName?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    );
  }, [businesses, searchQuery]);

  const handleBusinessPress = (business) => {
    if (onBusinessPress) {
      onBusinessPress(business.id);
    } else if (business?.id) {
      router.push(`/client/business/${business.id}`);
    }
  };

  const handleToggleFollow = (e, businessId) => {
    e?.stopPropagation?.();
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para gestionar tus seguidos.');
      return;
    }
    toggleFollowMutation.mutate({ businessId, userId: user.id });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          gap: 12
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#f8fafc',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
              Negocios Seguidos
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              {businesses.length} {businesses.length === 1 ? 'negocio seguido' : 'negocios seguidos'}
            </Text>
          </View>
        </View>

        {/* Search Bar - Sticky */}
        <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <View style={{
            backgroundColor: '#f8fafc',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e2e8f0'
          }}>
            <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar entre los negocios que sigues..."
              placeholderTextColor="#94a3b8"
              style={{ fontSize: 15, color: '#0f172a', flex: 1 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
              Cargando negocios seguidos...
            </Text>
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', paddingHorizontal: 32 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#fef2f2',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="storefront-outline" size={36} color="#ef4444" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6, textAlign: 'center' }}>
              {searchQuery ? 'Sin resultados' : 'Aún no sigues ningún negocio'}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
              {searchQuery
                ? 'No encontramos ningún negocio que coincida con tu búsqueda.'
                : 'Sigue a tus restaurantes y tiendas favoritas para ver sus novedades, ofertas y publicaciones.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => router.push('/client/(tabs)/feed')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#ef4444',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4
                }}
              >
                <Ionicons name="compass-outline" size={18} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                  Explorar Negocios
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
            {filteredBusinesses.map((biz) => {
              const logoUrl = resolveMediaUrl(biz.logoUrl || biz.logo);
              const rating = Number(biz.rating || 0).toFixed(1);
              const followers = biz.followersCount || biz._count?.followers || 0;
              const productsCount = biz._count?.products || 0;

              return (
                <TouchableOpacity
                  key={biz.id}
                  activeOpacity={0.85}
                  onPress={() => handleBusinessPress(biz)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#f1f5f9',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                    gap: 12
                  }}
                >
                  {/* Business Logo */}
                  <View style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: '#f8fafc',
                    borderWidth: 1.5,
                    borderColor: '#ef4444',
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {logoUrl ? (
                      <Image
                        source={{ uri: logoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '800' }}>
                        {(biz.businessName || 'N').charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  {/* Business Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 }} numberOfLines={1}>
                        {biz.businessName}
                      </Text>
                      {biz.isVerified && (
                        <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
                      )}
                    </View>

                    {/* Category & Rating */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      {biz.category && (
                        <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>
                            {biz.category}
                          </Text>
                        </View>
                      )}
                      {Number(rating) > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Ionicons name="star" size={12} color="#eab308" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
                            {rating}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Followers & Products stats */}
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      {followers} {followers === 1 ? 'seguidor' : 'seguidores'} • {productsCount} {productsCount === 1 ? 'producto' : 'productos'}
                    </Text>
                  </View>

                  {/* Siguiendo Button */}
                  <TouchableOpacity
                    onPress={(e) => handleToggleFollow(e, biz.id)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: '#fef2f2',
                      borderWidth: 1,
                      borderColor: '#fca5a5',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="#ef4444" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>
                      Siguiendo
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
