import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * VideoItem Component
 * Individual video with its own player
 */
function VideoItem({ video, isActive, isPaused, onTogglePause, onLike, onSave, onShare, onProfilePress, onProductPress }) {
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
            borderColor: '#ffffff'
          }}>
            {/* TODO: Add business profile picture */}
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
            Business Name
          </Text>
          <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
            {video.caption}
          </Text>
        </View>

        {/* Tagged Products */}
        {video.taggedProducts && video.taggedProducts.length > 0 && (
          <TouchableOpacity
            onPress={() => onProductPress(video.taggedProducts[0])}
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
              backgroundColor: 'rgba(255, 255, 255, 0.3)'
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                Producto destacado
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                Toca para ver detalles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
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
 */
export default function VideoViewer({ visible, videos = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const flatListRef = useRef(null);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setIsPaused(false);
    }
  }, [visible, initialIndex]);

  // Handle viewable items change (when user scrolls)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentIndex(visibleIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
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

  const handleProfilePress = () => {
    // TODO: Navigate to business profile
    console.log('Go to profile');
  };

  const handleProductPress = (productId) => {
    // TODO: Navigate to product detail
    console.log('Go to product:', productId);
  };

  const renderVideo = ({ item: video, index }) => {
    const isActive = index === currentIndex;

    return (
      <VideoItem
        video={video}
        isActive={isActive}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onProfilePress={handleProfilePress}
        onProductPress={handleProductPress}
      />
    );
  };

  if (!visible) return null;

  return (
     <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000000' }}>
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
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          ref={flatListRef}
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index
          })}
          windowSize={3}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
          overScrollMode="never"
        />
      </View>
    </Modal>
  );
}
