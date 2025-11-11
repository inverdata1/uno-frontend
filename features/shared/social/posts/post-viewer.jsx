import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../../shared/components/ui';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';
import { colors } from '../../../../shared/utils/colors';
import { useDeletePost, useLikePost, useSavePost } from '../hooks/use-posts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Video Media Item Component
 * Renders a single video using expo-video with custom Instagram-style controls
 */
function VideoMediaItem({ uri, style }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener('statusChange', (status) => {
      setIsPlaying(status.isPlaying);
      if (status.status === 'readyToPlay') {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleVideoPress = () => {
    if (!showControls) {
      // First tap: show controls
      setShowControls(true);
      setTimeout(() => setShowControls(false), 3000);
    } else {
      // Subsequent taps while controls visible: toggle play/pause
      togglePlayPause();
      // Reset the auto-hide timer
      setShowControls(true);
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <View style={style}>
      <VideoView
        fullscreenOptions={{ enable: false }}
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Touch Area for Controls */}
      <Pressable
        onPress={handleVideoPress}
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
        {/* Play/Pause Button - Only show when controls are visible */}
        {showControls && (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#ffffff"
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </View>
        )}
      </Pressable>

      {/* Video Icon Indicator - Top Right */}
      <View style={{
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      }}>
        <Ionicons name="videocam" size={16} color="#ffffff" />
      </View>
    </View>
  );
}

/**
 * PostViewer Component
 * Instagram-style full-screen post viewer with edit/delete for business owners
 *
 * @param {boolean} visible - Whether the modal is visible
 * @param {object} post - Post data to display
 * @param {object} businessData - Business info (name, logo)
 * @param {function} onClose - Callback when viewer closes
 * @param {function} onEdit - Optional callback when edit is pressed
 * @param {function} onBusinessPress - Callback when business profile is pressed
 * @param {function} onProductPress - Callback when tagged product is pressed
 */
export default function PostViewer({
  visible,
  post,
  businessData,
  onClose,
  onEdit,
  onBusinessPress,
  onProductPress
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const { currentUserType, currentContext } = useCurrentUserType();

  const deletePostMutation = useDeletePost();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  if (!post) return null;

  const {
    type,
    media = [],
    caption,
    taggedProducts = [],
    likeCount = 0,
    commentCount = 0,
    saveCount = 0,
    businessId,
    userId
  } = post;

  // Check if current user is the owner of this post
  const isOwner = currentUserType === 'business' &&
    currentContext?.businessId &&
    businessId === currentContext.businessId;

  const isCarousel = type === 'carousel' && media.length > 1;

  // TODO: Get from auth state
  const isLiked = false;
  const isSaved = false;

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Eliminar publicación',
      '¿Estás seguro de que quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePostMutation.mutate(post.id, {
              onSuccess: () => {
                onClose();
              }
            });
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (onEdit) {
      onEdit(post);
    } else {
      // TODO: Navigate to edit screen
      console.log('Edit post:', post.id);
    }
  };

  const handleLike = () => {
    likeMutation.mutate({ postId: post.id, isLiked });
  };

  const handleSave = () => {
    saveMutation.mutate({ postId: post.id, isSaved });
  };

  const handleShare = () => {
    // TODO: Implement share
    console.log('Share post');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>

            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary
            }}>
              Publicación
            </Text>

            {isOwner ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <ScrollView style={{ flex: 1 }}>
            {/* Business Header */}
            <Pressable
              onPress={() => onBusinessPress?.(businessId)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#ffffff'
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.bg.secondary,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {businessData?.logo ? (
                  <Image
                    source={{ uri: businessData.logo }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ color: colors.text.secondary, fontSize: 16, fontWeight: '700' }}>
                    {(businessData?.name || 'B').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  {businessData?.name || 'Business'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                  {getTimeAgo(post.createdAt)}
                </Text>
              </View>
            </Pressable>

            {/* Media */}
            <View style={{ backgroundColor: '#000000' }}>
              {isCarousel ? (
                <>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {media.map((item, index) => (
                      item.type === 'video' ? (
                        <VideoMediaItem
                          key={index}
                          uri={item.url}
                          style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: '#000000' }}
                        />
                      ) : (
                        <Image
                          key={index}
                          source={{ uri: item.url }}
                          style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: '#000000' }}
                          resizeMode="cover"
                        />
                      )
                    ))}
                  </ScrollView>
                  {/* Carousel Indicator */}
                  <View style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                      {currentImageIndex + 1}/{media.length}
                    </Text>
                  </View>
                </>
              ) : (
                media[0]?.type === 'video' ? (
                  <VideoMediaItem
                    uri={media[0].url}
                    
                    style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: '#000000' }}
                  />
                ) : (
                  <Image
                    source={{ uri: media[0]?.url }}
                    style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: '#000000' }}
                    resizeMode="cover"
                  />
                )
              )}
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#ffffff'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                {/* Like */}
                <TouchableOpacity onPress={handleLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={26}
                    color={isLiked ? '#DC2626' : colors.text.primary}
                  />
                  {likeCount > 0 && (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                      {formatCount(likeCount)}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Comment */}
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="chatbubble-outline" size={24} color={colors.text.primary} />
                  {commentCount > 0 && (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                      {formatCount(commentCount)}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Share */}
                <TouchableOpacity onPress={handleShare}>
                  <Ionicons name="paper-plane-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Save */}
              <TouchableOpacity onPress={handleSave} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={26}
                  color={colors.text.primary}
                />
                {saveCount > 0 && (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                    {formatCount(saveCount)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Caption */}
            {caption && (
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#ffffff'
              }}>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.primary }}>
                  <Text style={{ fontWeight: '600' }}>{businessData?.name} </Text>
                  {caption}
                </Text>
              </View>
            )}

            {/* Tagged Products */}
            {taggedProducts.length > 0 && (
              <View style={{
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 16,
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: colors.border.light
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12
                }}>
                  Productos etiquetados
                </Text>
                {taggedProducts.map((tag, index) => {
                  const product = tag.product || tag;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onProductPress?.(product)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        gap: 12
                      }}
                    >
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: colors.bg.secondary,
                        overflow: 'hidden'
                      }}>
                        {product.thumbnailUrl || product.images?.[0] ? (
                          <Image
                            source={{ uri: product.thumbnailUrl || product.images[0] }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.text.primary
                        }} numberOfLines={1}>
                          {product.name}
                        </Text>
                        {product.price && (
                          <Text style={{
                            fontSize: 14,
                            color: colors.text.secondary,
                            marginTop: 2
                          }}>
                            ${product.price}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>

      {/* Custom Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end'
          }}
          onPress={() => setMenuVisible(false)}
        >
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <View style={{ paddingTop: 8 }}>
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  gap: 12
                }}
              >
                <Ionicons name="pencil" size={22} color={colors.text.primary} />
                <Text style={{ fontSize: 16, color: colors.text.primary }}>
                  Editar
                </Text>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: colors.border.light }} />

              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  gap: 12
                }}
              >
                <Ionicons name="trash" size={22} color="#DC2626" />
                <Text style={{ fontSize: 16, color: '#DC2626' }}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </Modal>
  );
}

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
