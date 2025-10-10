import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../shared/components/ui';

/**
 * Stores Screen - Client browses stores/businesses
 */
export default function StoresScreen() {
  return (
    <View className="p-4">
      <Text variant="heading" className="mb-4">
        Tiendas
      </Text>
      <View className="bg-card p-6 rounded-lg border border-border">
        <Text variant="body" className="text-muted-foreground text-center">
          Proximamente verás todas las tiendas disponibles.
        </Text>
        <Text variant="caption" className="text-muted-foreground text-center mt-2">
          Función en desarrollo 🚀
        </Text>
      </View>
    </View>
  );
}
