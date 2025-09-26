import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Delivery Mode Dashboard Content
 * Shows delivery-specific features and actions
 */
export const DeliveryModeContent = () => {
  return (
    <View className="space-y-4">
      <Card>
        <Text variant="subheading" className="mb-2">Modo Repartidor</Text>
        <Text variant="body" className="mb-4">
          Gana dinero entregando cualquier tipo de productos
        </Text>
        <Button variant="success">
          Empezar a Repartir
        </Button>
      </Card>

      <Card>
        <Text variant="label" className="mb-2">Estado</Text>
        <Text variant="body" className="text-center py-4">
          Desconectado
        </Text>
      </Card>
    </View>
  );
};