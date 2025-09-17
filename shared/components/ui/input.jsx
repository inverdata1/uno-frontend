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
        'bg-bg-primary border border-border-medium rounded-md px-3 py-3',
        'text-text-primary placeholder:text-text-tertiary',
        'focus:border-primary-500',
        className
      )}
      {...props}
    />
  );
};