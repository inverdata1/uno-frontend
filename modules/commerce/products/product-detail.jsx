import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import BusinessProfile from '../businesses/business-profile';

const { width } = Dimensions.get('window');

/**
 * Product Detail Screen
 * Instagram/TikTok Shop inspired design with floating header and modern layout
 */
export default function ProductDetail({ product, onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(product?.isFavorited || false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [businessProfileVisible, setBusinessProfileVisible] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Mock data - will be replaced with real data
  const images = product?.images || [product?.thumbnailUrl || 'https://via.placeholder.com/400'];
  const relatedVideos = product?.relatedVideos || [];
  const variants = product?.variants || [];

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      productId: product?.id,
      quantity,
      variants: selectedVariants,
    });
    // TODO: Implement add to cart functionality
  };

  const handleBusinessPress = () => {
    setBusinessProfileVisible(true);
  };

  const handleVideoPress = (video) => {
    console.log('Open video:', video.id);
    // TODO: Open video viewer with this video
  };

  const handleFollowToggle = (e) => {
    e.stopPropagation();
    console.log('Toggle follow business:', product?.business?.id);
    // TODO: Implement follow functionality
  };

  const toggleVariant = (variantName, option) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        {/* Floating Back Button - Instagram Style */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute left-6 z-50 p-3"
          style={{ top: 12, backgroundColor: 'transparent' }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={32}
            color="#ffffff"
          />
        </TouchableOpacity>

        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          overScrollMode="never"
        >
        {/* Full-Bleed Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {images.map((imageUrl, index) => (
              <View key={index} style={{ width, height: width * 1.1, backgroundColor: '#f3f4f6' }}>
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onLoadStart={() => {
                    console.log('Image loading started:', imageUrl);
                    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', imageUrl);
                    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                  }}
                  onError={(error) => {
                    console.log('Image load error:', imageUrl, error.nativeEvent.error);
                    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                    setImageErrors(prev => ({ ...prev, [index]: true }));
                  }}
                />
                {/* Loading indicator */}
                {imageLoadingStates[index] && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
                    <ActivityIndicator size="large" color="#ef4444" />
                    <Text style={{ marginTop: 12, color: '#6b7280' }}>Cargando imagen...</Text>
                  </View>
                )}
                {/* Error state */}
                {imageErrors[index] && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
                    <Ionicons name="image-outline" size={64} color="#9ca3af" />
                    <Text style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>No se pudo cargar la imagen</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full ${
                    selectedImageIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info Section with Favorite Button */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            {/* Left Side: Price, Name, Rating */}
            <View className="flex-1 pr-3">
              {/* Price */}
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl font-bold text-gray-900">
                  ${product?.price || '0.00'}
                </Text>
                {product?.compareAtPrice && (
                  <>
                    <Text className="text-lg text-gray-400 ml-2" style={{ textDecorationLine: 'line-through', textDecorationColor: '#9ca3af' }}>
                      ${product.compareAtPrice}
                    </Text>
                    <View className="ml-2 px-2 py-1 bg-red-50 rounded-md items-center justify-center">
                      <Text className="text-xs font-bold text-red-500 leading-tight">
                        {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Title */}
              <Text className="text-xl font-bold text-gray-900 mb-3 leading-7">
                {product?.name || 'Product Name'}
              </Text>

              {/* Rating & Sales */}
              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-sm font-semibold text-gray-900 ml-1">
                    {product?.rating || '4.8'}
                  </Text>
                  <Text className="text-sm text-gray-500 ml-1">
                    ({product?.reviewCount || '127'})
                  </Text>
                </View>
                {product?.soldCount && (
                  <Text className="text-sm text-gray-500">
                    {product.soldCount} vendidos
                  </Text>
                )}
              </View>
            </View>

            {/* Right Side: Favorite Button - Aligned to center */}
            <TouchableOpacity
              onPress={() => setIsFavorited(!isFavorited)}
              className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center self-center"
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorited ? '#ef4444' : '#1f2937'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Header - Clickable Card */}
        <TouchableOpacity
          onPress={handleBusinessPress}
          activeOpacity={0.7}
          className="mx-4 mb-4 p-3 bg-gray-50 rounded-xl flex-row items-center"
        >
          <View className="w-12 h-12 rounded-full bg-white mr-3 overflow-hidden border-2 border-white shadow-sm">
            {product?.business?.logoUrl ? (
              <Image
                source={{ uri: product.business.logoUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 justify-center items-center bg-gray-100">
                <Ionicons name="storefront" size={20} color="#9ca3af" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 mb-0.5">
              {product?.business?.name || 'Business Name'}
            </Text>
            <Text className="text-xs text-gray-500">
              Ver perfil del negocio
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFollowToggle}
            className="px-4 py-2 rounded-full bg-red-500"
          >
            <Text className="text-sm font-semibold text-white">Seguir</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Description */}
        <View className="px-4 mb-8">
          <Text className="text-base text-gray-600 leading-7">
            {product?.description || 'Product description goes here...'}
          </Text>
        </View>

        {/* Related Videos - TikTok Style */}
        {relatedVideos.length > 0 && (
          <View className="mb-6">
            <View className="px-4 mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  Videos con este producto
                </Text>
                <Text className="text-sm text-gray-500">
                  {relatedVideos.length} videos
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="gap-3"
            >
              {relatedVideos.map((video, index) => (
                <TouchableOpacity
                  key={video.id}
                  activeOpacity={0.9}
                  onPress={() => handleVideoPress(video)}
                  className="relative rounded-xl overflow-hidden"
                  style={{ width: 130, height: 200, marginRight: index < relatedVideos.length - 1 ? 12 : 0 }}
                >
                  {video.thumbnailUrl ? (
                    <Image
                      source={{ uri: video.thumbnailUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 justify-center items-center bg-gray-100">
                      <Ionicons name="play-circle" size={40} color="#9ca3af" />
                    </View>
                  )}
                  {/* Play overlay */}
                  <View className="absolute bottom-2 left-2 flex-row items-center">
                    <Ionicons name="play" size={12} color="#fff" />
                    <Text className="text-xs font-semibold text-white ml-1">
                      {video.views || '1.2K'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Variants - Shopify Style */}
        {variants.length > 0 && (
          <View className="px-4 mb-4">
            {variants.map((variant) => (
              <View key={variant.name} className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-4">
                  {variant.name}
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {variant.options?.map((option) => {
                    const isSelected = selectedVariants[variant.name] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => toggleVariant(variant.name, option)}
                        style={{
                          minWidth: 60,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                          backgroundColor: isSelected ? '#1f2937' : '#f3f4f6'
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: isSelected ? '#ffffff' : '#1f2937'
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Specifications - Collapsible */}
        {product?.specifications && Object.keys(product.specifications).length > 0 && (
          <View className="px-4 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Especificaciones
            </Text>
            <View className="bg-gray-50 rounded-xl p-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} className="flex-row justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <Text className="text-sm text-gray-600 capitalize">
                    {key}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}


        {/* Quantity Selector - Modern Design */}
        <View className="px-4 mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Cantidad
          </Text>
          <View
            className="flex-row items-center rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#f9fafb',
              borderWidth: 1,
              borderColor: '#e5e7eb'
            }}
          >
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              activeOpacity={0.7}
              style={{
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: quantity === 1 ? 'transparent' : '#ffffff'
              }}
            >
              <Ionicons
                name="remove"
                size={24}
                color={quantity === 1 ? '#d1d5db' : '#1f2937'}
              />
            </TouchableOpacity>

            <View className="flex-1 items-center justify-center" style={{ height: 56 }}>
              <Text className="text-2xl font-bold text-gray-900">
                {quantity}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              activeOpacity={0.7}
              style={{
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ffffff'
              }}
            >
              <Ionicons name="add" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Add to Cart - Sticky like TikTok Shop */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-2xl" style={{ elevation: 10 }}>
        <TouchableOpacity
          onPress={handleAddToCart}
          className="bg-red-500 py-4 rounded-xl items-center active:bg-red-600"
        >
          <Text className="text-lg font-bold text-white">
            Añadir al carrito · ${((product?.price || 0) * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Business Profile Modal */}
      <Modal
        visible={businessProfileVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setBusinessProfileVisible(false)}
      >
        <BusinessProfile
          business={product?.business}
          onClose={() => setBusinessProfileVisible(false)}
        />
      </Modal>
      </SafeAreaView>
  );
}
