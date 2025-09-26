import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../ui/text';
import { Card } from '../ui/card';
import { useModeStore } from '../../stores/mode-store';
import { useCurrentMode, useSwitchMode, useBusinessContexts } from '../../../features/auth/api/use-user-modes';

/**
 * Mode Switcher Component
 * Allows users to switch between available modes (client, business, delivery)
 */
export const ModeSwitcher = ({ style, onModeSwitch }) => {
  const { switchMode } = useModeStore();
  const { currentMode, availableModes, isLoading } = useCurrentMode();
  const businessContexts = useBusinessContexts();
  const switchModeMutation = useSwitchMode();

  const handleModeSwitch = async (mode, businessId = null, branchId = null) => {
    try {
      // Call API to switch mode
      await switchModeMutation.mutateAsync({ mode, businessId, branchId });

      // Update local store
      switchMode(mode, { businessId, branchId });

      // Notify parent component
      onModeSwitch?.({ mode, businessId, branchId });
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  const getModeDisplayName = (mode) => {
    const names = {
      client: 'Cliente',
      business: 'Negocio',
      delivery: 'Repartidor'
    };
    return names[mode] || mode;
  };

  const getModeIcon = (mode) => {
    const icons = {
      client: '👤',
      business: '🏪',
      delivery: '🚗'
    };
    return icons[mode] || '❓';
  };

  if (isLoading) {
    return (
      <Card style={[{ padding: 16, alignItems: 'center' }, style]}>
        <ActivityIndicator size="small" />
        <Text style={{ marginTop: 8, color: '#666' }}>Cargando modos...</Text>
      </Card>
    );
  }

  return (
    <Card style={[{ padding: 16 }, style]}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Cambiar Modo
      </Text>

      <View style={{ gap: 12 }}>
        {availableModes.map((mode) => {
          const isActive = currentMode === mode;

          return (
            <View key={mode}>
              {/* Main mode button */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: isActive ? '#007AFF20' : '#F5F5F5',
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? '#007AFF' : '#E0E0E0'
                }}
                onPress={() => handleModeSwitch(mode)}
                disabled={switchModeMutation.isPending}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>
                  {getModeIcon(mode)}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#007AFF' : '#000'
                  }}>
                    {getModeDisplayName(mode)}
                  </Text>

                  {isActive && (
                    <Text style={{ fontSize: 12, color: '#007AFF', marginTop: 2 }}>
                      Modo activo
                    </Text>
                  )}
                </View>

                {switchModeMutation.isPending && (
                  <ActivityIndicator size="small" color="#007AFF" />
                )}
              </TouchableOpacity>

              {/* Business contexts submenu */}
              {mode === 'business' && isActive && businessContexts.length > 0 && (
                <View style={{
                  marginTop: 8,
                  marginLeft: 16,
                  paddingLeft: 16,
                  borderLeftWidth: 2,
                  borderLeftColor: '#007AFF20'
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#666',
                    marginBottom: 8
                  }}>
                    Seleccionar Negocio:
                  </Text>

                  {businessContexts.map((business) => (
                    <TouchableOpacity
                      key={business.businessId}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        backgroundColor: '#F8F9FA',
                        marginBottom: 4
                      }}
                      onPress={() => handleModeSwitch(mode, business.businessId)}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500' }}>
                        {business.businessName}
                      </Text>

                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {business.businessType}
                      </Text>

                      {/* Branches */}
                      {business.branches.length > 0 && (
                        <View style={{ marginTop: 4, gap: 2 }}>
                          {business.branches.map((branch) => (
                            <TouchableOpacity
                              key={branch.id}
                              style={{
                                padding: 4,
                                paddingLeft: 12,
                                backgroundColor: '#FFF',
                                borderRadius: 4
                              }}
                              onPress={() => handleModeSwitch(mode, business.businessId, branch.id)}
                            >
                              <Text style={{ fontSize: 12 }}>
                                📍 {branch.name}
                                {branch.isMain && ' (Principal)'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Show available upgrade options */}
      {!availableModes.includes('business') && (
        <View style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#F0F8FF',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#007AFF20'
        }}>
          <Text style={{ fontSize: 14, color: '#007AFF', marginBottom: 4 }}>
            ¿Tienes un negocio?
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Activa el modo negocio para gestionar tu empresa
          </Text>
        </View>
      )}

      {!availableModes.includes('delivery') && (
        <View style={{
          marginTop: 8,
          padding: 12,
          backgroundColor: '#F0FFF0',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#28A74520'
        }}>
          <Text style={{ fontSize: 14, color: '#28A745', marginBottom: 4 }}>
            ¿Quieres ser repartidor?
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Únete como repartidor y empieza a generar ingresos
          </Text>
        </View>
      )}
    </Card>
  );
};