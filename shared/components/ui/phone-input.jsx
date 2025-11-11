import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';
import { cn } from '../../utils/cn';
import { Text } from './text';

export const PhoneInput = ({
  className,
  error,
  value = '',
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChangeText = (text) => {
    // Only allow numbers and limit to 11 digits
    const numbersOnly = text.replace(/[^0-9]/g, '');
    const limitedText = numbersOnly.slice(0, 11);
    onChangeText?.(limitedText);
  };

  // Format display value (add spaces for readability)
  const formatDisplayValue = (val) => {
    if (!val) return '';
    // Format as 04XX XXX XXXX for better readability
    if (val.length <= 4) return val;
    if (val.length <= 7) return `${val.slice(0, 4)} ${val.slice(4)}`;
    return `${val.slice(0, 4)} ${val.slice(4, 7)} ${val.slice(7)}`;
  };

  // Clean value (remove any international prefix but keep leading 0)
  const cleanValue = value.replace(/^\+?58/, '');

  return (
    <View className="mb-3">
      <TextInput
        ref={inputRef}
        className={cn(
          'border rounded-xl px-4 py-4',
          'text-foreground text-base',
          // Placeholder styles
          'placeholder:text-gray-400',
          // Base state
          'bg-gray-50 border-gray-400',
          // Focused state (overrides base)
          isFocused && 'border-primary-500 bg-white',
          // Error state (overrides both base and focused)
          error && 'border-red-400 bg-red-50 placeholder:text-red-400',
          className
        )}
        placeholder="Número de teléfono"
        value={formatDisplayValue(cleanValue)}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="numeric"
        maxLength={13} // 11 digits + 2 spaces
        {...props}
      />

      {error && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="warning-outline" size={12} color="#ef4444" style={{ marginRight: 4 }} />
          <Text className="text-red-500 text-xs font-medium flex-1">
            {(() => {
              if (typeof error === 'string') return error;
              if (error && typeof error === 'object') {
                if (error.message) return error.message;
                if (error.code) return error.code;
                return JSON.stringify(error);
              }
              return 'Invalid input';
            })()}
          </Text>
        </View>
      )}
    </View>
  );
};