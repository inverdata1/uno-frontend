import React, { useState } from 'react';
import { View, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui/text';
import { cn } from '../../../../shared/utils/cn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * PostCard Component
 * Instagram-style post card with images/carousel and product tagging
 *
 * @param {object} post - Post data from API
 * @param {function} onPress - Callback when post is pressed
 * @param {function} onLike - Callback when like is pressed
 * @param {function} onComment - Callback when comment is pressed
 * @param {function} onShare - Callback when share is pressed
 * @param {function} onSave - Callback when save is pressed
 * @param {function} onBusinessPress - Callback when business name/avatar is pressed
 * @param {function} onProductPress - Callback when tagged product is pressed
 * @param {boolean} isLiked - Whether post is liked by current user
 * @param {boolean} isSaved - Whether post is saved by current user
 * @param {object} businessData - Business info (name, logo)
 */
export const PostCard = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onSave,
  onBusinessPress,
  onProductPress,
  isLiked = false,
  isSaved = false,
  businessData,
  className
}) => {
  const {
    type,
    media = [],
    caption,
    taggedProducts = [],
    likeCount = 0,
    commentCount = 0,
    shareCount = 0,
    createdAt
  } = post;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const isCarousel = type === 'carousel' && media.length > 1;

  return (
    <View className={cn('bg-white mb-2', className)}>
      {/* Header */}
      <Pressable
        onPress={onBusinessPress}
        className="flex-row items-center px-4 py-3"
      >
        <Image
          source={{ uri: businessData?.logo }}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-sm">{businessData?.name}</Text>
          <Text className="text-xs text-gray-500">
            {getTimeAgo(createdAt)}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
      </Pressable>

      {/* Media */}
      <View className="relative">
        {isCarousel ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {media.map((item, index) => (
              <Image
                key={index}
                source={{ uri: item.url }}
                className="bg-gray-100"
                style={{ width: SCREEN_WIDTH, aspectRatio: 1 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <Image
            source={{ uri: media[0]?.url }}
            className="w-full bg-gray-100"
            style={{ aspectRatio: 1 }}
            resizeMode="cover"
          />
        )}

        {/* Carousel Indicator */}
        {isCarousel && (
          <View className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">
              {currentImageIndex + 1}/{media.length}
            </Text>
          </View>
        )}

        {/* Tagged Products Indicator */}
        {taggedProducts.length > 0 && (
          <Pressable
            onPress={() => onProductPress?.(taggedProducts[0])}
            className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-full flex-row items-center shadow-sm"
          >
            <Ionicons name="pricetag" size={14} color="#6B7280" />
            <Text className="text-xs font-medium ml-1">
              Ver productos
            </Text>
          </Pressable>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center space-x-4">
          {/* Like */}
          <Pressable onPress={onLike} className="flex-row items-center" hitSlop={8}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#DC2626' : '#000'}
            />
            {likeCount > 0 && (
              <Text className="text-sm font-medium ml-1">{formatCount(likeCount)}</Text>
            )}
          </Pressable>

          {/* Comment */}
          <Pressable onPress={onComment} className="flex-row items-center ml-4" hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={22} color="#000" />
            {commentCount > 0 && (
              <Text className="text-sm font-medium ml-1">{formatCount(commentCount)}</Text>
            )}
          </Pressable>

          {/* Share */}
          <Pressable onPress={onShare} className="ml-4" hitSlop={8}>
            <Ionicons name="paper-plane-outline" size={22} color="#000" />
          </Pressable>
        </View>

        {/* Save */}
        <Pressable onPress={onSave} hitSlop={8}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#000' : '#000'}
          />
        </Pressable>
      </View>

      {/* Caption */}
      {caption && (
        <View className="px-4 pb-3">
          <Text className="text-sm">
            <Text className="font-semibold">{businessData?.name} </Text>
            {caption}
          </Text>
        </View>
      )}

      {/* View Comments */}
      {commentCount > 0 && (
        <Pressable onPress={onComment} className="px-4 pb-3">
          <Text className="text-sm text-gray-500">
            Ver los {commentCount} comentarios
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// Helper functions
const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - postTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return postTime.toLocaleDateString();
};

const formatCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};
