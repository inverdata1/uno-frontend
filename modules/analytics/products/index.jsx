import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Business Products Screen
 * Manage product catalog
 */
export default function BusinessProductsScreen() {
  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          Productos
        </Text>
        <Text variant="body">
          Gestiona el catálogo de tu negocio
        </Text>
      </Card>

      {/* Add Product */}
      <Card>
        <View className="flex-row justify-between items-center mb-4">
          <Text variant="subheading">Mi Catálogo</Text>
          <Button variant="primary" size="sm">
            + Agregar
          </Button>
        </View>

        <Text variant="caption" className="text-center py-8">
          No hay productos en tu catálogo
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
}
