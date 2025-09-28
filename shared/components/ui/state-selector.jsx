import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useVenezuelanStates } from '../../hooks/use-venezuelan-states';
import { cn } from '../../utils/cn';
import { Text } from './text';

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
  const [isOpen, setIsOpen] = useState(false);

  const { data: states = [], isLoading, error: queryError } = useVenezuelanStates();

  const selectedState = states.find(state => state.id === value);

  const handleSelect = (stateId) => {
    onChange(stateId);
    setIsOpen(false);
  };


  if (isLoading) {
    return (
      <View className={cn("", className)}>
        <View className="h-14 bg-gray-100 rounded-2xl justify-center items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View className={cn("relative mb-3", className)}>
      {/* Main selector button */}
      <Pressable
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "border rounded-xl px-4 py-4",
          "flex-row items-center justify-between",
          // Base state (matching Input component)
          "bg-gray-50/40 border-gray-400",
          // Focused state (overrides base)
          isOpen && "border-primary-500 bg-white",
          // Error state (overrides both base and focused)
          error && !isOpen && "border-red-400 bg-red-50",
          disabled && "opacity-50 bg-gray-100"
        )}
      >
        <View className="flex-row items-center flex-1">
          <View className="flex-1">
            {selectedState ? (
              <Text className="text-foreground text-base font-medium">
                {selectedState.name}
              </Text>
            ) : (
              <Text className="text-gray-400 font-light tracking-wide italic text-[15px]">
                Zulia
              </Text>
            )}
          </View>
        </View>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </Pressable>

      {/* Simple dropdown list */}
      {isOpen && !disabled && (
        <View className="absolute top-full left-0 right-0 z-50 mt-2">
          <View
            className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 12,
              height: 200, // Fixed height instead of maxHeight to prevent expansion
            }}
          >
            {/* Simple scrollable states list */}
            <BottomSheetScrollView
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              {states.map((state, index) => (
                <Pressable
                  key={state.id}
                  onPress={() => handleSelect(state.id)}
                  className={cn(
                    "px-4 py-3 flex-row items-center",
                    "active:bg-blue-50",
                    value === state.id && "bg-blue-50",
                    index < states.length - 1 && "border-b border-gray-50"
                  )}
                >
                  <View className="flex-1">
                    <Text className={cn(
                      "font-medium",
                      value === state.id ? "text-blue-700" : "text-gray-900"
                    )}>
                      {state.name}
                    </Text>
                  </View>

                  {value === state.id && (
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </Pressable>
              ))}
            </BottomSheetScrollView>
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