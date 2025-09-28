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

  // Sort address types by priority order
  const getSortOrder = (typeId) => {
    const priorityOrder = {
      'CLIENT_HOME': 1,
      'CLIENT_WORK': 2,
      'CLIENT_OTHER': 3,
      'BUSINESS_MAIN': 1,
      'BUSINESS_BRANCH': 2,
      'BUSINESS_WAREHOUSE': 3,
      'BUSINESS_PICKUP': 4,
      'DRIVER_BASE': 1,
      'DRIVER_ZONE': 2
    };
    return priorityOrder[typeId] || 999;
  };

  const sortedAddressTypes = [...addressTypes].sort((a, b) => getSortOrder(a.id) - getSortOrder(b.id));

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
    <View className={cn("space-y-3 mb-6", className)}>
      <Text className="text-sm font-medium text-foreground mb-2">
        Tipo de dirección *
      </Text>

      {/* iOS-style segmented control */}
      <View className="bg-gray-100 p-1 rounded-xl">
        <View className="flex-row">
          {sortedAddressTypes.map((type, index) => {
            const isSelected = value === type.id;
            const iconName = getTypeIcon(type.id);
            const color = getTypeColor(type.id);

            return (
              <Pressable
                key={type.id}
                onPress={() => !disabled && onChange(type.id)}
                disabled={disabled}
                className={cn(
                  "flex-1 flex-row items-center justify-center px-3 py-2 rounded-lg",
                  isSelected
                    ? "bg-white"
                    : "bg-transparent",
                  disabled && "opacity-50"
                )}
                style={{
                  shadowColor: isSelected ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isSelected ? 0.1 : 0,
                  shadowRadius: 2,
                  elevation: isSelected ? 2 : 0,
                }}
              >
                {/* Icon */}
                <Ionicons
                  name={iconName}
                  size={16}
                  color={isSelected ? color : '#6b7280'}
                  style={{ marginRight: 4 }}
                />

                {/* Type name */}
                <Text className={cn(
                  "font-medium text-sm text-center",
                  isSelected ? "text-gray-900" : "text-gray-500"
                )} numberOfLines={1}>
                  {type.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
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