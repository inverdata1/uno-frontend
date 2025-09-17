import React from 'react';
import { View } from 'react-native';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, ...props }) => {
  return (
    <View
      className={cn(
        'bg-bg-primary rounded-lg border border-border-light p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};