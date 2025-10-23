import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 140;
const BANNER_PADDING = 16;
const CONTAINER_WIDTH = width - (BANNER_PADDING * 2);
const AUTOPLAY_INTERVAL = 5000; // 5 seconds

// Sample offers data - will be replaced with real data later
const SAMPLE_OFFERS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop',
    title: '50% OFF Your first order',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=400&fit=crop',
    title: 'Free delivery',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=400&fit=crop',
    title: 'Special deals',
  },
];

/**
 * Offers Banner Component
 * Shows ONE promotional offer at a time in a fixed container
 * Swipe inside the container to see different offers, with autoplay and arrow navigation
 */
export default function OffersBanner({ offers = SAMPLE_OFFERS, onOfferPress, autoplay = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const autoplayTimerRef = useRef(null);
  const SLIDE_WIDTH = CONTAINER_WIDTH - 16; // Account for container padding

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || offers.length <= 1) return;

    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1 >= offers.length ? 0 : prev + 1;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SLIDE_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, offers.length, SLIDE_WIDTH]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SLIDE_WIDTH);
    setCurrentIndex(index);
  };

  const handleDotPress = (index) => {
    // Reset autoplay timer when user manually navigates
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }

    scrollViewRef.current?.scrollTo({
      x: index * SLIDE_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }

    const newIndex = currentIndex - 1 < 0 ? offers.length - 1 : currentIndex - 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * SLIDE_WIDTH,
      animated: true,
    });
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }

    const newIndex = currentIndex + 1 >= offers.length ? 0 : currentIndex + 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * SLIDE_WIDTH,
      animated: true,
    });
    setCurrentIndex(newIndex);
  };

  return (
    <View style={{ paddingHorizontal: BANNER_PADDING, paddingVertical: 12 }}>
      {/* Fixed Container with light background - like in PDF */}
      <View
        style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 12,
          padding: 8,
          position: 'relative',
        }}
      >
        {/* Scrollable content inside the fixed container */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SLIDE_WIDTH}
          snapToAlignment="start"
        >
          {offers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              activeOpacity={0.9}
              onPress={() => onOfferPress?.(offer)}
              style={{
                width: SLIDE_WIDTH,
                height: BANNER_HEIGHT,
              }}
            >
              <Image
                source={{ uri: offer.imageUrl }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pagination Dots - Inside the container at the bottom */}
        {offers.length > 1 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 8,
              gap: 6,
            }}
          >
            {offers.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: currentIndex === index ? '#334155' : '#cbd5e1',
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
