import React, { useState, useRef } from 'react';
import { TextInput, View, Animated } from 'react-native';
import { cn } from '../../utils/cn';
import { Text } from './text';

export const Input = ({
  className,
  error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useRef(new Animated.Value(0)).current;

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(borderOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    Animated.timing(borderOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.(e);
  };

  return (
    <View className="mb-3">
      <View className="relative">
        <TextInput
          className={cn(
            'border border-input rounded-md px-3 py-3',
            'text-foreground placeholder:text-muted-foreground',
            error && 'border-destructive',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <Animated.View
          className="absolute inset-0 rounded-md border-2 border-ring pointer-events-none"
          style={{
            opacity: borderOpacity,
          }}
        />
      </View>
      {error && (
        <Text variant="caption" className="text-destructive mt-1">
          {typeof error === 'string' ? error : error.message || 'Error'}
        </Text>
      )}
    </View>
  );
};