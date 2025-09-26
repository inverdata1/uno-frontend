import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Orders List Component
 * Shows user's orders and order history
 */
export const OrdersList = () => {
  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          📦 Mis Pedidos
        </Text>
        <Text variant="body">
          Historial de tus pedidos y estado actual
        </Text>
      </Card>

      {/* Active Orders */}
      <Card>
        <Text variant="subheading" className="mb-4">Pedidos Activos</Text>
        <Text variant="caption" className="text-center py-8">
          No tienes pedidos activos
        </Text>
        <Button variant="primary" className="mt-4">
          Hacer un Pedido
        </Button>
      </Card>

      {/* Order History */}
      <Card>
        <Text variant="subheading" className="mb-4">Historial</Text>
        <Text variant="caption" className="text-center py-8">
          No hay pedidos anteriores
        </Text>
      </Card>
    </View>
  );
};