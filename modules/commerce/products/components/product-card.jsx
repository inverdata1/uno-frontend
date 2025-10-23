import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';
import { cn } from '../../../../shared/utils/cn';

/**
 * ProductCard Component
 * Displays product information in a card format
 * Used in: Product catalog, recommendations, search results
 *
 * @param {object} product - Product data from API
 * @param {string} variant - 'grid' | 'list' (default: grid)
 * @param {function} onPress - Callback when card is pressed
 * @param {function} onFavorite - Callback when favorite is pressed
 * @param {boolean} isFavorited - Whether product is favorited
 */
export const ProductCard = ({
  product,
  variant = 'grid',
  onPress,
  onFavorite,
  isFavorited = false,
  className
}) => {
  const {
    name,
    thumbnailUrl,
    images,
    price,
    compareAtPrice,
    currency = 'USD',
    rating,
    reviewCount,
    isFeatured
  } = product;

  const displayImage = thumbnailUrl || images?.[0]?.url || images?.[0];
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  if (variant === 'list') {
    return (
      <Pressable
        onPress={onPress}
        className={cn('flex-row bg-white rounded-lg p-3 mb-3 border border-gray-100', className)}
      >
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: displayImage }}
            className="w-24 h-24 rounded-lg bg-gray-100"
            resizeMode="cover"
          />
          {hasDiscount && (
            <View className="absolute top-1 left-1 bg-red-500 px-1.5 py-0.5 rounded">
              <Text className="text-white text-xs font-semibold">-{discountPercent}%</Text>
            </View>
          )}
          {isFeatured && (
            <View className="absolute top-1 right-1">
              <Ionicons name="star" size={16} color="#F59E0B" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="font-semibold text-base" numberOfLines={2}>
              {name}
            </Text>

            {rating > 0 && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-xs text-gray-600 ml-1">
                  {rating.toFixed(1)} ({reviewCount})
                </Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-lg">
                ${price.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text className="text-xs text-gray-400 line-through">
                  ${compareAtPrice.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Favorite Button */}
            <Pressable
              onPress={onFavorite}
              className="p-2"
              hitSlop={8}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? '#DC2626' : '#9CA3AF'}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  // Grid variant (default)
  return (
    <Pressable
      onPress={onPress}
      className={cn('bg-white rounded-lg overflow-hidden border border-gray-100', className)}
      style={{ width: '48%' }}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: displayImage }}
          className="w-full aspect-square bg-gray-100"
          resizeMode="cover"
        />

        {/* Badges */}
        {hasDiscount && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded">
            <Text className="text-white text-xs font-semibold">-{discountPercent}%</Text>
          </View>
        )}

        {isFeatured && (
          <View className="absolute top-2 right-2 bg-black/20 rounded-full p-1">
            <Ionicons name="star" size={16} color="#F59E0B" />
          </View>
        )}

        {/* Favorite Button */}
        <Pressable
          onPress={onFavorite}
          className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
          hitSlop={8}
        >
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorited ? '#DC2626' : '#9CA3AF'}
          />
        </Pressable>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="font-semibold text-sm" numberOfLines={2}>
          {name}
        </Text>

        {rating > 0 && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-xs text-gray-600 ml-1">
              {rating.toFixed(1)} ({reviewCount})
            </Text>
          </View>
        )}

        {/* Price */}
        <View className="mt-2">
          <Text className="font-bold text-base">
            ${price.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text className="text-xs text-gray-400 line-through">
              ${compareAtPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
