import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';
import { useBusinessContexts } from '../../../shared/hooks/use-user-modes';

/**
 * Business Dashboard Screen
 * Shows business stats and quick actions
 */
export default function BusinessDashboardScreen() {
  const businessContexts = useBusinessContexts();
  const currentBusiness = businessContexts.find(b => b.isActive) || businessContexts[0] || null;

  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          Dashboard
        </Text>
        <Text variant="body">
          {currentBusiness ?
            `Gestión de ${currentBusiness.businessName}` :
            'Panel de administración de tu negocio'
          }
        </Text>
      </Card>

      {/* Stats Cards */}
      <View className="flex-row gap-2">
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Pedidos Hoy</Text>
          <Text variant="heading">0</Text>
        </Card>
        <Card className="flex-1">
          <Text variant="label" className="mb-1">Ingresos</Text>
          <Text variant="heading">$0</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card>
        <Text variant="subheading" className="mb-4">Acciones Rápidas</Text>
        <View className="space-y-2">
          <Button variant="primary">
            Ver Pedidos Pendientes
          </Button>
          <Button variant="secondary">
            Gestionar Productos
          </Button>
          <Button variant="secondary">
            Configurar Negocio
          </Button>
        </View>
      </Card>

      {/* Recent Orders */}
      <Card>
        <Text variant="subheading" className="mb-4">Pedidos Recientes</Text>
        <Text variant="caption" className="text-center py-8">
          No hay pedidos recientes
        </Text>
      </Card>
    </View>
  );
}
