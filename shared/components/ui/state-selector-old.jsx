import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';
import { useVenezuelanStates } from '../../hooks/use-venezuelan-states';

/**
 * StateSelector - Selector for Venezuelan states
 * Loads Venezuelan states from Firebase with search functionality
 */
export const StateSelector = ({
  value,
  onChange,
  error,
  className = '',
  disabled = false
}) => {
  const [filteredStates, setFilteredStates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { data: states = [], isLoading, error: queryError } = useVenezuelanStates();

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = states.filter(state =>
        state.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates(states);
    }
  }, [searchText, states]);

  const selectedState = states.find(state => state.id === value);

  const handleSelect = (stateId) => {
    onChange(stateId);
    setIsOpen(false);
    setSearchText('');
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchText('');
    }
  };

  if (isLoading) {
    return (
      <View className={cn("h-12 px-4 border border-gray-400 rounded-xl flex-row items-center", className)}>
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="text-gray-500 ml-2">Cargando estados...</Text>
      </View>
    );
  }

  return (
    <View className={cn("relative", className)}>
      {/* Selector Button */}
      <Pressable
        onPress={handleOpen}
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
          selectedState ? "text-foreground" : "text-gray-400 italic font-light tracking-wide"
        )}>
          {selectedState ? selectedState.name : "Selecciona el estado"}
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
          "max-h-64"
        )}>
          {/* Search Input */}
          <View className="p-3 border-b border-gray-100">
            <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
              <Ionicons name="search" size={16} color="#6B7280" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar estado..."
                className="flex-1 ml-2 text-foreground"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
              />
            </View>
          </View>

          {/* States List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="py-2"
          >
            {filteredStates.length > 0 ? (
              filteredStates.map((state, index) => (
                <Pressable
                  key={state.id}
                  onPress={() => handleSelect(state.id)}
                  className={cn(
                    "px-4 py-3 flex-row items-center justify-between",
                    "active:bg-gray-50",
                    index < filteredStates.length - 1 && "border-b border-gray-100"
                  )}
                >
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">
                      {state.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {state.code}
                    </Text>
                  </View>

                  {value === state.id && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#059669"
                    />
                  )}
                </Pressable>
              ))
            ) : (
              <View className="px-4 py-6 items-center">
                <Text className="text-gray-500 text-center">
                  No se encontraron estados
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <Pressable
          onPress={() => {
            setIsOpen(false);
            setSearchText('');
          }}
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