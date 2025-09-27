import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../shared/components/ui';

export function WelcomeHero() {
  return (
    <View className="flex-1 justify-center">
      {/* Hero Text */}
      <View className="mb-12">
        <Text className="text-4xl font-bold text-foreground leading-tight mb-6">
          Todo lo que necesitas{'\n'}directo a tu puerta.
        </Text>
      </View>

      {/* Main Visual - Placeholder for product image */}
      <View className="items-center mb-12">
        <View className="w-80 h-64 bg-primary-500 rounded-3xl items-center justify-center">
          <Text className="text-6xl text-primary-foreground">📱</Text>
          <Text className="text-primary-foreground font-semibold mt-2">
            Imagen del producto aquí
          </Text>
        </View>
      </View>

      {/* Subtitle */}
      <View className="mb-8">
        <Text className="text-lg text-muted-foreground leading-relaxed">
          Productos, comida, medicina y más desde los mejores comercios de Venezuela.
        </Text>
      </View>
    </View>
  );
}