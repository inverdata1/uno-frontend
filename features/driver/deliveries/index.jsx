import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../../../shared/components/ui';

/**
 * Driver Deliveries Screen
 * Shows available and active deliveries
 */
export default function DriverDeliveriesScreen() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View className="space-y-4">
      {/* Header */}
      <Card>
        <Text variant="heading" className="mb-2">
          Entregas
        </Text>
        <Text variant="body">
          Panel de control para entregas
        </Text>
      </Card>

      {/* Status Toggle */}
      <Card>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text variant="subheading">Estado</Text>
            <Text variant="caption">
              {isOnline ? 'Conectado y disponible' : 'Desconectado'}
            </Text>
          </View>
          <Button
            variant={isOnline ? 'destructive' : 'success'}
            onPress={() => setIsOnline(!isOnline)}
          >
            {isOnline ? 'Desconectar' : 'Conectar'}
          </Button>
        </View>
      </Card>

      {/* Available Deliveries */}
      <Card>
        <Text variant="subheading" className="mb-4">Entregas Disponibles</Text>
        {isOnline ? (
          <Text variant="caption" className="text-center py-8">
            No hay entregas disponibles
          </Text>
        ) : (
          <Text variant="caption" className="text-center py-8">
            Conéctate para ver entregas disponibles
          </Text>
        )}
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <Text variant="subheading" className="mb-4">Entregas Recientes</Text>
        <Text variant="caption" className="text-center py-8">
          No hay entregas recientes
        </Text>
      </Card>
    </View>
  );
}
