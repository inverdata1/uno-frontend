import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StatusBar, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useProducts } from '../../shared/products/hooks/use-products';
import { usePosts } from '../../shared/social/hooks/use-posts';
import { useToggleFollowBusiness } from '../../shared/social/hooks/use-businesses';
import { useAuthStore } from '../../../core/auth/stores/auth-store';
import ProductDetailModal from '../products/product-detail-modal';
import PostViewer from '../../shared/social/posts/post-viewer';
import ConversationModal from '../../shared/chat/conversation-modal';
import { PostThumbnail } from '../../../shared/components/media/post-thumbnail';
import { BusinessProfileHeader } from '../../shared/business/business-profile-header';
import { shareBusinessCatalog } from '../../../shared/utils/share-catalog';

const { width } = Dimensions.get('window');

/**
 * Business Profile Screen
 * Instagram/TikTok-inspired business profile with immersive design
 */
export default function BusinessProfile({ business, onClose }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const toggleFollowMutation = useToggleFollowBusiness();

  const [activeTab, setActiveTab] = useState('shop');
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(business?.isFollowing));
  const [followersCount, setFollowersCount] = useState(business?.followersCount || 0);
  const [contentFilter, setContentFilter] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);

  useEffect(() => {
    if (typeof business?.isFollowing === 'boolean') {
      setIsFollowing(business.isFollowing);
    }
    if (typeof business?.followersCount === 'number') {
      setFollowersCount(business.followersCount);
    }
  }, [business?.isFollowing, business?.followersCount]);

  // Fetch products and posts using hooks
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    businessId: business?.id,
    limit: 50
  });

  const { data: contentPosts = [], isLoading: isLoadingPosts } = usePosts({
    businessId: business?.id,
    limit: 50
  });

  const averageProductRating = useMemo(() => {
    if (products && products.length > 0) {
      const ratedProducts = products.filter(p => Number(p.rating || 0) > 0);
      if (ratedProducts.length > 0) {
        const total = ratedProducts.reduce((sum, p) => sum + Number(p.rating || 0), 0);
        return (total / ratedProducts.length).toFixed(1);
      }
    }
    return Number(business?.rating || 0).toFixed(1);
  }, [products, business?.rating]);

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
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión como cliente para seguir este negocio.');
      return;
    }
    if (!business?.id) return;

    const previousState = isFollowing;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    toggleFollowMutation.mutate(
      { businessId: business.id, userId: user.id },
      {
        onError: (err) => {
          console.error('Error toggling follow:', err);
          setIsFollowing(previousState);
          setFollowersCount(prev => previousState ? prev + 1 : Math.max(0, prev - 1));
          Alert.alert('Error', 'No se pudo actualizar el estado de seguimiento. Intenta de nuevo.');
        }
      }
    );
  };

  const handleProductPress = (product) => {
    setSelectedProductId(product.id);
    setProductDetailVisible(true);
  };

  const handleContentPress = (content) => {
    setSelectedPost(content);
    setPostViewerVisible(true);
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

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <BusinessProfileHeader
          business={business}
          stats={[
            { label: 'seguidores', singular: 'seguidor', value: followersCount },
            { label: 'productos', singular: 'producto', value: products.length || 0 },
            { label: '', value: averageProductRating, icon: 'star' },
          ]}
          actions={[
            {
              label: isFollowing ? 'Siguiendo' : 'Seguir',
              icon: isFollowing ? 'checkmark' : 'add',
              onPress: handleFollowToggle,
              primary: !isFollowing,
            },
            { label: 'Mensaje', icon: 'chatbubble-ellipses-outline', onPress: () => setChatModalVisible(true) },
            {
              label: 'Compartir',
              icon: 'share-social-outline',
              onPress: () => shareBusinessCatalog({ id: business?.id, name: business?.name }),
              iconOnly: true,
            },
          ]}
          coverOverlay={
            <SafeAreaView edges={['top']} style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
                >
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          }
        />

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
                    <PostThumbnail post={content} iconSize={48} />

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

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={{ name: business?.name, logo: business?.logoUrl }}
          onClose={() => {
            setPostViewerVisible(false);
            setSelectedPost(null);
          }}
          onProductPress={(product) => {
            setPostViewerVisible(false);
            setSelectedPost(null);
            handleProductPress(product);
          }}
        />
      )}

      {/* Conversation Chat Modal with this Business */}
      <ConversationModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        targetParticipant={{
          id: business?.id,
          type: 'business',
          name: business?.name || business?.businessName || 'Negocio',
          avatar: business?.logoUrl || business?.logo || null,
        }}
      />
    </SafeAreaView>
  );
}
