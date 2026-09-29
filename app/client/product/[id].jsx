import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProductDetail from '../../../features/client/products/product-detail';
import { useProduct } from '../../../features/shared/products/hooks/use-products';
import { Text } from '../../../shared/components/ui/text';

/**
 * Client Product Detail Screen Route
 * Route: /client/product/[id]
 */
export default function ClientProductDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
          Producto no encontrado
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 }}>
          El producto no está disponible o no se pudo cargar.
        </Text>
      </View>
    );
  }

  return (
    <ProductDetail
      product={product}
      onClose={() => router.back()}
      onBusinessPress={(businessId) => router.push(`/client/business/${businessId}`)}
    />
  );
}
