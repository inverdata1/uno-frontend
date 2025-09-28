import React, { useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';
import { useAddressTypes } from '../../hooks/use-address-types';

/**
 * AddressTypeSelector - Selector for address types based on user type
 * Loads available address types from Firebase and allows selection
 */
export const AddressTypeSelector = ({
  value,
  onChange,
  userType = 'client',
  error,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: addressTypes = [], isLoading, error: queryError } = useAddressTypes(userType);

  const selectedType = addressTypes.find(type => type.id === value);

  const handleSelect = (typeId) => {
    onChange(typeId);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <View className={cn("h-12 px-4 border border-gray-400 rounded-xl flex-row items-center", className)}>
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="text-gray-500 ml-2">Cargando tipos...</Text>
      </View>
    );
  }

  return (
    <View className={cn("relative", className)}>
      {/* Selector Button */}
      <Pressable
        onPress={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "h-12 px-4 border rounded-xl flex-row items-center justify-between",
          "bg-white",
          error ? "border-red-400" : "border-gray-400",
          disabled ? "opacity-50" : "active:scale-[0.98]"
        )}
        disabled={disabled}
      >
        <Text className={cn(
          "flex-1",
          selectedType ? "text-foreground" : "text-gray-400 italic font-light tracking-wide"
        )}>
          {selectedType ? selectedType.name : "Selecciona el tipo de dirección"}
        </Text>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </Pressable>

      {/* Error Message */}
      {error && (
        <Text className="text-red-400 text-sm mt-1 ml-1">
          {error}
        </Text>
      )}

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <View className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1",
          "bg-white border border-gray-200 rounded-xl shadow-lg",
          "max-h-48"
        )}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="py-2"
          >
            {addressTypes.map((type, index) => (
              <Pressable
                key={type.id}
                onPress={() => handleSelect(type.id)}
                className={cn(
                  "px-4 py-3 flex-row items-center",
                  "active:bg-gray-50",
                  index < addressTypes.length - 1 && "border-b border-gray-100"
                )}
              >
                <View className="flex-1">
                  <Text className="text-foreground font-medium">
                    {type.name}
                  </Text>
                  {type.description && (
                    <Text className="text-gray-500 text-sm mt-0.5">
                      {type.description}
                    </Text>
                  )}
                </View>

                {value === type.id && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#059669"
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <Pressable
          onPress={() => setIsOpen(false)}
          className="absolute inset-0 -z-10"
          style={{
            top: -1000,
            bottom: -1000,
            left: -1000,
            right: -1000
          }}
        />
      )}
    </View>
  );
};