import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useProducts } from '../../shared/products/hooks/use-products';
import { usePosts } from '../../shared/social/hooks/use-posts';
import ProductDetailModal from '../products/product-detail-modal';

const { width } = Dimensions.get('window');

/**
 * Business Profile Screen
 * Instagram/TikTok-inspired business profile with immersive design
 */
export default function BusinessProfile({ business, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('shop');
  const [isFollowing, setIsFollowing] = useState(business?.isFollowing || false);
  const [contentFilter, setContentFilter] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);

  // Fetch products and posts using hooks
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    businessId: business?.id,
    limit: 50
  });

  const { data: contentPosts = [], isLoading: isLoadingPosts } = usePosts({
    businessId: business?.id,
    limit: 50
  });

  console.log('[BusinessProfile] Products:', products?.length || 0);
  console.log('[BusinessProfile] Posts:', contentPosts?.length || 0);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    console.log('Toggle follow:', business?.id);
  };

  const handleProductPress = (product) => {
    setSelectedProductId(product.id);
    setProductDetailVisible(true);
  };

  const handleContentPress = (content) => {
    console.log('Open content:', content.id);
  };

  const filteredContent = contentPosts.filter((post) => {
    if (contentFilter === 'videos') return post.type === 'video';
    if (contentFilter === 'photos') return post.type === 'image';
    return true;
  });

  const cardWidth = (width - 48) / 2;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Floating Header Buttons - Instagram Style */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 50 }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-3 py-2">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 items-center justify-center"
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={26} color="#000000" />
            </TouchableOpacity>

            <View className="flex-row items-center" style={{ gap: 16 }}>
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                activeOpacity={0.6}
              >
                <Ionicons name="ellipsis-vertical" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Full-Bleed Cover Image */}
        <View className="relative" style={{ width, height: 240, backgroundColor: '#f3f4f6' }}>
          {business?.coverImageUrl ? (
            <Image
              source={{ uri: business.coverImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Ionicons name="business" size={64} color="rgba(255, 255, 255, 0.3)" />
            </View>
          )}
        </View>

        {/* Profile Header Section */}
        <View className="px-4 pt-4">

          {/* Logo - Overlapping the cover image */}
          <View
            className="rounded-full bg-white overflow-hidden"
            style={{
              width: 96,
              height: 96,
              marginTop: -48,
              borderWidth: 4,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5
            }}
          >
            {business?.logoUrl ? (
              <Image
                source={{ uri: business.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 justify-center items-center bg-gray-100">
                <Ionicons name="storefront" size={40} color="#9ca3af" />
              </View>
            )}
          </View>

          {/* Business Name & Category */}
          <Text className="text-2xl font-bold text-gray-900 mt-3 mb-1">
            {business?.name || 'Nombre del Negocio'}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            {business?.category || 'Categoria'}
          </Text>

          {/* Stats Row */}
          <View className="flex-row items-center mb-4 gap-4">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text className="text-sm font-semibold text-gray-900 ml-1">
                {String(business?.rating || '4.8')}
              </Text>
              <Text className="text-sm text-gray-500 ml-1">
                ({String(business?.reviewsCount || '127')})
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-gray-300" />
            <Text className="text-sm text-gray-600">
              {String(products.length || 0)} Productos
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-300" />
            <Text className="text-sm text-gray-600">
              {String(business?.followersCount || 150)} Seguidores
            </Text>
          </View>

          {/* Description */}
          <Text className="text-base text-gray-700 leading-6 mb-4">
            {business?.description || 'Descripcion del negocio'}
          </Text>

          {/* Contact Info */}
          {(business?.address || business?.hours) && (
            <View className="mb-4 gap-2">
              {business?.address && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 ml-2">
                    {business.address}
                  </Text>
                </View>
              )}
              {business?.hours && (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 ml-2">
                    {business.hours}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row mb-6" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleFollowToggle}
              className="flex-1 rounded-xl"
              style={{
                backgroundColor: isFollowing ? '#f3f4f6' : '#ef4444',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: isFollowing ? 'transparent' : '#ef4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: isFollowing ? 0 : 2
              }}
              activeOpacity={0.8}
            >
              <Text
                className="text-base font-bold"
                style={{ color: isFollowing ? '#1f2937' : '#ffffff' }}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl items-center justify-center"
              style={{ paddingVertical: 14 }}
              activeOpacity={0.8}
            >
              <Text className="text-base font-bold text-gray-900">
                Mensaje
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white border-y border-gray-100 px-4 mb-2">
          <TouchableOpacity
            onPress={() => setActiveTab('shop')}
            className="flex-1 py-4 items-center"
            style={{
              borderBottomWidth: activeTab === 'shop' ? 3 : 0,
              borderBottomColor: '#1f2937'
            }}
          >
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons
                name={activeTab === 'shop' ? 'grid' : 'grid-outline'}
                size={22}
                color={activeTab === 'shop' ? '#1f2937' : '#9ca3af'}
              />
              <Text
                className={`text-sm font-semibold ${activeTab === 'shop' ? 'text-gray-900' : 'text-gray-400'}`}
              >
                Productos
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('content')}
            className="flex-1 py-4 items-center"
            style={{
              borderBottomWidth: activeTab === 'content' ? 3 : 0,
              borderBottomColor: '#1f2937'
            }}
          >
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons
                name={activeTab === 'content' ? 'play-circle' : 'play-circle-outline'}
                size={22}
                color={activeTab === 'content' ? '#1f2937' : '#9ca3af'}
              />
              <Text
                className={`text-sm font-semibold ${activeTab === 'content' ? 'text-gray-900' : 'text-gray-400'}`}
              >
                Contenido
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'shop' ? (
          // Shop Tab - Product Catalog
          <View className="px-4 pt-4 pb-6">
            {products.length > 0 ? (
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(product)}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      width: cardWidth,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 2
                    }}
                  >
                    {/* Product Image */}
                    <View className="w-full bg-gray-50 relative" style={{ height: cardWidth }}>
                      {product.thumbnailUrl ? (
                        <Image
                          source={{ uri: product.thumbnailUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 justify-center items-center">
                          <Ionicons name="image-outline" size={48} color="#d1d5db" />
                        </View>
                      )}
                      {/* Favorite button */}
                      <TouchableOpacity className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 justify-center items-center shadow-sm">
                        <Ionicons name="heart-outline" size={20} color="#1f2937" />
                      </TouchableOpacity>
                      {/* Discount badge */}
                      {product.compareAtPrice && product.price && (
                        <View className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded-md">
                          <Text className="text-xs font-bold text-white">
                            {String(Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100))}%
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Info */}
                    <View className="p-3">
                      <Text className="text-sm font-semibold text-gray-900 mb-2" numberOfLines={2} style={{ lineHeight: 18 }}>
                        {product.name}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-lg font-bold text-gray-900">
                            ${String(product.price)}
                          </Text>
                          {product.compareAtPrice && (
                            <Text className="text-xs text-gray-400 line-through">
                              ${String(product.compareAtPrice)}
                            </Text>
                          )}
                        </View>
                        {product.rating != null && (
                          <View className="flex-row items-center">
                            <Ionicons name="star" size={12} color="#fbbf24" />
                            <Text className="text-xs font-semibold text-gray-700 ml-1">
                              {String(product.rating)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="w-full py-20 items-center">
                <Ionicons name="bag-outline" size={64} color="#d1d5db" />
                <Text className="text-base text-gray-400 mt-4">
                  No hay productos disponibles
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Content Tab - Instagram style with inline filters
          <View>
            {/* Compact Filter Bar - Instagram style - Always visible */}
            <View className="px-4 py-3 border-b border-gray-100">
              <View className="flex-row items-center" style={{ gap: 24 }}>
                <TouchableOpacity
                  onPress={() => setContentFilter('all')}
                  className="flex-row items-center"
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="apps"
                    size={18}
                    color={contentFilter === 'all' ? '#1f2937' : '#9ca3af'}
                  />
                  <Text
                    className={`text-xs font-semibold ml-1 ${
                      contentFilter === 'all' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setContentFilter('videos')}
                  className="flex-row items-center"
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="play-circle"
                    size={18}
                    color={contentFilter === 'videos' ? '#1f2937' : '#9ca3af'}
                  />
                  <Text
                    className={`text-xs font-semibold ml-1 ${
                      contentFilter === 'videos' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    Videos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setContentFilter('photos')}
                  className="flex-row items-center"
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="image"
                    size={18}
                    color={contentFilter === 'photos' ? '#1f2937' : '#9ca3af'}
                  />
                  <Text
                    className={`text-xs font-semibold ml-1 ${
                      contentFilter === 'photos' ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    Fotos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Area */}
            {filteredContent.length > 0 ? (
              <View className="flex-row flex-wrap px-0.5 pb-6" style={{ gap: 2 }}>
                {filteredContent.map((content, index) => (
                  <TouchableOpacity
                    key={content.id || index}
                    activeOpacity={0.95}
                    onPress={() => handleContentPress(content)}
                    className="bg-gray-50 relative"
                    style={{
                      width: (width - 4) / 2,
                      height: ((width - 4) / 2) * 1.5,
                    }}
                  >
                    {content.thumbnailUrl ? (
                      <Image
                        source={{ uri: content.thumbnailUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex-1 justify-center items-center">
                        <Ionicons
                          name={content.type === 'video' ? 'play-circle' : 'image'}
                          size={48}
                          color="#d1d5db"
                        />
                      </View>
                    )}

                    {/* Video indicator */}
                    {content.type === 'video' && (
                      <View className="absolute top-2 right-2">
                        <Ionicons name="play-circle" size={22} color="rgba(255,255,255,0.95)" />
                      </View>
                    )}

                    {/* Multiple images indicator */}
                    {content.media?.length > 1 && (
                      <View className="absolute top-2 right-2">
                        <Ionicons name="copy" size={20} color="rgba(255,255,255,0.95)" />
                      </View>
                    )}

                    {/* View count overlay for videos */}
                    {content.type === 'video' && content.viewCount > 0 && (
                      <View className="absolute bottom-2 left-2 flex-row items-center bg-black/50 rounded-md px-2 py-1">
                        <Ionicons name="play" size={12} color="#ffffff" />
                        <Text className="text-xs font-bold text-white ml-1">
                          {content.viewCount > 1000 ? `${(content.viewCount / 1000).toFixed(1)}K` : String(content.viewCount)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="w-full py-20 items-center">
                <Ionicons name="images-outline" size={64} color="#d1d5db" />
                <Text className="text-base text-gray-400 mt-4">
                  No hay contenido disponible
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={productDetailVisible}
        productId={selectedProductId}
        currentBusinessId={business?.id}
        onClose={() => {
          setProductDetailVisible(false);
          setSelectedProductId(null);
        }}
      />
    </SafeAreaView>
  );
}
