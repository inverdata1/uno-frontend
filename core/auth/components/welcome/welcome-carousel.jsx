import { useState } from 'react';
import { Dimensions, ScrollView, View, Image, StyleSheet } from 'react-native';
import { Text } from '../../../../shared/components/ui';
import { welcomeSlides } from '../../data/welcome/welcome-slides';

const { width: screenWidth } = Dimensions.get('window');

export function WelcomeCarousel({ onSlideChange }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
      onSlideChange?.(welcomeSlides[slideIndex]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicators */}
      <View style={styles.indicators}>
        {welcomeSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentSlide ? styles.indicatorActive : styles.indicatorInactive
            ]}
          />
        ))}
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {welcomeSlides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: screenWidth }]}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {slide.title}
              </Text>
            </View>

            {/* Hero Image */}
            <View style={styles.imageContainer}>
              {slide.image ? (
                <Image
                  source={slide.image}
                  style={[styles.image, { backgroundColor: slide.imageColor }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: slide.imageColor }]}>
                  <Text style={styles.placeholderEmoji}>📱</Text>
                  <Text style={styles.placeholderText}>
                    Imagen del slide {slide.id}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
    width: 64,
  },
  indicatorActive: {
    backgroundColor: '#1f2937',
  },
  indicatorInactive: {
    backgroundColor: '#e5e7eb',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  titleContainer: {
    marginBottom: 32,
    minHeight: 80,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 36,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: 280,
    height: 220,
    borderRadius: 24,
  },
  imagePlaceholder: {
    width: 280,
    height: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    color: '#ffffff',
  },
  placeholderText: {
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
});
