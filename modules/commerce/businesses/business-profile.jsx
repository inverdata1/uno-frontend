import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, TouchableOpacity, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';

const { width } = Dimensions.get('window');

/**
 * Business Profile Screen
 * Shows business banner, info, followers, and shop/content tabs
 */
export default function BusinessProfile({ business, onClose }) {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'content'
  const [isFollowing, setIsFollowing] = useState(business?.isFollowing || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState('all'); // 'all', 'videos', 'photos'

  // Mock data - will be replaced with real data
  const products = business?.products || [];
  const contentPosts = business?.contentPosts || [];

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    console.log('Toggle follow:', business?.id);
  };

  const handleProductPress = (product) => {
    console.log('Open product:', product.id);
    // TODO: Navigate to product detail
  };

  const handleContentPress = (content) => {
    console.log('Open content:', content.id);
    // TODO: Navigate to content viewer (video or image)
  };

  const filteredContent = contentPosts.filter((post) => {
    if (contentFilter === 'videos') return post.type === 'video';
    if (contentFilter === 'photos') return post.type === 'image';
    return true;
  });

  const cardWidth = (width - 48) / 2; // 2 columns with padding

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]} // Make the tab switcher sticky (after banner section)
      >
        {/* Banner and Business Info Container */}
        <View>
          {/* Banner Image with Header Overlay */}
          <View className="w-full bg-gray-100" style={{ height: 200 }}>
            {business?.bannerUrl ? (
              <Image
                source={{ uri: business.bannerUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#f3f4f6' }}>
                <Ionicons name="image-outline" size={64} color="#d1d5db" />
              </View>
            )}

            {/* Back Button Overlay */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute z-50 p-3"
              style={{ top: 12, left: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Business Info Section */}
          <View className="px-4 bg-white" style={{ paddingTop: 0 }}>
            {/* Logo overlapping banner with heart button */}
            <View style={{ marginTop: -40, marginBottom: 12 }}>
              <View className="flex-row items-end justify-between">
                <View
                  className="rounded-full bg-white overflow-hidden"
                  style={{
                    width: 80,
                    height: 80,
                    borderWidth: 4,
                    borderColor: '#ffffff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
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
                      <Ionicons name="storefront" size={36} color="#9ca3af" />
                    </View>
                  )}
                </View>

                {/* Heart button next to logo */}
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mb-1"
                  style={{ marginRight: 4 }}
                >
                  <Ionicons name="heart-outline" size={24} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Business Name */}
            <Text className="text-lg font-bold text-gray-900 mb-0.5">
              {business?.name || 'Nombre'}
            </Text>

            {/* Category */}
            <Text className="text-sm text-gray-600 mb-0.5">
              {business?.category || 'Categoria'}
            </Text>

            {/* Address / Hours */}
            <Text className="text-sm text-gray-600 mb-3">
              {business?.address || business?.hours || 'Dirección / Horario'}
            </Text>

            {/* Followers and Follow Button */}
            <View className="flex-row items-center mb-3" style={{ justifyContent: 'space-between' }}>
              <Text className="text-sm text-gray-900">
                <Text className="font-bold">Seguidores {business?.followersCount || 150}</Text>
              </Text>
              <TouchableOpacity
                onPress={handleFollowToggle}
                className="rounded-full"
                style={{
                  backgroundColor: isFollowing ? '#ffffff' : '#ef4444',
                  borderWidth: 1,
                  borderColor: isFollowing ? '#d1d5db' : '#ef4444',
                  paddingHorizontal: 24,
                  paddingVertical: 6,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isFollowing ? '#1f2937' : '#ffffff' }}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text className="text-sm text-gray-700 leading-5 mb-4">
              {business?.description || 'Descripcion'}
            </Text>

            {/* Description Carousel - Circular avatars */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 12 }}
            >
              {['SAS', 'SUMMER', 'PRESS', 'ALTUZARRA', 'MOTHERS'].map((label, index) => (
                <View key={index} className="items-center">
                  <View
                    className="rounded-full bg-gray-200 overflow-hidden mb-1"
                    style={{ width: 56, height: 56 }}
                  >
                    <View className="flex-1 justify-center items-center">
                      <Ionicons name="person-circle-outline" size={32} color="#9ca3af" />
                    </View>
                  </View>
                  <Text className="text-xs text-gray-600">{label}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Promotional Banner */}
            {business?.promotionalBanner ? (
              <View className="w-full rounded-xl overflow-hidden mb-4" style={{ height: 140 }}>
                <Image
                  source={{ uri: business.promotionalBanner }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View className="w-full rounded-xl overflow-hidden mb-4" style={{ height: 140, backgroundColor: '#e7a5a5' }}>
                <View className="flex-1 justify-center items-center">
                  <Text className="text-white text-lg font-bold">Victoria's Secret Body Care</Text>
                </View>
              </View>
            )}

            {/* Search Bar (only in shop tab) */}
            {activeTab === 'shop' && (
              <View className="bg-gray-50 rounded-lg flex-row items-center mb-4" style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar productos..."
                  placeholderTextColor="#9ca3af"
                  className="text-gray-900 text-sm flex-1 ml-2"
                />
              </View>
            )}
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveTab('shop')}
            className="flex-1 py-3 items-center"
            style={{
              borderBottomWidth: activeTab === 'shop' ? 2 : 0,
              borderBottomColor: '#000000'
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'shop' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('content')}
            className="flex-1 py-3 items-center"
            style={{
              borderBottomWidth: activeTab === 'content' ? 2 : 0,
              borderBottomColor: '#000000'
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'content' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Contenido
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'shop' ? (
          // Shop Tab - Product Catalog
          <View className="px-4 pt-5">
            <View className="flex-row flex-wrap gap-3">
              {products.length > 0 ? (
                products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(product)}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100"
                    style={{ width: cardWidth }}
                  >
                    {/* Product Image */}
                    <View className="w-full bg-gray-50" style={{ height: cardWidth }}>
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
                      {/* Favorite button */}
                      <TouchableOpacity className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 justify-center items-center shadow-sm">
                        <Ionicons name="heart-outline" size={18} color="#1f2937" />
                      </TouchableOpacity>
                    </View>

                    {/* Product Info */}
                    <View className="p-3">
                      <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
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
                ))
              ) : (
                <View className="w-full py-10 items-center">
                  <Text className="text-sm text-gray-400">
                    No hay productos disponibles
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // Content Tab - Feed with Filter
          <View className="pt-3">
            {/* Filter */}
            <View className="px-4 mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => setContentFilter('all')}
                  className={`px-4 py-2 rounded-full ${
                    contentFilter === 'all' ? 'bg-gray-900' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      contentFilter === 'all' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setContentFilter('videos')}
                  className={`px-4 py-2 rounded-full ${
                    contentFilter === 'videos' ? 'bg-gray-900' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      contentFilter === 'videos' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    Más video
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setContentFilter('photos')}
                  className={`px-4 py-2 rounded-full ${
                    contentFilter === 'photos' ? 'bg-gray-900' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      contentFilter === 'photos' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    Más visto
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Content Grid */}
            <View>
              <View className="flex-row flex-wrap" style={{ gap: 1 }}>
                {filteredContent.length > 0 ? (
                  filteredContent.map((content, index) => (
                    <TouchableOpacity
                      key={content.id || index}
                      activeOpacity={0.9}
                      onPress={() => handleContentPress(content)}
                      className="bg-gray-50"
                      style={{
                        width: (width - 1) / 2,
                        height: (width - 1) / 2,
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
                            size={40}
                            color="#cbd5e1"
                          />
                        </View>
                      )}
                      {content.type === 'video' && (
                        <View className="absolute top-2 right-2">
                          <Ionicons name="play-circle" size={24} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="w-full py-10 items-center">
                    <Text className="text-sm text-gray-400">
                      No hay contenido disponible
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
