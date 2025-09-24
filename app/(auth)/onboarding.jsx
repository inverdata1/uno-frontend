import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingHeader, OnboardingCarousel, OnboardingActions } from '../../features/onboarding/components';
import { useAppStore } from '../../shared/stores/app-store';

export default function OnboardingScreen() {
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);
  const [currentSlide, setCurrentSlide] = useState({
    backgroundColor: '#FFE4CC' // Default to first slide color
  });

  // For testing - reset onboarding state when this screen loads
  React.useEffect(() => {
    setOnboardingCompleted(false);
  }, [setOnboardingCompleted]);

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