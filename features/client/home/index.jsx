import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text } from '../../../shared/components/ui';
import { AdaptiveHeader } from '../../../shared/components/layout/adaptive-header';
import { apiClient } from '../../../shared/config/api-client';
import { seedStories } from '../../../shared/api/stories/seeder';

const { width } = Dimensions.get('window');

/**
 * Client Home Screen (Inicio)
 * Instagram/TikTok inspired layout
 */
export default function ClientHomeScreen() {
  const [isSeeding, setIsSeeding] = useState(false);

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
  const { data: stories = [], refetch: refetchStories } = useQuery({
    queryKey: ['stories'],
    queryFn: () => apiClient.get('/stories').then(res => {
      console.log('Stories from API:', res.data);
      return res.data;
    })
  });

  const handleSeedStories = async () => {
    try {
      setIsSeeding(true);
      console.log('Seeding stories...');
      await seedStories();
      Alert.alert('Success', 'Stories seeded successfully!');
      refetchStories();
    } catch (error) {
      console.error('Seeding error:', error);
      Alert.alert('Error', 'Failed to seed stories: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const offers = [
    { title: '50% OFF', subtitle: 'Your first order', color: '#3b82f6' },
    { title: 'Envío gratis', subtitle: 'En pedidos +$20', color: '#10b981' },
    { title: '30% OFF', subtitle: 'Tiendas selectas', color: '#ef4444' },
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width - 32}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
      >
        {offers.map((offer, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            style={{
              backgroundColor: offer.color,
              borderRadius: 12,
              padding: 24,
              width: width - 32,
              marginRight: index < offers.length - 1 ? 12 : 0,
              height: 140,
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800', marginBottom: 4 }}>
              {offer.title}
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
              {offer.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stories Row - Instagram style */}
      <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        {stories.length === 0 ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
              No stories yet
            </Text>
            <TouchableOpacity
              onPress={handleSeedStories}
              disabled={isSeeding}
              style={{
                backgroundColor: isSeeding ? '#94a3b8' : '#8B5CF6',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                {isSeeding ? 'Seeding...' : 'Seed Stories'}
              </Text>
            </TouchableOpacity>
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
                  style={{ alignItems: 'center', marginHorizontal: 8 }}
                  activeOpacity={0.7}
                >
                  {/* Gradient border ring - only if has unviewed */}
                  <View style={{
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    padding: 2,
                    marginBottom: 6,
                    borderWidth: 2,
                    borderColor: businessStories.hasUnviewed ? '#DC2626' : '#e2e8f0'
                  }}>
                    {/* White border */}
                    <View style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      padding: 3,
                      backgroundColor: '#ffffff'
                    }}>
                      {/* Story image */}
                      <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
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
                  <Text style={{ fontSize: 11, color: '#64748b', maxWidth: 76, textAlign: 'center' }} numberOfLines={1}>
                    Business {index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Products Grid - 2 columns */}
      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
            Para ti
          </Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {products.map((product) => (
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
    </ScrollView>
  );
}
