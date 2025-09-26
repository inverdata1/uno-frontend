import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Client Mode Dashboard Content
 * Shows client-specific features and actions
 */
export const ClientModeContent = () => {
  return (
    <View className="space-y-4">
      <Card>
        <Text variant="subheading" className="mb-2">Modo Cliente</Text>
        <Text variant="body" className="mb-4">
          Encuentra y compra cualquier producto
        </Text>
        <Button variant="primary">
          Explorar Productos
        </Button>
      </Card>

      <Card>
        <Text variant="label" className="mb-2">Pedidos Recientes</Text>
        <Text variant="caption" className="text-center py-4">
          No hay pedidos recientes
        </Text>
      </Card>
    </View>
  );
};