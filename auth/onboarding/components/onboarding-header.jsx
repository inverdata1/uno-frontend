import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../shared/components/ui';

export function OnboardingHeader() {
  return (
    <View className="pt-12 pb-8 items-center">
      <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
        <Text className="text-xl font-bold text-primary-foreground">UNO</Text>
      </View>
    </View>
  );
}