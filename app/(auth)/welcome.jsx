import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeActions, WelcomeCarousel, WelcomeHeader } from '../../auth/components/welcome';

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState({
    backgroundColor: '#f7fafc' // Default to first slide color
  });

  const handleSlideChange = (slide) => {
    setCurrentSlide(slide);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: currentSlide.backgroundColor }}
      edges={['top', 'bottom']}
    >
      <View className="flex-1">
        <WelcomeHeader />
        <WelcomeCarousel onSlideChange={handleSlideChange} />
        <WelcomeActions />
      </View>
    </SafeAreaView>
  );
}