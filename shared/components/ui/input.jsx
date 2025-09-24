import React, { useState, useRef, useEffect } from 'react';
import { TextInput, View, Keyboard, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cn } from '../../utils/cn';
import { Text } from './text';

export const Input = ({
  className,
  error,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const isPasswordField = secureTextEntry === true;

  return (
    <View className="mb-3">
      <View className="relative">
        <TextInput
          ref={inputRef}
          className={cn(
            'border rounded-xl px-4 py-4',
            'text-foreground placeholder:text-gray-400 text-base',
            'bg-gray-50 border-gray-200',
            error && 'border-red-300 bg-red-50',
            isFocused && !error && 'border-primary-500 bg-white',
            isPasswordField && 'pr-12', // Add padding for eye icon
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPasswordField ? !showPassword : false}
          {...props}
        />

        {/* Password visibility toggle */}
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 bottom-4 justify-center"
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}
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