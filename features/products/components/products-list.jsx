import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text, Input } from '../../../shared/components/ui';

/**
 * Products List Component
 * Shows browsable products for client mode
 */
export const ProductsList = () => {
  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          🛍️ Productos
        </Text>
        <Text variant="body">
          Encuentra todo lo que necesitas
        </Text>
      </Card>

      {/* Search */}
      <Card>
        <Text variant="label" className="mb-2">Buscar</Text>
        <Input placeholder="Buscar productos, servicios..." />
      </Card>

      {/* Categories */}
      <Card>
        <Text variant="subheading" className="mb-4">Categorías</Text>
        <View className="flex-row flex-wrap gap-2">
          {['Comida', 'Farmacia', 'Supermercado', 'Ropa', 'Electrónicos'].map((category) => (
            <Button key={category} variant="secondary" size="sm">
              {category}
            </Button>
          ))}
        </View>
      </Card>

      {/* Businesses List */}
      <Card>
        <Text variant="subheading" className="mb-4">Negocios Cercanos</Text>
        <Text variant="caption" className="text-center py-8">
          No hay negocios disponibles en tu área
        </Text>
      </Card>
    </View>
  );
};