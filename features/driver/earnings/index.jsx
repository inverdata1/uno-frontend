import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '../../../shared/components/ui';

/**
 * Driver Earnings Screen
 * Shows earnings history and statistics
 */
export default function DriverEarningsScreen() {
  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          Ganancias
        </Text>
        <Text variant="body">
          Historial de ingresos
        </Text>
      </Card>

      {/* Earnings Stats */}
      <View className="flex-row gap-2">
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Hoy</Text>
          <Text variant="heading">$0</Text>
        </Card>
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Esta Semana</Text>
          <Text variant="heading">$0</Text>
        </Card>
      </View>

      <View className="flex-row gap-2">
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Este Mes</Text>
          <Text variant="heading">$0</Text>
        </Card>
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Total</Text>
          <Text variant="heading">$0</Text>
        </Card>
      </View>

      {/* Recent Payments */}
      <Card>
        <Text variant="subheading" className="mb-4">Historial de Pagos</Text>
        <Text variant="caption" className="text-center py-8">
          No hay pagos registrados
        </Text>
      </Card>
    </View>
  );
}
