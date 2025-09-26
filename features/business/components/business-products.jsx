import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Business Products Component
 * Shows business product management interface
 */
export const BusinessProducts = () => {
  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          🍽️ Productos
        </Text>
        <Text variant="body">
          Gestiona el menú de tu negocio
        </Text>
      </Card>

      {/* Add Product */}
      <Card>
        <View className="flex-row justify-between items-center mb-4">
          <Text variant="subheading">Mi Menú</Text>
          <Button variant="primary" size="sm">
            + Agregar
          </Button>
        </View>

        <Text variant="caption" className="text-center py-8">
          No hay productos en tu menú
        </Text>
      </Card>

      {/* Categories */}
      <Card>
        <Text variant="subheading" className="mb-4">Categorías</Text>
        <View className="space-y-2">
          <Button variant="secondary">
            Gestionar Categorías
          </Button>
        </View>
      </Card>
    </View>
  );
};