import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../../../shared/components/ui';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { colors } from '../../../../shared/utils/colors';
import { resolveMediaUrl } from '../../../../shared/utils/media-url';
import {
  useFavorites,
  useToggleFavoritePost,
  useToggleFavoriteProduct,
} from '../../../shared/social/hooks/use-favorites';

const { width } = Dimensions.get('window');

/**
 * Favorites Screen
 * Shows the user's favorited posts and products (backed by the Favorite model)
 */
export default function FavoritesScreen({ onPostPress, onProductPress }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'posts', 'products'

  const { data, isLoading } = useFavorites(user?.id);
  const togglePost = useToggleFavoritePost();
  const toggleProduct = useToggleFavoriteProduct();

  const savedPosts = data?.posts || [];
  const savedProducts = data?.products || [];
  const totalCount = savedPosts.length + savedProducts.length;

  const filteredPosts = useMemo(() => {
    const posts = savedPosts;
    if (activeTab === 'products') return [];
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.caption?.toLowerCase().includes(q) ||
        post.title?.toLowerCase().includes(q) ||
        post.business?.businessName?.toLowerCase().includes(q)
    );
  }, [savedPosts, searchQuery, activeTab]);

  const filteredProducts = useMemo(() => {
    const products = savedProducts;
    if (activeTab === 'posts') return [];
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(q) ||
        product.business?.businessName?.toLowerCase().includes(q)
    );
  }, [savedProducts, searchQuery, activeTab]);

  const handlePostPress = (post) => {
    onPostPress?.(post);
  };

  const handleProductPress = (product) => {
    onProductPress?.(product);
  };

  const handleRemovePost = (postId) => {
    if (!user?.id) return;
    togglePost.mutate({ postId, userId: user.id });
  };

  const handleRemoveProduct = (productId) => {
    if (!user?.id) return;
    toggleProduct.mutate({ productId, userId: user.id });
  };

  const getPostThumbnail = (post) => {
    if (post.thumbnailUrl) return resolveMediaUrl(post.thumbnailUrl);
    const firstMedia = Array.isArray(post.media) ? post.media[0] : null;
    const raw = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url;
    return resolveMediaUrl(raw);
  };

  const postCardWidth = (width - 36) / 3; // 3 columns
  const productCardWidth = (width - 48) / 2; // 2 columns

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]} // Make search and tabs sticky
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
              Favoritos
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              {totalCount} {totalCount === 1 ? 'elemento guardado' : 'elementos guardados'}
            </Text>
          </View>
        </View>

        {/* Search and Filters - Sticky */}
        <View style={{ backgroundColor: '#ffffff' }}>
          {/* Search Bar */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
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
                placeholder="Buscar en favoritos..."
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

          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9'
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === 'all' ? '#111827' : '#f1f5f9'
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: activeTab === 'all' ? '#ffffff' : '#64748b'
              }}>
                Todos ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === 'posts' ? '#111827' : '#f1f5f9'
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: activeTab === 'posts' ? '#ffffff' : '#64748b'
              }}>
                Publicaciones ({savedPosts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('products')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === 'products' ? '#111827' : '#f1f5f9'
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: activeTab === 'products' ? '#ffffff' : '#64748b'
              }}>
                Productos ({savedProducts.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading */}
        {isLoading && (
          <View className="py-16 items-center">
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        )}

        {/* Content */}
        {!isLoading && (
          <View className="px-4 pt-5">
            {/* Posts Section */}
            {filteredPosts.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Publicaciones guardadas
                </Text>
                <View className="flex-row flex-wrap gap-1">
                  {filteredPosts.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      activeOpacity={0.9}
                      onPress={() => handlePostPress(post)}
                      className="rounded-lg overflow-hidden bg-gray-50 relative"
                      style={{
                        width: postCardWidth,
                        height: postCardWidth * 1.3,
                      }}
                    >
                      {getPostThumbnail(post) ? (
                        <Image
                          source={{ uri: getPostThumbnail(post) }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 justify-center items-center">
                          <Ionicons name="image-outline" size={28} color="#cbd5e1" />
                        </View>
                      )}
                      {/* Video icon overlay */}
                      {post.type === 'video' && (
                        <View className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 justify-center items-center">
                          <Ionicons name="play" size={12} color="#ffffff" />
                        </View>
                      )}
                      {/* Remove heart */}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemovePost(post.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 justify-center items-center"
                      >
                        <Ionicons name="heart" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <View>
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Productos guardados
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {filteredProducts.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      activeOpacity={0.9}
                      onPress={() => handleProductPress(product)}
                      className="bg-white rounded-xl overflow-hidden border border-gray-100"
                      style={{ width: productCardWidth }}
                    >
                      {/* Product Image */}
                      <View
                        className="w-full bg-gray-50"
                        style={{ height: productCardWidth }}
                      >
                        {product.thumbnailUrl ? (
                          <Image
                            source={{ uri: product.thumbnailUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="flex-1 justify-center items-center">
                            <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                          </View>
                        )}
                        {/* Favorite button - filled */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveProduct(product.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 justify-center items-center shadow-sm"
                        >
                          <Ionicons name="heart" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      {/* Product Info */}
                      <View className="p-3">
                        <Text
                          className="text-sm font-semibold text-gray-900 mb-1"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-base font-bold text-gray-900">
                            ${product.price}
                          </Text>
                          {product.discountPrice && (
                            <Text className="text-sm text-gray-400 line-through ml-1.5">
                              ${product.discountPrice}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Empty State */}
            {filteredPosts.length === 0 && filteredProducts.length === 0 && (
              <View className="py-16 items-center">
                <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                  <Ionicons name="heart-outline" size={40} color="#ef4444" />
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  {searchQuery ? 'No se encontraron resultados' : 'No tienes favoritos aún'}
                </Text>
                <Text className="text-sm text-gray-600 text-center px-8">
                  {searchQuery
                    ? 'Intenta con otras palabras clave'
                    : 'Guarda publicaciones y productos para verlos más tarde'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
