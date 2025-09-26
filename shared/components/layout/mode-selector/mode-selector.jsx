import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../ui/text';

/**
 * Enhanced Mode Selector
 * Beautiful cards with detailed information and stats
 */
const ModeCard = ({ mode, selected, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(mode.id)}
    activeOpacity={0.95}
    className="mb-4"
  >
    <View style={{
      backgroundColor: selected ? '#fef2f2' : '#ffffff',
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? '#ef4444' : '#e5e7eb',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: selected ? 0.15 : 0.08,
      shadowRadius: selected ? 12 : 6,
      elevation: selected ? 6 : 2
    }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: selected ? 'rgba(255, 255, 255, 0.8)' : '#f8fafc',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16
          }}>
            <Ionicons name={mode.icon} size={24} color={selected ? '#ef4444' : '#64748b'} />
          </View>
          <View className="flex-1">
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: selected ? '#ef4444' : '#1f2937'
            }}>
              {mode.title}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              {mode.description}
            </Text>
          </View>
        </View>

        {/* Selection Indicator */}
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: selected ? '#ef4444' : '#d1d5db',
          backgroundColor: selected ? '#ef4444' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {selected && (
            <Ionicons name="checkmark" size={18} color="#ffffff" />
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export const ModeSelector = ({ selectedMode, onModeSelect, style }) => {
  const modes = [
    {
      id: 'client',
      title: 'Cliente',
      icon: 'basket-outline',
      description: 'Compra cualquier producto y recíbelo donde estés'
    },
    {
      id: 'business',
      title: 'Negocio',
      icon: 'briefcase-outline',
      description: 'Vende tus productos y haz crecer tu negocio'
    },
    {
      id: 'delivery',
      title: 'Delivery',
      icon: 'bicycle-outline',
      description: 'Gana dinero entregando en tu tiempo libre'
    }
  ];

  const isSelected = (modeId) => selectedMode === modeId;

  return (
    <View style={style}>
      {/* Header */}
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-foreground mb-2 text-center">
          ¿Cómo quieres usar UNO?
        </Text>
        <Text className="text-base text-muted-foreground text-center px-4 leading-relaxed">
          Selecciona tu modo principal para comenzar
        </Text>
      </View>

      {/* Mode Cards */}
      <View className="space-y-4">
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            selected={isSelected(mode.id)}
            onSelect={onModeSelect}
          />
        ))}
      </View>

      {/* Bottom Info */}
      <View className="mt-6 items-center">
        <View style={{
          backgroundColor: '#f8fafc',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="information-circle-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <Text className="text-sm text-slate-600 flex-1">
            Puedes habilitar otros modos después desde tu perfil
          </Text>
        </View>
      </View>
    </View>
  );
};