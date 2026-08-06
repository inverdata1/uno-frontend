import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../../../features/shared/products/hooks/use-products';
import { useBusinesses } from '../../../features/shared/social/hooks/use-businesses';
import { useCategories } from '../../../features/shared/social/hooks/use-categories';
import { useDiscover, useBusinessSearch } from '../../../features/shared/social/hooks/use-discover';
import { AdaptiveHeader } from '../../../shared/components/layout/adaptive-header';
import { Text } from '../../../shared/components/ui';
import { colors } from '../../../shared/utils/colors';
import ProductDetail from '../products/product-detail';
import VideoViewer from '../social/videos/video-viewer';
import PostViewer from '../../shared/social/posts/post-viewer';
import OffersBanner from './offers-banner';

const { width } = Dimensions.get('window');

/**
 * Business Card - used for featured, by-category, and search sections
 */
function BusinessCard({ business, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        width: 160,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9'
      }}
    >
      <View style={{ width: '100%', height: 120, backgroundColor: '#f8fafc' }}>
        {business.logoUrl ? (
          <Image source={{ uri: business.logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="storefront" size={48} color="#cbd5e1" />
          </View>
        )}
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }} numberOfLines={1}>
          {business.businessName}
        </Text>
        <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }} numberOfLines={1}>
          {business.businessType || 'Negocio'}
        </Text>
        {business.rating > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
              {Number(business.rating).toFixed(1)} ({business.reviewsCount || 0})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Client Discover Screen (Descubre)
 * Instagram/TikTok inspired layout for exploring businesses, brands and content
 */
export default function ClientHomeScreen() {
  const router = useRouter();
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [videoViewerVideos, setVideoViewerVideos] = useState([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [postViewerPost, setPostViewerPost] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsBottomSheetVisible, setProductsBottomSheetVisible] = useState(false);
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Debounce search input before hitting the backend
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Use domain hooks instead of inline queries
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts({ limit: 20 });
  const { data: businesses = [] } = useBusinesses({ limit: 10 });
  const { data: discoverData } = useDiscover();
  const { data: searchResults = [], isFetching: isSearching } = useBusinessSearch(searchQuery);

  const featuredBusinesses = discoverData?.featured?.length ? discoverData.featured : businesses;
  const businessCategories = discoverData?.categories || [];
  const trendingPosts = discoverData?.trendingPosts || [];
  const isSearchActive = searchQuery.length > 0;

  // Chips offered inside the search panel. Business categories come first since
  // the search endpoint matches on them; product categories round out the list.
  const searchCategories = useMemo(() => {
    const names = [
      ...(discoverData?.categories || []).map((group) => group.category),
      ...categories.map((category) => category.name),
    ].filter(Boolean);

    const seen = new Set();
    return names.filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [discoverData?.categories, categories]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchInput('');
  };

  const offers = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop',
      title: '50% OFF Your first order'
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=400&fit=crop',
      title: 'Envío gratis en pedidos +$20'
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=400&fit=crop',
      title: '30% OFF Tiendas selectas'
    },
  ];

  const cardWidth = (width - 48) / 2; // 2 columns with padding

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
      {/* Adaptive Header */}
      <AdaptiveHeader />

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#f1f5f9',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              onFocus={() => setSearchOpen(true)}
              placeholder="Buscar negocios, marcas..."
              placeholderTextColor="#94a3b8"
              style={{ flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 10 }}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {searchOpen && (
            <TouchableOpacity onPress={closeSearch}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary[500] }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories - shown when the search bar is opened and nothing typed yet */}
        {searchOpen && !isSearchActive && searchCategories.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
              Categorías
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {searchCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() => setSearchInput(category)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', textTransform: 'capitalize' }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {isSearchActive && (
          <View style={{
            marginTop: 8,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            overflow: 'hidden'
          }}>
            {isSearching ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : searchResults.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                  No se encontraron negocios para &quot;{searchQuery}&quot;
                </Text>
              </View>
            ) : (
              searchResults.map((business, index) => (
                <TouchableOpacity
                  key={business.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSearchInput('');
                    router.push(`/client/business/${business.id}`);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: '#f1f5f9'
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#f8fafc', overflow: 'hidden', marginRight: 12 }}>
                    {business.logoUrl ? (
                      <Image source={{ uri: business.logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="storefront" size={20} color="#cbd5e1" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>
                      {business.businessName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1}>
                      {business.category || business.businessType || 'Negocio'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      {/* Offers Banner Carousel */}
      <OffersBanner
        offers={offers}
        onOfferPress={(offer) => {
          console.log('Offer pressed:', offer);
          // Navigate to offer detail or apply discount
        }}
      />

      {/* Negocios Destacados (Featured Businesses) */}
      <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
            Negocios Destacados
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {featuredBusinesses.slice(0, 10).map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onPress={() => router.push(`/client/business/${business.id}`)}
            />
          ))}
          {featuredBusinesses.length === 0 && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 40 }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                No hay negocios disponibles
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Explora por categoría (Business categories) */}
      {businessCategories.length > 0 && (
        <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          {businessCategories.map((group) => (
            <View key={group.category} style={{ marginBottom: 16 }}>
              <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                  {group.category}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              >
                {group.businesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onPress={() => router.push(`/client/business/${business.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      {/* Tendencias (Trending posts) */}
      {trendingPosts.length > 0 && (
        <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
              Tendencias
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {trendingPosts.map((post) => {
              const firstMedia = Array.isArray(post.media) ? post.media[0] : null;
              const thumbnail = post.thumbnailUrl || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url);
              return (
                <TouchableOpacity
                  key={post.id}
                  activeOpacity={0.9}
                  onPress={() => {
                    setPostViewerPost(post);
                    setPostViewerVisible(true);
                  }}
                  style={{ width: 120, height: 170, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f8fafc' }}
                >
                  {thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="image-outline" size={32} color="#cbd5e1" />
                    </View>
                  )}
                  {post.type === 'video' && (
                    <View style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Ionicons name="play" size={12} color="#ffffff" />
                    </View>
                  )}
                  <View style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    paddingHorizontal: 8, paddingVertical: 6,
                    backgroundColor: 'rgba(0,0,0,0.45)'
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
                      {post.business?.businessName || 'Negocio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Cerca de ti */}
      <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
            Cerca de ti
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {products.slice(0, 6).map((product) => (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedProduct(product);
                setProductDetailVisible(true);
              }}
              style={{
                width: cardWidth,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#f1f5f9'
              }}
            >
              {/* Product Image */}
              <View style={{
                width: '100%',
                height: cardWidth,
                backgroundColor: '#f8fafc'
              }}>
                {product.thumbnailUrl ? (
                  <Image
                    source={{ uri: product.thumbnailUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                  </View>
                )}
                {/* Favorite button */}
                <TouchableOpacity style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }}>
                  <Ionicons name="heart-outline" size={18} color="#1f2937" />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 }} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                    ${product.price}
                  </Text>
                  {product.compareAtPrice && (
                    <Text style={{ fontSize: 13, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 6 }}>
                      ${product.compareAtPrice}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Video Viewer Modal */}
      <VideoViewer
        visible={videoViewerVisible}
        videos={videoViewerVideos}
        initialIndex={selectedVideoIndex}
        onClose={() => {
          setVideoViewerVisible(false);
          // Reset bottom sheet state when video viewer closes
          setProductsBottomSheetVisible(false);
          setTaggedProducts([]);
        }}
        onShowAllProducts={(products) => {
          setTaggedProducts(products);
          setProductsBottomSheetVisible(true);
        }}
        onProductPress={(product) => {
          setSelectedProduct(product);
          setProductDetailVisible(true);
        }}
        onBusinessPress={(businessId) => {
          setVideoViewerVisible(false);
          router.push(`/client/business/${businessId}`);
        }}
        // Pass bottom sheet props
        productsBottomSheetVisible={productsBottomSheetVisible}
        taggedProducts={taggedProducts}
        onCloseBottomSheet={() => setProductsBottomSheetVisible(false)}
        onProductSelectFromSheet={(product) => {
          setProductsBottomSheetVisible(false);
          setSelectedProduct(product);
          setProductDetailVisible(true);
        }}
      />

      {/* Post Viewer Modal */}
      {postViewerPost && (
        <PostViewer
          visible={postViewerVisible}
          post={postViewerPost}
          onClose={() => {
            setPostViewerVisible(false);
            setProductDetailVisible(true);
          }}
          onBusinessPress={(businessId) => {
            setPostViewerVisible(false);
            router.push(`/client/business/${businessId}`);
          }}
          onProductPress={(product) => {
            setPostViewerVisible(false);
            setSelectedProduct(product);
            setProductDetailVisible(true);
          }}
        />
      )}

      {/* Product Detail Modal */}
      <Modal
        visible={productDetailVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setProductDetailVisible(false)}
      >
        <SafeAreaProvider>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setProductDetailVisible(false)}
              onBusinessPress={(businessId) => {
                setProductDetailVisible(false);
                // Wait for modal animation to complete before navigating
                router.replace(`/client/business/${businessId}`);
              }}
              onVideoPress={(video, allVideos) => {
                // Close product detail
                setProductDetailVisible(false);
                // Find the index of the selected video in the array
                const videoIndex = allVideos.findIndex(v => v.id === video.id);
                // Open video viewer with all product videos
                setVideoViewerVideos(allVideos);
                setSelectedVideoIndex(videoIndex >= 0 ? videoIndex : 0);
                setVideoViewerVisible(true);
              }}
              onPostPress={(post) => {
                setProductDetailVisible(false);
                setPostViewerPost(post);
                setPostViewerVisible(true);
              }}
            />
          )}
        </SafeAreaProvider>
      </Modal>
    </ScrollView>
  </SafeAreaView>
  );
}
