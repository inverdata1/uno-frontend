import { useState } from 'react';
import { Dimensions, ScrollView, View, Image } from 'react-native';
import { Text } from '../../../shared/components/ui';
import { onboardingSlides } from '../data/onboarding-slides';

const { width: screenWidth } = Dimensions.get('window');

export function OnboardingCarousel({ onSlideChange }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
      onSlideChange?.(onboardingSlides[slideIndex]);
    }
  };

  return (
    <View className="flex-1">
      {/* Step Indicators - Much Larger */}
      <View className="flex-row justify-center mb-12">
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            className={`h-1 rounded-full mx-0.5 w-16 ${
              index === currentSlide ? ' bg-foreground' : ' bg-gray-200'
            }`}
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
        className="flex-1"
        contentContainerStyle={{ alignItems: 'flex-start' }}
      >
        {onboardingSlides.map((slide, index) => (
          <View key={slide.id} style={{ width: screenWidth }} className="px-6 pt-4">
            <View className="flex-1">
              {/* Title - Fixed positioning to prevent cutting */}
              <View className="mb-8 min-h-32">
                <Text className="text-3xl font-bold text-foreground leading-tight text-center">
                  {slide.title}
                </Text>
              </View>

              {/* Hero Image */}
              <View className="items-center mb-8 flex-1 justify-center">
                {slide.image ? (
                  <Image
                    source={slide.image}
                    className="w-72 h-56 rounded-3xl"
                    style={{ backgroundColor: slide.imageColor }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="w-72 h-56 rounded-3xl items-center justify-center"
                    style={{ backgroundColor: slide.imageColor }}
                  >
                    <Text className="text-5xl text-white">📱</Text>
                    <Text className="text-white font-semibold mt-2">
                      Imagen del slide {slide.id}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View className="mb-8">
                <Text className="text-base text-muted-foreground leading-relaxed text-center">
                  {slide.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}