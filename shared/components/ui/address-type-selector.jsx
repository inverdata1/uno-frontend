import React, { useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';
import { useAddressTypes } from '../../hooks/use-address-types';

/**
 * AddressTypeSelector - Card-based modern UI for address type selection
 * Inspired by modern app design patterns (Airbnb, Uber, etc.)
 */
export const AddressTypeSelector = ({
  value,
  onChange,
  userType = 'client',
  error,
  className = '',
  disabled = false
}) => {
  const { data: addressTypes = [], isLoading, error: queryError } = useAddressTypes(userType);

  // Debug logging
  console.log('AddressTypeSelector - userType:', userType);
  console.log('AddressTypeSelector - addressTypes:', addressTypes);

  const getTypeIcon = (typeId) => {
    const iconMap = {
      'CLIENT_HOME': 'home',
      'CLIENT_WORK': 'business',
      'CLIENT_OTHER': 'location',
      'BUSINESS_MAIN': 'storefront',
      'BUSINESS_BRANCH': 'business',
      'BUSINESS_WAREHOUSE': 'cube',
      'BUSINESS_PICKUP': 'basket',
      'DRIVER_BASE': 'car',
      'DRIVER_ZONE': 'map'
    };
    return iconMap[typeId] || 'location';
  };

  const getTypeColor = (typeId) => {
    const colorMap = {
      'CLIENT_HOME': '#10b981', // emerald
      'CLIENT_WORK': '#3b82f6', // blue
      'CLIENT_OTHER': '#8b5cf6', // violet
      'BUSINESS_MAIN': '#f59e0b', // amber
      'BUSINESS_BRANCH': '#ef4444', // red
      'BUSINESS_WAREHOUSE': '#6b7280', // gray
      'BUSINESS_PICKUP': '#ec4899', // pink
      'DRIVER_BASE': '#06b6d4', // cyan
      'DRIVER_ZONE': '#84cc16'  // lime
    };
    return colorMap[typeId] || '#6b7280';
  };

  if (isLoading) {
    return (
      <View className={cn("min-h-[120px] justify-center items-center", className)}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 text-sm mt-2">Cargando tipos de dirección...</Text>
      </View>
    );
  }

  if (queryError) {
    return (
      <View className={cn("min-h-[120px] justify-center items-center bg-red-50 rounded-2xl p-4", className)}>
        <Ionicons name="alert-circle" size={32} color="#ef4444" />
        <Text className="text-red-600 text-sm mt-2 text-center">
          Error al cargar tipos de dirección
        </Text>
      </View>
    );
  }

  return (
    <View className={cn("space-y-3", className)}>
      <Text className="text-lg font-semibold text-foreground mb-2">
        Tipo de dirección *
      </Text>

      {/* Grid layout for better spacing */}
      <View className="flex-row flex-wrap gap-3">
        {addressTypes.map((type) => {
          const isSelected = value === type.id;
          const iconName = getTypeIcon(type.id);
          const color = getTypeColor(type.id);

          return (
            <Pressable
              key={type.id}
              onPress={() => !disabled && onChange(type.id)}
              disabled={disabled}
              className={cn(
                "flex-1 min-w-[45%] max-w-[48%] p-3 rounded-xl border-2",
                "bg-white",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200",
                disabled && "opacity-50"
              )}
              style={{
                shadowColor: isSelected ? '#3b82f6' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.1 : 0.03,
                shadowRadius: 4,
                elevation: isSelected ? 3 : 1,
              }}
            >
              <View className="items-center space-y-2">
                {/* Icon with dynamic color background */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={color}
                  />
                </View>

                {/* Type name */}
                <Text className={cn(
                  "font-medium text-center text-sm",
                  isSelected ? "text-blue-700" : "text-gray-900"
                )}>
                  {type.name}
                </Text>

                {/* Selection indicator */}
                {isSelected && (
                  <View className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Error message */}
      {error && (
        <View className="flex-row items-center space-x-2 mt-2">
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text className="text-red-500 text-sm">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};