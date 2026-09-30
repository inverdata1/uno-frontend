import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '../../../shared/components/ui';
import { useProductPosts } from '../../../shared/hooks/use-product-posts';
import { useCurrentUserType } from '../../../shared/hooks/use-user-type';
import { useDeleteProduct, useFavoriteProduct } from '../../shared/products/hooks/use-products';
import { useCartStore } from '../../../shared/stores/cart-store';
import PostViewer from '../../shared/social/posts/post-viewer';
import VideoViewer from '../social/videos/video-viewer';
import ProductRatingModal from './components/product-rating-modal';
import ConversationModal from '../../shared/chat/conversation-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_CONTAINER_HEIGHT = 380;

/**
 * Product Detail Screen
 * Redesigned to match the reference layout:
 * - Rounded hero image card with floating back & favorite buttons
 * - Vertical stacked thumbnail gallery on the right with "+N" modal trigger
 * - Product Title, interactive star rating button with purchase verification modal, and "vendidos" stat
 * - Large price with discount badges
 * - Business profile row with "Seguir" button
 * - Segmented tabs for "Descripción" and "Social Media" (posts & videos)
 * - Fixed bottom action bar with integrated [- 1 +] quantity pill and "Añadir al carrito" button
 */
export default function ProductDetail({
  product,
  onClose,
  onBusinessPress,
  onVideoPress,
  onPostPress
}) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(Boolean(product?.isFavorited));
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'social'
  const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [localRating, setLocalRating] = useState(Number(product?.rating || 0));
  const [chatModalVisible, setChatModalVisible] = useState(false);

  // Social viewer modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);

  const { currentUserType, currentContext } = useCurrentUserType();
  const favoriteMutation = useFavoriteProduct();
  const deleteProductMutation = useDeleteProduct();
  const addItem = useCartStore((state) => state.addItem);

  // Fetch related social content (posts and videos tagged with this product)
  const { data: relatedPosts = [], isLoading: postsLoading } = useProductPosts(product?.id);

  // Parse images safely
  let parsedImages = [];
  try {
    if (Array.isArray(product?.images)) {
      parsedImages = product.images.map(img => typeof img === 'string' ? img : (img.url || img.imageUrl));
    } else if (typeof product?.images === 'string') {
      const parsed = JSON.parse(product.images);
      parsedImages = Array.isArray(parsed)
        ? parsed.map(img => typeof img === 'string' ? img : (img.url || img.imageUrl))
        : [product.images];
    }
  } catch (e) {
    parsedImages = [];
  }

  if (parsedImages.length === 0 && product?.thumbnailUrl) {
    parsedImages = [product.thumbnailUrl];
  } else if (parsedImages.length === 0) {
    parsedImages = ['https://via.placeholder.com/600'];
  }

  const images = parsedImages.filter(Boolean);
  const mainImageUrl = images[selectedImageIndex] || images[0];

  // Pricing calculation
  const rawPrice = Number(product?.price || product?.regularPrice || 0);
  const discountPrice = Number(product?.discountPrice || 0);
  const isDiscountActive = Boolean(product?.isDiscountActive && discountPrice > 0 && discountPrice < rawPrice);
  const currentPrice = isDiscountActive ? discountPrice : rawPrice;
  const originalPrice = isDiscountActive ? rawPrice : Number(product?.compareAtPrice || 0);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const ratingValue = Number(localRating || product?.rating || 0).toFixed(1);
  const soldCount = product?.soldCount || product?.orderCount || 0;

  // Business info
  const business = product?.business || {};
  const businessId = product?.businessId || business?.id;
  const businessName = business?.businessName || business?.name || product?.businessName || 'Negocio';
  const businessLogo = business?.logoUrl || business?.logo || product?.businessLogo || null;

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    if (product?.id) {
      favoriteMutation.mutate(product.id);
    }
  };

  const handleBusinessNavigation = () => {
    if (onBusinessPress && businessId) {
      onBusinessPress(businessId);
    } else if (businessId) {
      onClose?.();
      router.push(`/client/business/${businessId}`);
    }
  };

  const handleOpenProductChat = () => {
    if (!businessId) {
      Alert.alert('Chat no disponible', 'No se encontró la información del negocio para este producto.');
      return;
    }
    setChatModalVisible(true);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const bName = businessName;
    const bLogo = businessLogo;

    for (let i = 0; i < quantity; i++) {
      const res = addItem(product, {
        businessId,
        businessName: bName,
        logoUrl: bLogo,
      });
      if (!res.success) {
        Alert.alert('Producto No Disponible', res.message);
        return;
      }
    }

    Alert.alert(
      '¡Añadido al Carrito!',
      `Se agregaron ${quantity} unidad(es) de "${product.name}" al carrito.`,
      [{ text: 'Genial' }]
    );
  };

  const handleSocialPostPress = (post) => {
    if (post.type === 'video') {
      if (onVideoPress) {
        onVideoPress(post, relatedPosts.filter(p => p.type === 'video'));
      } else {
        setSelectedVideo(post);
        setVideoViewerVisible(true);
      }
    } else {
      if (onPostPress) {
        onPostPress(post);
      } else {
        setSelectedPost(post);
        setPostViewerVisible(true);
      }
    }
  };

  const allVideoPosts = relatedPosts.filter(p => p.type === 'video');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image Container with Vertical Thumbnails and Floating Actions */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: 28,
          backgroundColor: '#f1f5f9',
          height: IMAGE_CONTAINER_HEIGHT,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Main Displayed Image */}
          <Pressable
            style={{ width: '100%', height: '100%' }}
            onPress={() => {
              setFullScreenImageIndex(selectedImageIndex);
              setFullScreenImageVisible(true);
            }}
          >
            <Image
              source={{ uri: mainImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Pressable>

          {/* Top Floating Left: Back Button */}
          <TouchableOpacity
            onPress={onClose || (() => router.back())}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 10
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>

          {/* Top Floating Right: Favorite Button */}
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 10
            }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorited ? '#ef4444' : '#0f172a'}
            />
          </TouchableOpacity>

          {/* Vertical Thumbnails Stack (Right Column Overlay) */}
          {images.length > 1 && (
            <View style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              gap: 8,
              zIndex: 10
            }}>
              {images.slice(0, 3).map((imgUrl, idx) => {
                const isSelected = selectedImageIndex === idx;
                const isLastSlot = idx === 2 && images.length > 3;
                const extraCount = images.length - 2;

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (isLastSlot) {
                        setFullScreenImageIndex(2);
                        setFullScreenImageVisible(true);
                      } else {
                        setSelectedImageIndex(idx);
                      }
                    }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: isSelected ? '#ef4444' : '#ffffff',
                      backgroundColor: '#e2e8f0',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <Image
                      source={{ uri: imgUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />

                    {/* Dark Overlay with + on last thumbnail if > 3 images */}
                    {isLastSlot && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }}>
                          +{extraCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Product Information */}
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          {/* Title */}
          <Text style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: -0.4,
            marginBottom: 8
          }}>
            {product?.name || 'Producto'}
          </Text>

          {/* Ratings & Sales Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRatingModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0f172a',
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 12,
                gap: 5
              }}
            >
              <Ionicons name="star" size={13} color="#fbbf24" />
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }}>
                {ratingValue}
              </Text>
            </TouchableOpacity>

            <Text style={{ color: '#cbd5e1' }}>•</Text>

            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>
              {soldCount} {soldCount === 1 ? 'vendido' : 'vendidos'}
            </Text>
          </View>

          {/* Pricing Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#0f172a' }}>
              ${currentPrice.toFixed(2)}
            </Text>

            {hasDiscount && (
              <>
                <Text style={{ fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through', fontWeight: '500' }}>
                  ${originalPrice.toFixed(2)}
                </Text>

                <View style={{
                  backgroundColor: '#fee2e2',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#ef4444' }}>
                    {discountPercentage}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Business Profile Card */}
          <TouchableOpacity
            onPress={handleBusinessNavigation}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              padding: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#f1f5f9',
              marginBottom: 18
            }}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {businessLogo ? (
                <Image
                  source={{ uri: businessLogo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="storefront" size={20} color="#ef4444" />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }} numberOfLines={1}>
                  {businessName}
                </Text>
                <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
              </View>
              <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                Ver perfil del negocio
              </Text>
            </View>

            <View style={{
              backgroundColor: '#ef4444',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20
            }}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                Seguir
              </Text>
            </View>
          </TouchableOpacity>

          {/* Segmented Control: "Descripción" vs "Social Media" vs "Chat" */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#f1f5f9',
            borderRadius: 30,
            padding: 4,
            marginBottom: 16
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('description')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                backgroundColor: activeTab === 'description' ? '#0f172a' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: activeTab === 'description' ? '700' : '600',
                color: activeTab === 'description' ? '#ffffff' : '#64748b'
              }}>
                DESCRIPCIÓN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('social')}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                backgroundColor: activeTab === 'social' ? '#0f172a' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: activeTab === 'social' ? '700' : '600',
                color: activeTab === 'social' ? '#ffffff' : '#64748b'
              }}>
                SOCIAL MEDIA {relatedPosts.length > 0 ? `(${relatedPosts.length})` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenProductChat}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 4
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#64748b" />
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#64748b'
              }}>
                CHAT
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1 Content: Description */}
          {activeTab === 'description' && (
            <View style={{ paddingVertical: 4 }}>
              <Text style={{
                fontSize: 14,
                color: '#475569',
                lineHeight: 22,
                fontWeight: '400'
              }}>
                {product?.description || 'No hay descripción disponible para este producto.'}
              </Text>
            </View>
          )}

          {/* Tab 2 Content: Social Media */}
          {activeTab === 'social' && (
            <View style={{ paddingVertical: 4 }}>
              {postsLoading ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#ef4444" />
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                    Cargando publicaciones...
                  </Text>
                </View>
              ) : relatedPosts.length > 0 ? (
                <View>
                  <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                    Publicaciones y videos donde este producto ha sido etiquetado:
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                  >
                    {relatedPosts.map((post) => {
                      const thumb = post.thumbnailUrl || (post.media?.[0]?.url || post.media?.[0]) || null;
                      const isVideo = post.type === 'video';

                      return (
                        <TouchableOpacity
                          key={post.id}
                          activeOpacity={0.85}
                          onPress={() => handleSocialPostPress(post)}
                          style={{
                            width: 130,
                            height: 190,
                            borderRadius: 16,
                            overflow: 'hidden',
                            backgroundColor: '#1e293b',
                            position: 'relative'
                          }}
                        >
                          {thumb ? (
                            <Image
                              source={{ uri: thumb }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name={isVideo ? 'play-circle' : 'image'} size={36} color="#ffffff" />
                            </View>
                          )}

                          {/* Overlay Gradient with View Count */}
                          <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.55)',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Ionicons name="eye" size={12} color="#ffffff" />
                              <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                                {post.viewCount || 0}
                              </Text>
                            </View>

                            {isVideo && (
                              <View style={{
                                backgroundColor: '#ef4444',
                                borderRadius: 4,
                                paddingHorizontal: 4,
                                paddingVertical: 1
                              }}>
                                <Ionicons name="play" size={10} color="#ffffff" />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <View style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 16,
                  padding: 24,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#f1f5f9'
                }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 4 }}>
                    Sin contenido social
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>
                    Este producto actualmente no tiene publicaciones ni videos etiquetados.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar: Integrated Quantity Pill and Add to Cart Button */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 10
      }}>
        {/* Quantity Selector Pill */}
        <View style={{
          backgroundColor: '#0f172a',
          borderRadius: 26,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: 52
        }}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="remove" size={18} color="#ffffff" />
          </TouchableOpacity>

          <Text style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '800',
            minWidth: 24,
            textAlign: 'center',
            marginHorizontal: 6
          }}>
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 52,
            backgroundColor: '#ef4444',
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Ionicons name="cart" size={18} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800' }}>
            AÑADIR AL CARRITO
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Viewer Modal */}
      <Modal
        visible={fullScreenImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
              <TouchableOpacity
                onPress={() => setFullScreenImageVisible(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: fullScreenImageIndex * SCREEN_WIDTH, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullScreenImageIndex(idx);
            }}
          >
            {images.map((imgUrl, idx) => (
              <View key={idx} style={{ width: SCREEN_WIDTH, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: imgUrl }}
                  style={{ width: SCREEN_WIDTH, height: '80%' }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Full Screen Dots */}
          {images.length > 1 && (
            <SafeAreaView edges={['bottom']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 24 }}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: fullScreenImageIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                      width: fullScreenImageIndex === idx ? 22 : 6,
                    }}
                  />
                ))}
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>

      {/* Post Viewer Modal for Social Media Tab */}
      {selectedPost && (
        <PostViewer
          visible={postViewerVisible}
          post={selectedPost}
          businessData={selectedPost?.business || business}
          onClose={() => {
            setPostViewerVisible(false);
            setSelectedPost(null);
          }}
          onBusinessPress={handleBusinessNavigation}
        />
      )}

      {/* Video Reel Viewer Modal for Social Media Tab */}
      {selectedVideo && (
        <VideoViewer
          visible={videoViewerVisible}
          videos={allVideoPosts.length > 0 ? allVideoPosts : [selectedVideo]}
          initialVideoId={selectedVideo.id}
          onClose={() => {
            setVideoViewerVisible(false);
            setSelectedVideo(null);
          }}
          onBusinessPress={handleBusinessNavigation}
        />
      )}

      {/* Product Rating Modal */}
      <ProductRatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        productId={product?.id}
        productName={product?.name || 'Producto'}
        onRatingSuccess={(data) => {
          if (data?.rating) {
            setLocalRating(data.rating);
          }
        }}
      />

      {/* Product Inquiry Chat Modal with Tagged Product */}
      {chatModalVisible && (
        <ConversationModal
          visible={chatModalVisible}
          onClose={() => setChatModalVisible(false)}
          targetParticipant={{
            id: businessId,
            type: 'business',
            name: businessName,
            avatar: businessLogo
          }}
          attachedProduct={{
            id: product?.id,
            name: product?.name,
            price: currentPrice,
            imageUrl: mainImageUrl,
            businessName: businessName,
            businessLogo: businessLogo
          }}
        />
      )}
    </SafeAreaView>
  );
}
