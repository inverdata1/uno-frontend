import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';

const { width } = Dimensions.get('window');

/**
 * Favorites Screen
 * Shows saved videos and products
 */
export default function FavoritesScreen({ onVideoPress, onProductPress }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'videos', 'products'

  // Mock data - will be replaced with real data from hooks
  const savedVideos = [];
  const savedProducts = [];

  const filteredVideos =
    activeTab === 'products'
      ? []
      : savedVideos.filter(
          (video) =>
            !searchQuery ||
            video.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const filteredProducts =
    activeTab === 'videos'
      ? []
      : savedProducts.filter(
          (product) =>
            !searchQuery ||
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const handleVideoPress = (video) => {
    console.log('Open video:', video.id);
    onVideoPress?.(video);
  };

  const handleProductPress = (product) => {
    console.log('Open product:', product.id);
    onProductPress?.(product);
  };

  const handleRemoveVideo = (videoId) => {
    console.log('Remove video:', videoId);
    // TODO: Implement remove from favorites
  };

  const handleRemoveProduct = (productId) => {
    console.log('Remove product:', productId);
    // TODO: Implement remove from favorites
  };

  const videoCardWidth = (width - 36) / 3; // 3 columns
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
              onPress={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'videos' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'videos' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Videos
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

        {/* Content */}
        <View className="px-4 pt-5">
          {/* Videos Section */}
          {filteredVideos.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Videos guardados
              </Text>
              <View className="flex-row flex-wrap gap-1">
                {filteredVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    activeOpacity={0.9}
                    onPress={() => handleVideoPress(video)}
                    className="rounded-lg overflow-hidden bg-gray-50 relative"
                    style={{
                      width: videoCardWidth,
                      height: videoCardWidth * 1.6,
                    }}
                  >
                    {video.thumbnailUrl ? (
                      <Image
                        source={{ uri: video.thumbnailUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex-1 justify-center items-center">
                        <Ionicons name="play-circle" size={32} color="#cbd5e1" />
                      </View>
                    )}
                    {/* Play icon overlay */}
                    <View className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 justify-center items-center">
                      <Ionicons name="play" size={12} color="#ffffff" />
                    </View>
                    {/* Remove heart */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveVideo(video.id);
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
                        {product.compareAtPrice && (
                          <Text className="text-sm text-gray-400 line-through ml-1.5">
                            ${product.compareAtPrice}
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
          {filteredVideos.length === 0 && filteredProducts.length === 0 && (
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
                  : 'Guarda videos y productos para verlos más tarde'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
