import React from 'react';
import { View } from 'react-native';
import { BrandLogo } from '../../../../shared/components/ui/brand-logo';

export function WelcomeHeader() {
  return (
    <View className="pt-12 pb-8 items-center">
      <BrandLogo height={52} />
    </View>
  );
}