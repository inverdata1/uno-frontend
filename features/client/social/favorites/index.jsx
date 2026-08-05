import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../../shared/components/ui';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { colors } from '../../../../shared/utils/colors';
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
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'posts', 'products'

  const { data, isLoading } = useFavorites(user?.id);
  const togglePost = useToggleFavoritePost();
  const toggleProduct = useToggleFavoriteProduct();

  const savedPosts = data?.posts;
  const savedProducts = data?.products;

  const filteredPosts = useMemo(() => {
    const posts = savedPosts || [];
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
    const products = savedProducts || [];
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
    if (post.thumbnailUrl) return post.thumbnailUrl;
    const firstMedia = Array.isArray(post.media) ? post.media[0] : null;
    return typeof firstMedia === 'string' ? firstMedia : firstMedia?.url;
  };

  const postCardWidth = (width - 36) / 3; // 3 columns
  const productCardWidth = (width - 48) / 2; // 2 columns

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]} // Make search and tabs sticky
      >
        {/* Header */}
        <View className="px-4 pt-3 pb-4 border-b border-gray-100">
          <Text className="text-3xl font-bold text-red-500">Favoritos</Text>
        </View>

        {/* Search and Filters - Sticky */}
        <View className="bg-white">
          {/* Search Bar */}
          <View className="px-4 pt-3">
            <View className="bg-gray-50 rounded-lg p-3 flex-row items-center">
              <Ionicons name="search" size={18} color="#64748b" className="mr-2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar en favoritos..."
                placeholderTextColor="#94a3b8"
                className="text-gray-900 text-base flex-1"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row px-4 py-3 gap-2 border-b border-gray-100">
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'all' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'all' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'posts' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'posts' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Publicaciones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'products' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'products' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Productos
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
