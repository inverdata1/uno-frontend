import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  TouchableOpacity,
  View,
  Share,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { apiClient } from '../../../../shared/config/api-client';
import { useCartStore } from '../../../../shared/stores/cart-store';
import { TaggedProductsModal } from '../feed/components/tagged-products-modal';
import { CommentsModal } from '../../../shared/social/comments/comments-modal';
import { useFollowingBusinesses, useToggleFollowBusiness } from '../../../shared/social/hooks/use-businesses';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Single Video Item Component for Immersive Reel Feed
 */
function VideoItem({
  video,
  isActive,
  isPaused,
  onTogglePause,
  onProfilePress,
  onCommentPress,
  onOpenProducts,
  onAddToCart,
  onProductPress,
}) {
  const { user } = useAuthStore();
  const { data: followedBusinesses = [] } = useFollowingBusinesses(user?.id);
  const toggleFollowMutation = useToggleFollowBusiness();
  const [localIsLiked, setLocalIsLiked] = useState(Boolean(video?.isLiked));
  const [localLikeCount, setLocalLikeCount] = useState(Number(video?.likeCount || 0));

  const businessId = video.businessId || video.business?.id;
  const isFollowed = Boolean(businessId && followedBusinesses.includes(businessId));

  const handleFollowPress = (e) => {
    e?.stopPropagation?.();
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión como cliente para seguir este negocio.');
      return;
    }
    if (!businessId) return;
    toggleFollowMutation.mutate({ businessId, userId: user.id });
  };

  // Spinning Vinyl Record Animation for Music
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [isActive, isPaused]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const mediaUrl = video?.media?.[0]?.url || (typeof video?.media === 'string' ? video.media : null);
  const player = useVideoPlayer(mediaUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false;
  });

  useEffect(() => {
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  const queryClient = useQueryClient();

  const handleToggleLike = async () => {
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para dar me gusta y guardar en favoritos');
      return;
    }
    const nextIsLiked = !localIsLiked;
    const nextCount = nextIsLiked ? localLikeCount + 1 : Math.max(0, localLikeCount - 1);
    setLocalIsLiked(nextIsLiked);
    setLocalLikeCount(nextCount);

    try {
      await apiClient.patch(`/posts/${video.id}/like`, { userId: user?.id });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } catch (e) {
      setLocalIsLiked(!nextIsLiked);
      setLocalLikeCount(localLikeCount);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este video de ${video.businessName || 'UNO Delivery'}!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Safely parse tagged products
  const taggedProducts = useMemo(() => {
    if (Array.isArray(video.taggedProducts)) return video.taggedProducts;
    if (typeof video.taggedProducts === 'string') {
      try {
        const parsed = JSON.parse(video.taggedProducts);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [video.taggedProducts]);

  const firstTaggedProduct = taggedProducts.length > 0
    ? (taggedProducts[0].product || taggedProducts[0])
    : null;

  const businessName = video.businessName || video.business?.businessName || video.business?.name || 'Negocio';
  const handleTag = businessName.toLowerCase().replace(/\s+/g, '');
  const musicTitle = video.audioTitle || `Sonido original - @${handleTag}`;

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH, backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* Video Player */}
      {mediaUrl ? (
        <VideoView
          player={player}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="videocam-off-outline" size={48} color="#6b7280" />
          <Text style={{ color: '#9ca3af', marginTop: 12 }}>Video no disponible</Text>
        </View>
      )}

      {/* Tap Overlay for Pause/Play */}
      <Pressable
        onPress={onTogglePause}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isPaused && (
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="play" size={36} color="#ffffff" style={{ marginLeft: 3 }} />
          </View>
        )}
      </Pressable>

      {/* Top Audio / Music Pill (Matching Reference) */}
      <View style={{
        position: 'absolute',
        top: 50,
        left: 60,
        right: 60,
        alignItems: 'center',
        zIndex: 20
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          gap: 6,
          maxWidth: '90%'
        }}>
          <Ionicons name="musical-notes" size={14} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
            {musicTitle}
          </Text>
        </View>
      </View>

      {/* Right Rotating Audio Disc (Matching Reference Image 1 & 2) */}
      <View style={{
        position: 'absolute',
        top: 50,
        right: 16,
        alignItems: 'center',
        zIndex: 20
      }}>
        <Animated.View style={{
          transform: [{ rotate: spin }],
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#1e293b',
          borderWidth: 2,
          borderColor: '#ffffff',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {video.logoUrl || video.business?.logoUrl ? (
            <Image
              source={{ uri: video.logoUrl || video.business?.logoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="disc" size={24} color="#ffffff" />
          )}
        </Animated.View>
      </View>

      {/* Right Side Action Column (Matching Reference) */}
      <View style={{
        position: 'absolute',
        right: 12,
        bottom: 80,
        alignItems: 'center',
        gap: 18,
        zIndex: 15,
      }}>
        {/* Business Avatar with + Follow Icon */}
        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.8}
          style={{ position: 'relative', marginBottom: 6 }}
        >
          <View style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: '#ef4444',
            borderWidth: 2,
            borderColor: '#ffffff',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {video.logoUrl || video.business?.logoUrl ? (
              <Image
                source={{ uri: video.logoUrl || video.business?.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>
                {businessName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          {/* Follow Plus Badge - Hidden when already followed */}
          {!isFollowed && (
            <TouchableOpacity
              onPress={handleFollowPress}
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                bottom: -6,
                alignSelf: 'center',
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#ef4444',
                borderWidth: 1.5,
                borderColor: '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={14} color="#ffffff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity onPress={handleToggleLike} activeOpacity={0.7} style={{ alignItems: 'center' }}>
          <Ionicons
            name={localIsLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={localIsLiked ? '#ef4444' : '#ffffff'}
          />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 2, fontWeight: '700' }}>
            {formatCount(localLikeCount)}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity onPress={onCommentPress} activeOpacity={0.7} style={{ alignItems: 'center' }}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 2, fontWeight: '700' }}>
            {formatCount(video.commentCount || 0)}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={{ alignItems: 'center' }}>
          <Ionicons name="paper-plane-outline" size={28} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 2, fontWeight: '700' }}>
            {formatCount(video.shareCount || 0)}
          </Text>
        </TouchableOpacity>

        {/* Tagged Products Shopping Bag Button */}
        {taggedProducts.length > 0 && (
          <TouchableOpacity
            onPress={onOpenProducts}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4
            }}
          >
            <Ionicons name="bag-handle" size={20} color="#ffffff" />
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#ef4444' }}>
                {taggedProducts.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Info Overlay (Matching Reference) */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 80,
        paddingHorizontal: 16,
        zIndex: 15,
      }}>
        {/* Username Handle */}
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 6 }}>
            @{handleTag}
          </Text>
        </TouchableOpacity>

        {/* Caption */}
        {video.caption ? (
          <Text style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: 13, lineHeight: 18, marginBottom: 12 }} numberOfLines={3}>
            {video.caption}
          </Text>
        ) : null}

        {/* Prominent Quick-Add Tagged Product Banner */}
        {firstTaggedProduct && (
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 14,
            padding: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 5
          }}>
            {/* Product Thumbnail & Details (Clickable to open Product Detail) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onProductPress?.(firstTaggedProduct)}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                {firstTaggedProduct.thumbnailUrl || firstTaggedProduct.imageUrl ? (
                  <Image
                    source={{ uri: firstTaggedProduct.thumbnailUrl || firstTaggedProduct.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="pricetag" size={18} color="#ef4444" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                  {firstTaggedProduct.name || firstTaggedProduct.title || 'Producto'}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#ef4444', marginTop: 1 }}>
                  ${firstTaggedProduct.discountPrice || firstTaggedProduct.price || '0.00'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Direct Quick Add Button */}
            <TouchableOpacity
              onPress={() => onAddToCart(firstTaggedProduct)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#ef4444',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Ionicons name="cart" size={13} color="#ffffff" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
                + Carrito
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Main VideoViewer Modal Component
 */
export default function VideoViewer({
  visible,
  videos = [],
  initialVideoId,
  onClose,
  onBusinessPress,
  onProductPress,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [productsModalData, setProductsModalData] = useState(null);
  const flatListRef = useRef(null);
  const addItem = useCartStore(state => state.addItem);

  // Set initial scroll index based on initialVideoId
  useEffect(() => {
    if (visible && initialVideoId && videos.length > 0) {
      const idx = videos.findIndex(v => v.id === initialVideoId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: idx, animated: false });
        }, 100);
      }
    }
  }, [visible, initialVideoId, videos]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
    minimumViewTime: 100
  }).current;

  const handleAddToCart = (product, video) => {
    const businessId = video.businessId;
    const businessName = video.businessName || video.business?.businessName || video.business?.name;
    const logoUrl = video.logoUrl || video.business?.logoUrl;

    const result = addItem(product, {
      businessId,
      businessName,
      logoUrl,
    });

    if (result.success) {
      Alert.alert(
        '¡Añadido al Carrito!',
        result.message,
        [{ text: 'Genial', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Producto No Disponible',
        result.message || 'Este producto no está disponible en este momento.',
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const currentVideo = videos[currentIndex] || {};

  const renderVideoItem = ({ item: video, index }) => {
    const isActive = index === currentIndex;

    return (
      <VideoItem
        video={video}
        isActive={isActive}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onProfilePress={() => {
          if (video.businessId) {
            onClose();
            onBusinessPress?.(video.businessId);
          }
        }}
        onCommentPress={() => setCommentsPostId(video.id)}
        onOpenProducts={() => setProductsModalData(video)}
        onAddToCart={(product) => handleAddToCart(product, video)}
        onProductPress={(product) => {
          onClose();
          onProductPress?.(product);
        }}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          {/* Top Close Button */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, zIndex: 30 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 12,
                marginTop: 6
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Full Screen Vertical FlatList */}
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item, idx) => item?.id || `reel-${idx}`}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={SCREEN_HEIGHT}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: SCREEN_HEIGHT,
              offset: SCREEN_HEIGHT * index,
              index
            })}
            windowSize={3}
            maxToRenderPerBatch={1}
            removeClippedSubviews={true}
          />

          {/* Tagged Products Drawer */}
          {productsModalData && (
            <TaggedProductsModal
              visible={Boolean(productsModalData)}
              onClose={() => setProductsModalData(null)}
              taggedProducts={productsModalData.taggedProducts || []}
              businessId={productsModalData.businessId}
              businessData={{
                name: productsModalData.businessName,
                logo: productsModalData.logoUrl
              }}
              onProductPress={(product) => {
                setProductsModalData(null);
                onClose();
                onProductPress?.(product);
              }}
            />
          )}

          {/* Comments Modal */}
          <CommentsModal
            visible={Boolean(commentsPostId)}
            postId={commentsPostId}
            onClose={() => setCommentsPostId(null)}
          />
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const formatCount = (count) => {
  if (!count) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
};
