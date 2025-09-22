import React from 'react';
import { TextInput } from 'react-native';
import { cn } from '../../utils/cn';

export const Input = ({
  className,
  ...props
}) => {
  return (
    <TextInput
      className={cn(
        'border-input rounded-md px-3 py-3',
        'text-foreground placeholder:text-muted-foreground',
        'focus:border-ring',
        className
      )}
      {...props}
    />
  );
};