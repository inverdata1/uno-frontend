import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Business Mode Dashboard Content
 * Shows business-specific features and actions
 */
export const BusinessModeContent = ({ businessContext }) => {
  return (
    <View className="space-y-4">
      <Card>
        <Text variant="subheading" className="mb-2">🏪 Modo Negocio</Text>
        {businessContext ? (
          <View>
            <Text variant="body" className="mb-2">
              Gestiona tu negocio: {businessContext.businessName}
            </Text>
            <Text variant="caption" className="mb-4">
              {businessContext.businessType}
            </Text>
          </View>
        ) : (
          <Text variant="body" className="mb-4">
            Administra tus negocios y pedidos
          </Text>
        )}

        <View className="flex-row gap-2">
          <Button variant="primary" size="sm">
            Ver Pedidos
          </Button>
          <Button variant="secondary" size="sm">
            Productos
          </Button>
        </View>
      </Card>

      <Card>
        <Text variant="label" className="mb-2">Resumen de Hoy</Text>
        <View className="flex-row justify-between py-2">
          <Text variant="body">Pedidos: 0</Text>
          <Text variant="body">Ingresos: $0</Text>
        </View>
      </Card>
    </View>
  );
};