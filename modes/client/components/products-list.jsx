import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../shared/components/ui';

/**
 * Products List Component for Client Mode
 * Shows available restaurants and products
 */
export const ProductsList = () => {
  return (
    <View className="p-4">
      <Text variant="heading" className="mb-4">
        Restaurantes y Productos
      </Text>
      <View className="bg-card p-6 rounded-lg border border-border">
        <Text variant="body" className="text-muted-foreground text-center">
          Proximamente verás todos los restaurantes disponibles.
        </Text>
        <Text variant="caption" className="text-muted-foreground text-center mt-2">
          Función en desarrollo 🚀
        </Text>
      </View>
    </View>
  );
};