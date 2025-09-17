import React from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '../../utils/cn';

export const Text = ({
  variant = 'body',
  className,
  children,
  ...props
}) => {
  return (
    <RNText
      className={cn(
        // Base styles
        'text-text-primary',

        // Variant styles
        variant === 'heading' && 'text-2xl font-bold',
        variant === 'subheading' && 'text-xl font-semibold',
        variant === 'body' && 'text-base',
        variant === 'caption' && 'text-sm text-text-secondary',
        variant === 'label' && 'text-sm font-medium',

        className
      )}
      {...props}
    >
      {children}
    </RNText>
  );
};