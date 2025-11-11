import { ActivityIndicator, View } from 'react-native';
import { Text } from '../../../shared/components/ui';
import { useBusiness } from '../../../features/shared/social/hooks/use-businesses';
import { useProducts } from '../../../features/shared/products/hooks/use-products';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';
import BusinessProfile from './business-profile';

/**
 * Business Profile Viewer
 * Wrapper that fetches business data and renders the profile
 * Can be used in modal (with onClose) or as standalone route
 */
export function BusinessProfileViewer({ businessId, onClose }) {
  // Fetch business data
  const { data: business, isLoading: businessLoading, error: businessError } = useBusiness(businessId);

  // Fetch business products
  const { data: products = [], isLoading: productsLoading } = useProducts({
    storeId: businessId,
    limit: 50
  });

  // Fetch business posts for content tab
  const { data: contentPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['business-posts-public', businessId],
    queryFn: () => {
      return apiClient.get('/posts', {
        params: { businessId }
      }).then(res => res.data || []);
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000,
  });

  if (businessLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ marginTop: 16, fontSize: 14, color: '#6b7280' }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  if (businessError || !business) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
          No se pudo cargar el perfil del negocio
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
          {businessError?.message || 'Intenta nuevamente'}
        </Text>
      </View>
    );
  }

  // Combine business data with products and posts
  const businessWithData = {
    ...business,
    name: business.businessName,
    category: business.businessType,
    products: products,
    contentPosts: contentPosts,
    followersCount: business.followersCount || 0,
    description: business.description || 'Bienvenido a nuestro negocio',
    address: business.address || null,
    hours: business.hours || null,
    // Pass through existing fields that BusinessProfile expects
    bannerUrl: business.bannerUrl || business.coverImageUrl,
    logoUrl: business.logoUrl,
  };

  return <BusinessProfile business={businessWithData} onClose={onClose} />;
}

export default BusinessProfileViewer;
