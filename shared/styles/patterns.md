# NativeWind Styling Patterns

## 🎨 Design System Overview

Our styling approach uses NativeWind with a centralized theme system for consistency and scalability.

### Core Architecture

1. **Theme Config** (`shared/config/theme.js`) - Single source of truth
2. **Variant System** (`shared/styles/variants.js`) - CVA-based component variants
3. **Utility Function** (`shared/utils/cn.js`) - Class merging utility
4. **Base Components** (`shared/components/ui/`) - Reusable styled components

## 📋 Component Development Patterns

### 1. Creating New Components

```jsx
// shared/components/ui/badge.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils/cn';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        danger: 'bg-danger-100 text-danger-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2 py-1 text-sm',
        lg: 'px-3 py-1 text-base',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    }
  }
);

export const Badge = ({
  variant,
  size,
  className,
  children,
  ...props
}) => {
  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      <Text className="font-medium">{children}</Text>
    </View>
  );
};
```

### 2. Feature-Level Components

```jsx
// features/orders/components/order-card.jsx
import React from 'react';
import { Card, Text, Badge } from '../../../shared/components/ui';
import { cn } from '../../../shared/utils/cn';

export const OrderCard = ({ order, className, ...props }) => {
  return (
    <Card
      variant="elevated"
      className={cn('space-y-3', className)}
      {...props}
    >
      <View className="flex-row justify-between items-start">
        <Text variant="subheading">Order #{order.id}</Text>
        <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
          {order.status}
        </Badge>
      </View>

      <Text variant="body" className="text-text-secondary">
        {order.items.length} items • ${order.total}
      </Text>

      <Text variant="caption">
        {order.date}
      </Text>
    </Card>
  );
};
```

### 3. Screen Layout Patterns

```jsx
// features/orders/screens/orders-screen.jsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../../shared/components/ui';
import { OrderCard } from '../components/order-card';

export const OrdersScreen = () => {
  return (
    <ScrollView className="flex-1 bg-bg-secondary">
      {/* Header */}
      <View className="p-4 bg-bg-primary border-b border-border-light">
        <Text variant="heading">Your Orders</Text>
        <Text variant="caption" className="mt-1">
          Track your recent orders
        </Text>
      </View>

      {/* Content */}
      <View className="p-4 space-y-4">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </View>
    </ScrollView>
  );
};
```

## 🎯 Best Practices

### Consistency Rules
1. **Always use theme colors** - Never hardcode hex values
2. **Use semantic naming** - `text-primary` not `text-gray-900`
3. **Leverage variants** - Create CVA variants for reusable patterns
4. **Space consistently** - Use theme spacing values (`space-y-4`, `p-4`)

### Class Organization
```jsx
// ✅ Good - Organized by type
className={cn(
  // Layout
  'flex-1 items-center justify-center',
  // Spacing
  'p-4 space-y-2',
  // Colors
  'bg-bg-primary text-text-primary',
  // Interactive
  'active:opacity-80',
  // Conditional
  isActive && 'bg-primary-500',
  className
)}

// ❌ Avoid - Mixed order
className="bg-bg-primary flex-1 text-text-primary p-4 items-center"
```

### Responsive & Adaptive Patterns
```jsx
// Dark mode support (when implemented)
'bg-bg-primary dark:bg-bg-dark text-text-primary dark:text-text-inverse'

// Platform-specific styles
'android:elevation-2 ios:shadow-sm'
```

## 🔧 Adding New Variants

When you need new component variants:

1. **Add to variants.js**:
```js
export const cardVariants = cva(
  'rounded-lg',
  {
    variants: {
      variant: {
        // Add new variant
        floating: 'bg-bg-primary shadow-lg border-0',
      }
    }
  }
);
```

2. **Update component**:
```jsx
<Card variant="floating">
  Content here
</Card>
```

## 📱 Mobile-Specific Considerations

- Use `active:` states instead of `hover:` for touch interactions
- Prefer `space-y-*` over individual margins for consistent spacing
- Use semantic colors for better dark mode support later
- Keep touch targets at least 44px (`min-h-11`) for accessibility

This pattern ensures consistent, maintainable, and scalable styling across your entire app.