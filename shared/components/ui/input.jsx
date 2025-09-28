import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native';
import { cn } from '../../utils/cn';
import { Text } from './text';

export const Input = ({
  className,
  error,
  secureTextEntry,
  _isExternallyFocused,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  // Use external focus state if provided, otherwise use internal state
  const actuallyFocused = _isExternallyFocused !== undefined ? _isExternallyFocused : isFocused;

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
            'text-foreground text-base font-medium ',
            // Elegant placeholder styles
            'placeholder:text-gray-400 placeholder:font-light placeholder:tracking-wide',
            'placeholder:italic placeholder:text-[15px]',
            // Base state
            'bg-gray-50/40 border-gray-400',
            // Focused state (overrides base)
            actuallyFocused && 'border-primary-500 bg-white placeholder:text-gray-500 placeholder:not-italic',
            // Error state (overrides both base and focused)
            error && 'border-red-400 bg-red-50 placeholder:text-red-400',
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
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}
      </View>

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