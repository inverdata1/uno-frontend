import React, { useState, useRef, useEffect } from 'react';
import { TextInput, View, Keyboard } from 'react-native';
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
      <View
        className={cn(
          'flex-row items-center border rounded-xl',
          'bg-gray-50 border-gray-200',
          error && 'border-red-300 bg-red-50',
          isFocused && !error && 'border-primary-500 bg-white',
          className
        )}
      >
        {/* Country Code */}
        <View className="flex-row items-center px-4 py-4 border-r border-gray-300">
          <Text className="text-foreground font-medium">+58</Text>
        </View>

        {/* Phone Number Input */}
        <TextInput
          ref={inputRef}
          className={cn(
            'flex-1 px-3 py-4 text-foreground text-base',
            'placeholder:text-gray-400'
          )}
          placeholder="04XX XXX XXXX"
          value={formatDisplayValue(cleanValue)}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={13} // 11 digits + 2 spaces
          {...props}
        />
      </View>

      {error && (
        <View className="flex-row items-center mt-2">
          <Text className="text-red-500 text-xs mr-1">⚠</Text>
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