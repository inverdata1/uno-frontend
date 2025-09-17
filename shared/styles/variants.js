// Component variant definitions for consistent styling
import { cva } from 'class-variance-authority';

// Button variants
export const buttonVariants = cva(
  // Base styles
  'items-center justify-center rounded-md active:opacity-80 transition-opacity',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 active:bg-primary-600',
        secondary: 'bg-bg-tertiary border border-border-medium active:bg-bg-secondary',
        success: 'bg-success-500 active:bg-success-600',
        danger: 'bg-danger-500 active:bg-danger-600',
        ghost: 'bg-transparent active:bg-bg-secondary',
        outline: 'border border-primary-500 bg-transparent active:bg-primary-50',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
        xl: 'px-8 py-5',
      },
      disabled: {
        true: 'opacity-50 active:opacity-50',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Button text variants
export const buttonTextVariants = cva(
  'font-medium',
  {
    variants: {
      variant: {
        primary: 'text-text-inverse',
        secondary: 'text-text-primary',
        success: 'text-text-inverse',
        danger: 'text-text-inverse',
        ghost: 'text-primary-500',
        outline: 'text-primary-500',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      }
    }
  }
);

// Input variants
export const inputVariants = cva(
  'border rounded-md px-3 py-3 text-text-primary placeholder:text-text-tertiary transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-bg-primary border-border-medium focus:border-primary-500',
        error: 'bg-bg-primary border-danger-500 focus:border-danger-500',
        success: 'bg-bg-primary border-success-500 focus:border-success-500',
      },
      size: {
        sm: 'px-2 py-2 text-sm',
        md: 'px-3 py-3 text-base',
        lg: 'px-4 py-4 text-lg',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    }
  }
);

// Card variants
export const cardVariants = cva(
  'rounded-lg',
  {
    variants: {
      variant: {
        default: 'bg-bg-primary border border-border-light',
        elevated: 'bg-bg-primary shadow-sm',
        outline: 'border border-border-medium',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    }
  }
);