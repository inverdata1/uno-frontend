import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';
import { useVenezuelanStates } from '../../hooks/use-venezuelan-states';

/**
 * StateSelector - Elegant searchable dropdown for Venezuelan states
 * Features modern design with search functionality and smooth interactions
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

  const getStateFlag = (stateCode) => {
    // Venezuela flag emoji for all states
    return '🇻🇪';
  };

  if (isLoading) {
    return (
      <View className={cn("space-y-2", className)}>
        <Text className="text-lg font-semibold text-foreground">
          Estado *
        </Text>
        <View className="h-14 bg-gray-100 rounded-2xl justify-center items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View className={cn("space-y-2 relative", className)}>
      <Text className="text-lg font-semibold text-foreground">
        Estado *
      </Text>

      {/* Main selector button */}
      <Pressable
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "h-14 px-4 flex-row items-center justify-between",
          "bg-white border-2 rounded-2xl",
          isOpen ? "border-blue-500 bg-blue-50" : "border-gray-200",
          error && !isOpen && "border-red-300 bg-red-50",
          disabled && "opacity-50 bg-gray-100"
        )}
        style={{
          shadowColor: isOpen ? '#3b82f6' : '#000',
          shadowOffset: { width: 0, height: isOpen ? 4 : 2 },
          shadowOpacity: isOpen ? 0.1 : 0.03,
          shadowRadius: isOpen ? 8 : 4,
          elevation: isOpen ? 4 : 1,
        }}
      >
        <View className="flex-row items-center flex-1">
          {selectedState && (
            <View className="mr-3 w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
              <Text className="text-lg">{getStateFlag(selectedState.code)}</Text>
            </View>
          )}

          <View className="flex-1">
            {selectedState ? (
              <View>
                <Text className="text-gray-900 font-medium">
                  {selectedState.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {selectedState.code}
                </Text>
              </View>
            ) : (
              <Text className="text-gray-400">
                Selecciona un estado
              </Text>
            )}
          </View>
        </View>

        <View className={cn(
          "w-8 h-8 rounded-full items-center justify-center transition-all",
          isOpen ? "bg-blue-500" : "bg-gray-200"
        )}>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color={isOpen ? "white" : "#6b7280"}
          />
        </View>
      </Pressable>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <View className="absolute top-full left-0 right-0 z-50 mt-2">
          <View
            className="bg-white border border-gray-200 rounded-2xl shadow-xl max-h-80"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Search input */}
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2">
                <Ionicons name="search" size={16} color="#6b7280" />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Buscar estado..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-2 text-gray-900"
                  autoFocus
                />
                {searchText.length > 0 && (
                  <Pressable onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={16} color="#6b7280" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* States list */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="max-h-64"
            >
              {filteredStates.map((state, index) => (
                <Pressable
                  key={state.id}
                  onPress={() => handleSelect(state.id)}
                  className={cn(
                    "px-4 py-3 flex-row items-center",
                    "active:bg-blue-50",
                    value === state.id && "bg-blue-50",
                    index < filteredStates.length - 1 && "border-b border-gray-50"
                  )}
                >
                  <View className="mr-3 w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <Text className="text-sm">{getStateFlag(state.code)}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className={cn(
                      "font-medium",
                      value === state.id ? "text-blue-700" : "text-gray-900"
                    )}>
                      {state.name}
                    </Text>
                    <Text className={cn(
                      "text-xs",
                      value === state.id ? "text-blue-600" : "text-gray-500"
                    )}>
                      {state.code}
                    </Text>
                  </View>

                  {value === state.id && (
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </Pressable>
              ))}

              {filteredStates.length === 0 && searchText.length > 0 && (
                <View className="p-8 items-center">
                  <Ionicons name="search" size={32} color="#d1d5db" />
                  <Text className="text-gray-400 mt-2">
                    No se encontraron estados
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Intenta con otro término
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View className="flex-row items-center space-x-2 mt-1">
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text className="text-red-500 text-sm">
            {error}
          </Text>
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
            right: -1000,
          }}
        />
      )}
    </View>
  );
};