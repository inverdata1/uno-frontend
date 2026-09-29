import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Pressable, ScrollView, Dimensions, Share, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../../core/auth/stores/auth-store';
import { apiClient } from '../../../../../shared/config/api-client';
import { TaggedProductsModal } from './tagged-products-modal';
import { PostOptionsModal } from './post-options-modal';
import { colors } from '../../../../../shared/utils/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);

/**
 * PostCard Component
 * Modern social post card matching reference design:
 * - Rounded media container with overlay view tag (e.g. 4.2K) & author handle tag (@handle)
 * - Tagged products quick button with multi-business cart integration
 * - Author row below media with avatar, name, and 3-dots options menu
 * - Social interaction bar (Likes, Comments, Share, Save)
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
  const { user } = useAuthStore();
  
  if (!post) return null;

  const {
    type,
    caption,
    likeCount = 0,
    commentCount = 0,
    shareCount = 0,
    createdAt,
    updatedAt
  } = post;

  // Safely parse media array
  let media = [];
  if (Array.isArray(post.media)) {
    media = post.media;
  } else if (typeof post.media === 'string') {
    try {
      const parsed = JSON.parse(post.media);
      media = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      media = post.media ? [{ url: post.media }] : [];
    }
  }

  // Safely parse taggedProducts array
  let taggedProducts = [];
  if (Array.isArray(post.taggedProducts)) {
    taggedProducts = post.taggedProducts;
  } else if (typeof post.taggedProducts === 'string') {
    try {
      const parsed = JSON.parse(post.taggedProducts);
      taggedProducts = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      taggedProducts = [];
    }
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(Boolean(post?.isLiked || isLiked));
  const [localLikeCount, setLocalLikeCount] = useState(Number(post?.likeCount || 0));

  useEffect(() => {
    setLocalIsLiked(Boolean(post?.isLiked || isLiked));
    setLocalLikeCount(Number(post?.likeCount || 0));
  }, [post?.isLiked, post?.likeCount, isLiked]);

  const handleToggleLike = async () => {
    const nextIsLiked = !localIsLiked;
    const nextCount = nextIsLiked ? localLikeCount + 1 : Math.max(0, localLikeCount - 1);
    
    setLocalIsLiked(nextIsLiked);
    setLocalLikeCount(nextCount);

    try {
      if (onLike) {
        onLike();
      } else {
        const res = await apiClient.patch(`/posts/${post.id}/like`, { userId: user?.id });
        if (res.data && typeof res.data.likeCount === 'number') {
          setLocalLikeCount(res.data.likeCount);
          setLocalIsLiked(res.data.isLiked);
        }
      }
    } catch (err) {
      setLocalIsLiked(!nextIsLiked);
      setLocalLikeCount(localLikeCount);
    }
  };

  const scrollViewRef = useRef(null);
  const isCarousel = (type === 'carousel' || media.length > 1) && media.length > 1;

  // Auto-scroll carousel every 5 seconds if multi-image post
  useEffect(() => {
    if (!isCarousel || media.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % media.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isCarousel, media.length]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CARD_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleSharePost = async () => {
    try {
      if (onShare) {
        onShare();
        return;
      }
      await Share.share({
        message: `¡Mira esta publicación de ${businessData?.name || 'UNO Delivery'}!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formattedTimeAgo = getTimeAgo(createdAt || updatedAt);
  const businessName = businessData?.name || post.businessName || 'Negocio';
  const handleTag = businessName.toLowerCase().replace(/\s+/g, '');
  const viewsDisplay = formatCount(Math.max((localLikeCount * 3) + 120, 420));

  return (
    <View style={{
      backgroundColor: '#ffffff',
      marginHorizontal: CARD_MARGIN,
      marginBottom: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#f1f5f9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
      overflow: 'hidden'
    }}>
      {/* Media Box with Rounded Corners and Overlays */}
      <View style={{ position: 'relative', width: CARD_WIDTH, height: CARD_WIDTH * 0.95, overflow: 'hidden' }}>
        <Pressable onPress={onPress} style={{ width: '100%', height: '100%' }}>
          {isCarousel ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {media.map((item, index) => (
                <Image
                  key={index}
                  source={{ uri: item.url || item }}
                  style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.95 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={{ uri: media[0]?.url || media[0] }}
              style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.95 }}
              resizeMode="cover"
            />
          )}
        </Pressable>

        {/* Top-Right Stats Pill (4.2K style from Reference) */}
        <View style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}>
          <Ionicons name={post.type === 'video' ? 'play' : 'eye'} size={13} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
            {viewsDisplay}
          </Text>
        </View>

        {/* Carousel pagination indicator (e.g. 1/3) */}
        {isCarousel && (
          <View style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10
          }}>
            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
              {currentImageIndex + 1}/{media.length}
            </Text>
          </View>
        )}

        {/* Video play badge if video */}
        {post.type === 'video' && (
          <Pressable
            onPress={onPress}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -24 }, { translateY: -24 }],
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="play" size={24} color="#ffffff" style={{ marginLeft: 2 }} />
          </Pressable>
        )}

        {/* Bottom-Left Username Tag Overlay (@handle from Reference) */}
        <View style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 12
        }}>
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
            @{handleTag}
          </Text>
        </View>

        {/* Bottom-Right Tagged Products Chip */}
        {taggedProducts.length > 0 && (
          <TouchableOpacity
            onPress={() => setProductsModalVisible(true)}
            activeOpacity={0.85}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: '#ef4444',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4
            }}
          >
            <Ionicons name="cart" size={14} color="#ffffff" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
              Comprar ({taggedProducts.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Dots for Carousel */}
      {isCarousel && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 8, gap: 4 }}>
          {media.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentImageIndex === index ? 14 : 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: currentImageIndex === index ? '#ef4444' : '#e2e8f0',
              }}
            />
          ))}
        </View>
      )}

      {/* Author Row (Below Media - Matching Reference) */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 6
      }}>
        <Pressable
          onPress={onBusinessPress}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#f1f5f9',
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: '#ef4444'
          }}>
            {businessData?.logo ? (
              <Image
                source={{ uri: businessData.logo }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444' }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>
                  {businessName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                {businessName}
              </Text>
              <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
            </View>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              {formattedTimeAgo}
            </Text>
          </View>
        </Pressable>

        {/* 3 Dots Menu Button */}
        <TouchableOpacity
          onPress={() => setOptionsModalVisible(true)}
          style={{ padding: 6 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Caption Section */}
      {caption ? (
        <View style={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, color: '#334155', lineHeight: 18 }} numberOfLines={3}>
            {caption}
          </Text>
        </View>
      ) : null}

      {/* Action Buttons Bar: Like, Comment, Share, Save */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Like Button */}
          <TouchableOpacity
            onPress={handleToggleLike}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
          >
            <Ionicons
              name={localIsLiked ? 'heart' : 'heart-outline'}
              size={21}
              color={localIsLiked ? '#ef4444' : '#475569'}
            />
            <Text style={{ fontSize: 12, fontWeight: localIsLiked ? '700' : '600', color: localIsLiked ? '#ef4444' : '#475569' }}>
              {localLikeCount > 0 ? formatCount(localLikeCount) : '0'}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            onPress={onComment}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
          >
            <Ionicons name="chatbubble-outline" size={19} color="#475569" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
              {commentCount > 0 ? formatCount(commentCount) : '0'}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleSharePost}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
          >
            <Ionicons name="paper-plane-outline" size={19} color="#475569" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
              {shareCount > 0 ? formatCount(shareCount) : 'Compartir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tagged Products shortcut button */}
        {taggedProducts.length > 0 && (
          <TouchableOpacity
            onPress={() => setProductsModalVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#fef2f2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8
            }}
          >
            <Ionicons name="bag-handle" size={14} color="#ef4444" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#ef4444' }}>
              Productos
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <TaggedProductsModal
        visible={productsModalVisible}
        onClose={() => setProductsModalVisible(false)}
        taggedProducts={taggedProducts}
        businessId={post.businessId}
        businessData={businessData}
        onProductPress={onProductPress}
      />

      <PostOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        post={post}
        businessData={businessData}
        isSaved={isSaved}
        onSave={onSave}
      />
    </View>
  );
};

// Helper functions
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Hace un momento';

  const now = new Date();
  const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - postTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return postTime.toLocaleDateString();
};

const formatCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
};
