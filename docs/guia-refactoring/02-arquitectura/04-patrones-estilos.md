# Patrones de Estilos con NativeWind

## 🎨 Resumen del Sistema de Diseño

Nuestro enfoque de estilos usa NativeWind con un sistema de tema centralizado para consistencia y escalabilidad.

### Arquitectura Central

1. **Configuración de Tema** (`shared/config/theme.js`) - Fuente única de verdad
2. **Sistema de Variantes** (`shared/styles/variants.js`) - Variantes de componentes basadas en CVA
3. **Función Utilitaria** (`shared/utils/cn.js`) - Utilidad para combinar clases
4. **Componentes Base** (`shared/components/ui/`) - Componentes reutilizables estilizados

## 📋 Patrones de Desarrollo de Componentes

### 1. Creando Nuevos Componentes

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
        destructive: 'bg-destructive-100 text-destructive-800',
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

### 2. Componentes a Nivel de Feature

```jsx
// features/orders/components/order-card.jsx
import React from 'react';
import { View } from 'react-native';
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
        <Text variant="subheading">Orden #{order.id}</Text>
        <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
          {order.status}
        </Badge>
      </View>

      <Text variant="body" className="text-muted-foreground">
        {order.items.length} artículos • ${order.total}
      </Text>

      <Text variant="caption">
        {order.date}
      </Text>
    </Card>
  );
};
```

### 3. Patrones de Layout de Pantallas

```jsx
// features/orders/screens/orders-screen.jsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../../shared/components/ui';
import { OrderCard } from '../components/order-card';

export const OrdersScreen = () => {
  return (
    <ScrollView className="flex-1 bg-secondary">
      {/* Header */}
      <View className="p-4 bg-card border-b border">
        <Text variant="heading">Tus Órdenes</Text>
        <Text variant="caption" className="mt-1">
          Rastrea tus órdenes recientes
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

## 🎯 Mejores Prácticas

### Reglas de Consistencia
1. **Siempre usa colores del tema** - Nunca hardcodees valores hex
2. **Usa nomenclatura semántica** - `text-foreground` no `text-gray-900`
3. **Aprovecha las variantes** - Crea variantes CVA para patrones reutilizables
4. **Espaciado consistente** - Usa valores de espaciado del tema (`space-y-4`, `p-4`)

### Organización de Clases
```jsx
// ✅ Bueno - Organizado por tipo
className={cn(
  // Layout
  'flex-1 items-center justify-center',
  // Espaciado
  'p-4 space-y-2',
  // Colores
  'bg-card text-foreground',
  // Interactivo
  'active:opacity-80',
  // Condicional
  isActive && 'bg-primary-500',
  className
)}

// ❌ Evitar - Orden mezclado
className="bg-card flex-1 text-foreground p-4 items-center"
```

### Patrones Responsivos y Adaptativos
```jsx
// Soporte para modo oscuro (cuando se implemente)
'bg-card dark:bg-gray-950 text-foreground dark:text-gray-50'

// Estilos específicos de plataforma
'android:elevation-2 ios:shadow-sm'
```

## 🔧 Agregando Nuevas Variantes

Cuando necesites nuevas variantes de componentes:

1. **Agregar a variants.js**:
```js
export const cardVariants = cva(
  'rounded-lg',
  {
    variants: {
      variant: {
        // Agregar nueva variante
        floating: 'bg-card shadow-lg border-0',
      }
    }
  }
);
```

2. **Actualizar componente**:
```jsx
<Card variant="floating">
  Contenido aquí
</Card>
```

## 📱 Consideraciones Específicas para Mobile

- Usa estados `active:` en lugar de `hover:` para interacciones táctiles
- Prefiere `space-y-*` sobre márgenes individuales para espaciado consistente
- Usa colores semánticos para mejor soporte de modo oscuro más adelante
- Mantén objetivos táctiles de al menos 44px (`min-h-11`) para accesibilidad

## 🎨 Colores UNO Delivery - Extraídos del Diseño

### Colores Semánticos
- `bg-card` - Fondo de tarjetas/superficies (blanco puro)
- `bg-secondary` - Fondo secundario (gris muy claro #f7fafc)
- `bg-muted` - Fondo atenuado (gris suave #edf2f7)
- `text-foreground` - Texto principal (gris oscuro #1a202c)
- `text-muted-foreground` - Texto secundario (gris medio #4a5568)
- `border` - Bordes por defecto (gris claro #e2e8f0)
- `border-input` - Bordes de inputs (gris medio #cbd5e0)

### Colores de Marca UNO
- `bg-primary-500` - **Rojo UNO principal** (#ef4444) - Botones primarios, acciones principales
- `bg-primary-600` - **Rojo UNO activo** (#dc2626) - Estados hover/activos
- `bg-primary-{50-400}` - Variaciones más claras para fondos sutiles
- `bg-primary-{700-900}` - Variaciones más oscuras para texto sobre fondos claros

### Colores de Estado
- `bg-success-{500-700}` - Verde para confirmaciones y éxito
- `bg-warning-{500-700}` - Amarillo para advertencias
- `bg-destructive-{500-700}` - Rojo para errores (diferente al rojo de marca)

### Ejemplos de Uso del Rojo UNO
```jsx
// Botón principal - Rojo UNO característico
<Button variant="primary">Ordenar Ahora</Button>

// Elementos de acción importantes
className="bg-primary-500 text-white"

// Estados hover/activos
className="bg-primary-600"

// Fondos sutiles con tinte rojo
className="bg-primary-50 text-primary-700"
```

Este patrón asegura estilos consistentes, mantenibles y escalables en toda tu aplicación.