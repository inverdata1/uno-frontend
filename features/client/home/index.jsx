import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AdaptiveHeader } from '../../../shared/components/layout/adaptive-header';
import { Text } from '../../../shared/components/ui';
import { apiClient } from '../../../shared/config/api-client';
import StoryViewer from '../../social/stories/story-viewer';
import VideoViewer from '../../social/videos/video-viewer';
import OffersBanner from './offers-banner';

const { width } = Dimensions.get('window');

/**
 * Client Home Screen (Inicio)
 * Instagram/TikTok inspired layout
 */
export default function ClientHomeScreen() {
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStories, setSelectedStories] = useState([]);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then(res => res.data)
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then(res => res.data)
  });

  // Fetch posts (for videos section)
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.get('/posts').then(res => res.data)
  });

  // Fetch stories
  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => apiClient.get('/stories').then(res => res.data)
  });

  // Fetch videos (video posts only)
  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiClient.get('/posts/videos').then(res => res.data)
  });

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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Adaptive Header */}
      <AdaptiveHeader />

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <TouchableOpacity style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 10,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <Text style={{ color: '#94a3b8', fontSize: 15, flex: 1 }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offers Banner Carousel */}
      <OffersBanner
        offers={offers}
        onOfferPress={(offer) => {
          console.log('Offer pressed:', offer);
          // Navigate to offer detail or apply discount
        }}
      />

      {/* Stories Row - Instagram style */}
      <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        {stories.length === 0 ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94a3b8' }}>
              No hay historias disponibles
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {stories.map((businessStories, index) => {
              const firstStory = businessStories.stories[0];
              return (
                <TouchableOpacity
                  key={businessStories.businessId}
                  style={{ alignItems: 'center', marginHorizontal: 6 }}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedStories(businessStories.stories);
                    setStoryViewerVisible(true);
                  }}
                >
                  {/* Story Ring Container */}
                  <View style={{
                    width: 72,
                    height: 72,
                    marginBottom: 6,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {businessStories.hasUnviewed ? (
                      // Instagram gradient ring for unviewed
                      <LinearGradient
                        colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: 'absolute',
                          width: 72,
                          height: 72,
                          borderRadius: 36
                        }}
                      />
                    ) : (
                      // Gray border for viewed
                      <View style={{
                        position: 'absolute',
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        borderWidth: 2,
                        borderColor: '#d1d5db'
                      }} />
                    )}

                    {/* White padding */}
                    <View style={{
                      width: 66,
                      height: 66,
                      borderRadius: 33,
                      backgroundColor: '#ffffff',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Story Image */}
                      <View style={{
                        width: 62,
                        height: 62,
                        borderRadius: 31,
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden'
                      }}>
                        {firstStory?.thumbnailUrl ? (
                          <Image
                            source={{ uri: firstStory.thumbnailUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="storefront" size={24} color="#94a3b8" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <Text style={{ fontSize: 11, color: '#64748b', maxWidth: 72, textAlign: 'center' }} numberOfLines={1}>
                    Business {index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Videos Recomendados */}
      <View style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
            Videos Recomendados
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {videos.slice(0, 3).map((video, index) => (
            <TouchableOpacity
              key={video.id}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedVideoIndex(index);
                setVideoViewerVisible(true);
              }}
              style={{
                width: 140,
                height: 200,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#f8fafc'
              }}
            >
              {video.thumbnailUrl ? (
                <Image
                  source={{ uri: video.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
                  <Ionicons name="play-circle" size={48} color="#94a3b8" />
                </View>
              )}
              {/* Play icon overlay */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons name="play" size={24} color="#ffffff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {videos.length === 0 && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 40 }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                No hay videos disponibles
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

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

      {/* Categories */}
      <View style={{ paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
            Categorías
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 24,
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
                backgroundColor: '#ffffff'
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#334155' }}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStories}
        onClose={() => setStoryViewerVisible(false)}
      />
            {/* Video Viewer Modal */}
      <VideoViewer
        visible={videoViewerVisible}
        videos={videos}
        initialIndex={selectedVideoIndex}
        onClose={() => setVideoViewerVisible(false)}
      />
    </ScrollView>
  );
}
