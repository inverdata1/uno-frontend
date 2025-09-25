import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './text';

export function Checkbox({ checked = false, onCheckedChange, error, children, ...props }) {
  return (
    <View>
      <Pressable
        onPress={() => onCheckedChange && onCheckedChange(!checked)}
        className="flex-row items-center"
        {...props}
      >
        <View
          className={`
            w-5 h-5 mr-3 border-2 rounded items-center justify-center
            ${checked
              ? 'bg-primary-500 border-primary-500'
              : 'bg-card border-border'
            }
          `}
        >
          {checked && (
            <Text className="text-xs text-primary-foreground font-bold">✓</Text>
          )}
        </View>
        {children}
      </Pressable>

      {error && (
        <View className="flex-row items-center mt-2 ml-8">
          <Text className="text-red-500 text-xs mr-1">⚠</Text>
          <Text className="text-red-500 text-xs font-medium flex-1">
            {typeof error === 'string' ? error :
             typeof error === 'object' && error.message ? error.message :
             'Invalid input'}
          </Text>
        </View>
      )}
    </View>
  );
}