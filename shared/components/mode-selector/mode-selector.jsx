import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { Card } from '../ui/card';

/**
 * Mode Selector Component for Registration
 * Shows available modes with descriptions and benefits
 */
export const ModeSelector = ({ selectedMode, onModeSelect, style }) => {
  const modes = [
    {
      id: 'client',
      title: '👤 Cliente',
      description: 'Compra cualquier producto y recíbelo donde estés',
      benefits: ['Delivery rápido', 'Cualquier tipo de producto', 'Ofertas especiales'],
      recommended: true
    },
    {
      id: 'business',
      title: '🏪 Negocio',
      description: 'Vende tus productos y servicios con delivery',
      benefits: ['Aumenta tus ventas', 'Gestión completa', 'Análisis detallados'],
      popular: false
    },
    {
      id: 'delivery',
      title: '🚗 Repartidor',
      description: 'Gana dinero entregando cualquier tipo de productos',
      benefits: ['Horarios flexibles', 'Ganancias por entrega', 'Propinas adicionales'],
      popular: false
    }
  ];

  return (
    <View style={style}>
      <Text variant="heading" className="mb-2 text-center">
        ¿Cómo quieres usar UNO?
      </Text>
      <Text variant="body" className="mb-6 text-center text-muted-foreground">
        Selecciona tu modo principal (puedes cambiar después)
      </Text>

      <View className="space-y-4">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;

          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => onModeSelect(mode.id)}
              activeOpacity={0.7}
            >
              <Card style={{
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? '#007AFF' : '#E0E0E0',
                backgroundColor: isSelected ? '#007AFF10' : 'white'
              }}>
                <View className="flex-row items-start">
                  {/* Mode Icon & Title */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: isSelected ? '#007AFF' : '#000'
                      }}>
                        {mode.title}
                      </Text>

                      {mode.recommended && (
                        <View style={{
                          backgroundColor: '#28A745',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          marginLeft: 8
                        }}>
                          <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                            Recomendado
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text variant="body" className="mb-3 text-muted-foreground">
                      {mode.description}
                    </Text>

                    {/* Benefits */}
                    <View className="space-y-1">
                      {mode.benefits.map((benefit, index) => (
                        <View key={index} className="flex-row items-center">
                          <Text style={{ color: '#28A745', marginRight: 6 }}>✓</Text>
                          <Text variant="caption">{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Selection indicator */}
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? '#007AFF' : '#CCC',
                    backgroundColor: isSelected ? '#007AFF' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 12
                  }}>
                    {isSelected && (
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text variant="caption" className="mt-4 text-center text-muted-foreground">
        💡 Puedes habilitar otros modos después desde tu perfil
      </Text>
    </View>
  );
};