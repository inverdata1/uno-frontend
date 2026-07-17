import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';

export const MapPicker = ({
  onLocationSelect,
  initialLocation = null,
  className = "",
  height = 300
}) => {
  return (
    <View className={cn("rounded-xl overflow-hidden", className)}>
      <View style={{ height, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="map-outline" size={48} color="#9CA3AF" className="mb-2" />
        <Text className="text-gray-500 font-medium text-center px-4">
          El mapa interactivo no está disponible en la versión web. Por favor usa la app móvil.
        </Text>
      </View>
      <View className="bg-gray-50 p-4">
        <View className="flex-row items-center">
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2 flex-1">
            Solo disponible en app nativa
          </Text>
        </View>
      </View>
    </View>
  );
};
