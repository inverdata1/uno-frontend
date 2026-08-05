import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Pressable, ScrollView, Dimensions, Share, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../../core/auth/stores/auth-store';
import { apiClient } from '../../../../../shared/config/api-client';
import { TaggedProductsModal } from './tagged-products-modal';
import { PostOptionsModal } from './post-options-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * PostCard Component
 * Facebook Lite style post card with auto-sliding carousel (every 5s),
 * products drawer ("Añadir al carrito"), 3 dots modal, and interaction buttons.
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
    
    // Optimistic UI update
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

  const trackAction = async (action, extraData = {}) => {
    try {
      await apiClient.post('/posts/track-interaction', {
        userId: user?.id,
        action,
        postId: post?.id,
        businessId: post?.businessId,
        ...extraData
      });
    } catch (e) {
      // silent fallback
    }
  };

  // Auto-scroll carousel every 5 seconds if multi-image post
  useEffect(() => {
    if (!isCarousel || media.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % media.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isCarousel, media.length]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleMediaPress = () => {
    trackAction('FULLSCREEN_VIEW');
    onPress?.();
  };

  const handleBusinessHeaderPress = () => {
    trackAction('VIEW_BUSINESS');
    onBusinessPress?.();
  };

  const handleSharePost = async () => {
    trackAction('SHARE_POST');
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

  return (
    <View style={{ backgroundColor: '#ffffff', marginBottom: 8, borderWidth: 1, borderColor: '#f3f4f6' }}>
      {/* FB Lite Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
        <Pressable
          onPress={handleBusinessHeaderPress}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          <View style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: '#f3f4f6',
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
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18 }}>
                  {businessData?.name?.charAt(0) || 'N'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
              {businessData?.name || 'Negocio'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              {formattedTimeAgo}
            </Text>
          </View>
        </Pressable>

        {/* 3 Dots Options Button */}
        <TouchableOpacity
          onPress={() => setOptionsModalVisible(true)}
          style={{ padding: 6 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Media Carousel */}
      <View style={{ position: 'relative' }}>
        <Pressable onPress={handleMediaPress}>
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
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={{ uri: media[0]?.url || media[0] }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="cover"
            />
          )}
        </Pressable>

        {/* Carousel Indicator Badge (1/3) */}
        {isCarousel && (
          <View style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12
          }}>
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
              {currentImageIndex + 1}/{media.length}
            </Text>
          </View>
        )}

        {/* Tagged Products Overlay Button */}
        {taggedProducts.length > 0 && (
          <TouchableOpacity
            onPress={() => setProductsModalVisible(true)}
            activeOpacity={0.85}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: '#ffffff',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
              gap: 6
            }}
          >
            <Ionicons name="pricetag" size={15} color="#ef4444" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
              Ver productos {taggedProducts.length > 1 ? `(${taggedProducts.length})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Dots for Carousel */}
      {isCarousel && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', py: 2, marginTop: 8, gap: 4 }}>
          {media.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentImageIndex === index ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: currentImageIndex === index ? '#ef4444' : '#d1d5db',
              }}
            />
          ))}
        </View>
      )}

      {/* Caption Section */}
      {caption && (
        <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 }}>
          <Text style={{ fontSize: 14, color: '#1f2937', leading: 20 }}>
            <Text style={{ fontWeight: '700', color: '#111827' }}>{businessData?.name} </Text>
            {caption}
          </Text>
        </View>
      )}

      {/* Action Buttons: Like, Comment, Share */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        marginTop: 6
      }}>
        {/* Like */}
        <TouchableOpacity
          onPress={handleToggleLike}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 12 }}
        >
          <Ionicons
            name={localIsLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={localIsLiked ? '#ef4444' : '#374151'}
          />
          <Text style={{ fontSize: 13, fontWeight: localIsLiked ? '700' : '600', color: localIsLiked ? '#ef4444' : '#374151' }}>
            {localLikeCount > 0 ? formatCount(localLikeCount) : 'Me gusta'}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={onComment}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 12 }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#374151" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
            {commentCount > 0 ? formatCount(commentCount) : 'Comentar'}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={handleSharePost}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 12 }}
        >
          <Ionicons name="paper-plane-outline" size={20} color="#374151" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
            Compartir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <TaggedProductsModal
        visible={productsModalVisible}
        onClose={() => setProductsModalVisible(false)}
        taggedProducts={taggedProducts}
        businessId={post.businessId}
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
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};
