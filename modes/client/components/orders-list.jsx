import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../shared/components/ui';

/**
 * Orders List Component for Client Mode
 * Shows user's order history and current orders
 */
export const OrdersList = () => {
  return (
    <View className="p-4">
      <Text variant="heading" className="mb-4">
        Mis Pedidos
      </Text>
      <View className="bg-card p-6 rounded-lg border border-border">
        <Text variant="body" className="text-muted-foreground text-center">
          No tienes pedidos aún.
        </Text>
        <Text variant="caption" className="text-muted-foreground text-center mt-2">
          Cuando realices tu primer pedido aparecerá aquí.
        </Text>
      </View>
    </View>
  );
};