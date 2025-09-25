import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingActions, OnboardingCarousel, OnboardingHeader } from '../../features/onboarding/components';
import { useAppStore } from '../../shared/stores/app-store';

export default function OnboardingScreen() {
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);
  const [currentSlide, setCurrentSlide] = useState({
    backgroundColor: '#f7fafc' // Default to first slide color
  });

  // Note: We don't reset onboarding state here anymore
  // Once completed, it should stay completed

  const handleGetStarted = () => {
    setOnboardingCompleted(true);
    // Navigation will be handled by the Link component
  };

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
        <OnboardingHeader />
        <OnboardingCarousel onSlideChange={handleSlideChange} />
        <OnboardingActions onGetStarted={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}