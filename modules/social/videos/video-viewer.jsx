import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StatusBar, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import ProductsBottomSheet from './products-bottom-sheet';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * VideoItem Component
 * Individual video with its own player
 */
function VideoItem({ video, isActive, isPaused, onTogglePause, onLike, onSave, onShare, onProfilePress, onProductPress, taggedProduct, totalProducts, onShowAllProducts }) {
  const player = useVideoPlayer(video.media[0]?.url, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Control playback based on active state
  useEffect(() => {
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH, backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Tap overlay for pause/play */}
      <Pressable
        onPress={onTogglePause}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {isPaused && (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Ionicons name="play" size={40} color="#ffffff" />
          </View>
        )}
      </Pressable>

      {/* Right Side Actions */}
      <View style={{
        position: 'absolute',
        right: 12,
        bottom: 100,
        alignItems: 'center',
        gap: 24,
        zIndex: 10
      }}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={onProfilePress}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#d1d5db',
            borderWidth: 2,
            borderColor: '#ffffff',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {video.logoUrl ? (
              <Image
                source={{ uri: video.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#6b7280', fontSize: 18, fontWeight: '700' }}>
                {(video.businessName || 'B').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity onPress={onLike} style={{ alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={32} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            {video.likeCount || 0}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity onPress={onSave} style={{ alignItems: 'center' }}>
          <Ionicons name="bookmark-outline" size={32} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            {video.saveCount || 0}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={onShare} style={{ alignItems: 'center' }}>
          <Ionicons name="paper-plane-outline" size={32} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            {video.shareCount || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Caption & Tagged Products */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 80,
        paddingHorizontal: 16,
        paddingBottom: 32,
        zIndex: 10
      }}>
        {/* Caption */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
            @{video.businessName || 'Business'}
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
            {video.caption || 'Check out this video!'}
          </Text>
        </View>

        {/* Tagged Products */}
        {taggedProduct && (
          <View>
            <TouchableOpacity
              onPress={() => onProductPress(taggedProduct)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                overflow: 'hidden'
              }}>
                {taggedProduct.thumbnailUrl ? (
                  <Image
                    source={{ uri: taggedProduct.thumbnailUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={24} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                  {taggedProduct.name}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                  ${taggedProduct.price}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Multiple products indicator - Tappable */}
            {totalProducts > 1 && (
              <TouchableOpacity
                onPress={onShowAllProducts}
                activeOpacity={0.7}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <Ionicons name="bag-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  + {totalProducts - 1} {totalProducts - 1 === 1 ? 'producto más' : 'productos más'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.9)" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * VideoViewer Component
 * TikTok-style full-screen vertical video feed
 *
 * @param {boolean} visible - Whether the modal is visible
 * @param {array} videos - Array of video posts
 * @param {number} initialIndex - Starting video index
 * @param {function} onClose - Callback when viewer closes
 * @param {function} onShowAllProducts - Callback when user wants to see all tagged products
 * @param {function} onProductPress - Callback when user selects a product
 * @param {boolean} productsBottomSheetVisible - Whether products bottom sheet is visible
 * @param {array} taggedProducts - Products to show in bottom sheet
 * @param {function} onCloseBottomSheet - Callback when bottom sheet closes
 * @param {function} onProductSelectFromSheet - Callback when product selected from sheet
 */
export default function VideoViewer({
  visible,
  videos = [],
  initialIndex = 0,
  onClose,
  onShowAllProducts,
  onProductPress,
  onBusinessPress,
  productsBottomSheetVisible = false,
  taggedProducts = [],
  onCloseBottomSheet,
  onProductSelectFromSheet
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Calculate actual viewport height including bottom inset
  const viewportHeight = SCREEN_HEIGHT + insets.bottom;

  // Reset to initial index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setIsPaused(false);
    }
  }, [visible, initialIndex]);

  // Handle Android back button
  const handleModalClose = () => {
    // If bottom sheet is open, close it first
    if (productsBottomSheetVisible && onCloseBottomSheet) {
      onCloseBottomSheet();
      return true; // Prevent default back behavior
    }
    // Otherwise close the video viewer
    onClose();
    return true;
  };

  // Handle viewable items change (when user scrolls)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentIndex(visibleIndex);
    }
  }).current;

  // Require 75% visibility before switching videos (more resistance)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
    minimumViewTime: 100
  }).current;

  const handleLike = () => {
    // TODO: Toggle like
    console.log('Toggle like');
  };

  const handleSave = () => {
    // TODO: Toggle save
    console.log('Toggle save');
  };

  const handleShare = () => {
    // TODO: Share video
    console.log('Share video');
  };

  const handleProfilePress = (video) => {
    if (onBusinessPress && video?.businessId) {
      onBusinessPress(video.businessId);
    } else {
      console.log('Go to profile', video?.businessId);
    }
  };

  const handleProductPress = (product) => {
    // Product is already populated with full data
    if (product && onProductPress) {
      setIsPaused(true); // Pause video when opening product
      onProductPress(product);
    } else {
      console.log('Product not available');
    }
  };

  const handleShowAllProducts = (products) => {
    if (onShowAllProducts) {
      setIsPaused(true); // Pause video when showing products
      onShowAllProducts(products);
    }
  };

  const renderVideo = ({ item: video, index }) => {
    const isActive = index === currentIndex;

    // Get first tagged product (already populated with full data from API)
    const taggedProduct = video.taggedProducts && video.taggedProducts.length > 0
      ? video.taggedProducts[0]
      : null;

    const totalProducts = video.taggedProducts ? video.taggedProducts.length : 0;

    return (
      <View style={{ height: viewportHeight, width: SCREEN_WIDTH }}>
        <VideoItem
          video={video}
          isActive={isActive}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onLike={handleLike}
          onSave={handleSave}
          onShare={handleShare}
          onProfilePress={() => handleProfilePress(video)}
          onProductPress={handleProductPress}
          taggedProduct={taggedProduct}
          totalProducts={totalProducts}
          onShowAllProducts={() => handleShowAllProducts(video.taggedProducts)}
        />
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleModalClose}
        statusBarTranslucent
        presentationStyle="overFullScreen"
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
          {/* Top Bar */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
              <TouchableOpacity onPress={onClose} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Videos
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>

          <FlatList
            style={{ flex: 1 }}
            ref={flatListRef}
            data={videos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={viewportHeight}
            snapToAlignment="start"
            decelerationRate={0.98}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: viewportHeight,
              offset: viewportHeight * index,
              index
            })}
            windowSize={3}
            maxToRenderPerBatch={1}
            removeClippedSubviews={true}
            overScrollMode="never"
          />

            </View>

            {/* Products Bottom Sheet - Inside Modal */}
            <ProductsBottomSheet
              visible={productsBottomSheetVisible}
              products={taggedProducts}
              onClose={onCloseBottomSheet}
              onProductSelect={onProductSelectFromSheet}
            />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
