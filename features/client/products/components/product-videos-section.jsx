import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../shared/components/ui';
import { colors } from '../../../../shared/utils/colors';
import { useProductVideos } from '../../../../shared/hooks/use-product-posts';

/**
 * Product Videos Section - TikTok/Instagram Reels Style
 * Shows videos from posts that tagged this product
 */
export const ProductVideosSection = ({ productId, onVideoPress }) => {
  const { data: videos = [], isLoading } = useProductVideos(productId);

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <View style={{
      paddingVertical: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.bg.primary
    }}>
      {/* Section Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="play-circle" size={24} color={colors.primary[500]} />
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary
          }}>
            Videos del producto
          </Text>
        </View>
        <Text style={{
          fontSize: 14,
          color: colors.text.secondary
        }}>
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </Text>
      </View>

      {/* Horizontal Video Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 12
        }}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPress={() => onVideoPress?.(video)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const VideoCard = ({ video, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 140,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.bg.secondary
      }}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: video.thumbnailUrl || video.media?.[0]?.thumbnailUrl }}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.bg.secondary
        }}
        resizeMode="cover"
      />

      {/* Play Overlay */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name="play" size={24} color={colors.primary[500]} />
        </View>
      </View>

      {/* View Count */}
      {video.viewCount > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#fff'
            }}>
              {formatViewCount(video.viewCount)}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const formatViewCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
