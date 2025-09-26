import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '../ui';
import { useModeStore } from '../../stores/mode-store';
import { useCurrentMode, useSwitchMode, useBusinessContexts } from '../../../features/auth/shared/hooks/use-user-modes';
import { getModeConfig } from '../../config/modes';
import { colors } from '../../utils/colors';

export const ModeSwitcherModal = ({ visible, onClose, onModeSwitch }) => {
  const { switchMode } = useModeStore();
  const { currentMode, availableModes = [], isLoading } = useCurrentMode();
  const businessContexts = useBusinessContexts() || [];
  const switchModeMutation = useSwitchMode();
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Bottom sheet ref
  const bottomSheetRef = useRef(null);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    console.log('ModeSwitcher bottom sheet index changed to:', index);
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Effect to control bottom sheet visibility
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0); // Go to 85% height (first and only snap point)
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleModeSwitch = async (mode, businessId = null, branchId = null) => {
    try {
      await switchModeMutation.mutateAsync({ mode, businessId, branchId });
      switchMode(mode, { businessId, branchId });
      onModeSwitch?.({ mode, businessId, branchId });
      onClose();
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  // Use the standardized getModeConfig utility

  const ModeCard = ({ mode, isActive, onPress, isAvailable }) => {
    const config = getModeConfig(mode);

    return (
      <TouchableOpacity
        onPress={() => isAvailable && onPress(mode)}
        style={{
          marginBottom: 12,
          opacity: isAvailable ? 1 : 0.5
        }}
        activeOpacity={0.95}
        disabled={!isAvailable}
      >
        <View style={{
          backgroundColor: isActive ? config.primary : colors.bg.primary,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: isActive ? config.primary : colors.border.light,
          shadowColor: isActive ? config.primary : '#000',
          shadowOffset: { width: 0, height: isActive ? 4 : 2 },
          shadowOpacity: isActive ? 0.2 : 0.08,
          shadowRadius: isActive ? 8 : 4,
          elevation: isActive ? 6 : 2,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : config.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons
                name={config.icon}
                size={20}
                color={isActive ? colors.text.inverse : config.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: isActive ? colors.text.inverse : colors.text.primary,
                marginBottom: 2
              }}>
                {config.title}
              </Text>
              <Text style={{
                fontSize: 12,
                color: isActive ? 'rgba(255, 255, 255, 0.8)' : colors.text.secondary
              }}>
                {config.subtitle}
              </Text>
            </View>

            {isActive && (
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={{
            fontSize: 13,
            lineHeight: 18,
            color: isActive ? 'rgba(255, 255, 255, 0.9)' : colors.text.secondary,
            marginBottom: 10
          }}>
            {config.description}
          </Text>

          {/* Benefits */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {config.benefits.slice(0, 2).map((benefit, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : config.background,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isActive ? 'rgba(255, 255, 255, 0.2)' : config.primary + '20'
                }}
              >
                <Text style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: isActive ? colors.text.inverse : config.primary
                }}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      snapPoints={['85%']}
      enablePanDownToClose={true}
      animationConfigs={{
        duration: 250,
      }}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
    >
      <BottomSheetView style={{ flex: 1, paddingBottom: 32 }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24
      }}>
        <View>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 4
          }}>
            Cambiar Modo
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.text.secondary
          }}>
            Selecciona cómo quieres usar UNO
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.bg.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Modes */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: 32
      }}>
        {isLoading ? (
          // Loading state
          <View style={{
            alignItems: 'center',
            paddingVertical: 40
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary
            }}>
              Cargando modos disponibles...
            </Text>
          </View>
        ) : availableModes.length > 0 ? (
          availableModes.map((mode) => (
            <ModeCard
              key={mode}
              mode={mode}
              isActive={currentMode === mode}
              isAvailable={true}
              onPress={handleModeSwitch}
            />
          ))
        ) : (
          // No modes available
          <View style={{
            alignItems: 'center',
            paddingVertical: 40
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary,
              textAlign: 'center'
            }}>
              No hay modos disponibles
            </Text>
          </View>
        )}

      </View>
      </BottomSheetView>
    </BottomSheet>
  );
};