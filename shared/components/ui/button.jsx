import React from 'react';
import { Pressable, Text } from 'react-native';
import { cn } from '../../utils/cn';
import { buttonVariants, buttonTextVariants } from '../../styles/variants';

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  textClassName,
  children,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size, disabled }),
        className
      )}
      disabled={disabled}
      {...props}
    >
      <Text className={cn(
        buttonTextVariants({ variant, size }),
        textClassName
      )}>
        {children}
      </Text>
    </Pressable>
  );
};