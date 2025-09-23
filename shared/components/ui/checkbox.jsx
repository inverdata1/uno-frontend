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
        <Text variant="caption" className="text-destructive mt-1 ml-8">
          {error}
        </Text>
      )}
    </View>
  );
}