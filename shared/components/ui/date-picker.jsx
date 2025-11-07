import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '../../utils/cn';

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  error,
  className,
  disabled = false,
  minimumDate,
  maximumDate,
  ...props
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChange = (event, selectedDate) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
      // Only update if user confirmed (not dismissed/cancelled)
      if (event.type === 'set' && selectedDate && onChange) {
        onChange(selectedDate);
      }
    } else {
      // On iOS, update the temp date as user scrolls
      if (selectedDate && onChange) {
        onChange(selectedDate);
      }
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  return (
    <View className={cn('mb-3', className)}>
      <Pressable
        onPress={openPicker}
        className={cn(
          'flex-row items-center justify-between px-4 py-4 border rounded-xl',
          'text-base',
          // Base state - match Input component
          'bg-gray-50 border-gray-400',
          // Error state - match Input component
          error && 'border-red-300 bg-red-50',
          // Disabled state
          disabled && 'opacity-50',
          // Active state
          'active:border-primary-500 active:bg-white'
        )}
        disabled={disabled}
        {...props}
      >
        <Text
          className={cn(
            'flex-1 text-base',
            value ? 'text-foreground' : 'text-gray-400'
          )}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
      </Pressable>

      {error && (
        <Text className="text-red-500 text-sm mt-1 px-1">
          {error}
        </Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="spinner"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};