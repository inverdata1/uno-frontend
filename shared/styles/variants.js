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
        secondary: 'bg-secondary border active:bg-muted',
        success: 'bg-success-500 active:bg-success-600',
        destructive: 'bg-destructive-500 active:bg-destructive-600',
        ghost: 'bg-transparent active:bg-secondary',
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
        primary: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        success: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
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
  'border-input rounded-md px-3 py-3 text-foreground placeholder:text-muted-foreground transition-colors',
  {
    variants: {
      variant: {
        default: 'focus:border-ring',
        error: 'border-destructive-500 focus:border-destructive-500',
        success: 'border-success-500 focus:border-success-500',
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
        default: 'bg-card border',
        elevated: 'bg-card shadow-sm',
        outline: 'border',
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