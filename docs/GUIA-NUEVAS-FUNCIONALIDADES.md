# Guía para Agregar Nuevas Funcionalidades

Esta guía te llevará paso a paso en el proceso de agregar nuevas features, módulos y recursos al proyecto UNO Delivery.

---

## Tabla de Contenidos

1. [Agregar una Nueva Screen](#1-agregar-una-nueva-screen)
2. [Agregar un Nuevo Módulo](#2-agregar-un-nuevo-módulo)
3. [Agregar un Nuevo Recurso API](#3-agregar-un-nuevo-recurso-api)
4. [Agregar un Hook de React Query](#4-agregar-un-hook-de-react-query)
5. [Agregar un Componente Compartido](#5-agregar-un-componente-compartido)
6. [Agregar una Nueva Tabla/Colección](#6-agregar-una-nueva-tablacolección)
7. [Agregar Validaciones](#7-agregar-validaciones)
8. [Agregar un Nuevo Tipo de Usuario](#8-agregar-un-nuevo-tipo-de-usuario)

---

## 1. Agregar una Nueva Screen

### Ejemplo: Pantalla de "Favoritos"

#### Paso 1: Decide la ubicación

**Pregúntate:**
- ¿Es específica de un tipo de usuario? → `app/(main)/client/favorites.jsx`
- ¿Es común para todos? → `app/(main)/favorites.jsx`
- ¿Es parte de un módulo existente? → Usa el módulo correspondiente

#### Paso 2: Crea el archivo de ruta

```javascript
// app/(main)/client/favorites.jsx
import React from 'react';
import FavoritesScreen from '../../../modules/commerce/favorites';

// Expo Router screen (solo wrapper)
export default FavoritesScreen;
```

#### Paso 3: Crea la screen real en el módulo

```javascript
// modules/commerce/favorites/index.jsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '../../../shared/components/ui';
import { useFavorites } from '../hooks/use-favorites';
import { ProductCard } from '../products/components/product-card';

export default function FavoritesScreen() {
  const { data: favorites = [], isLoading } = useFavorites();

  const renderProduct = ({ item }) => (
    <ProductCard product={item} onPress={() => {/* navigate */}} />
  );

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text variant="heading" className="mb-4">
          Mis Favoritos
        </Text>

        <FlatList
          data={favorites}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <Card className="p-8 items-center">
              <Text className="text-gray-500">
                No tienes favoritos aún
              </Text>
            </Card>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
```

#### Paso 4: Agrega el hook

```javascript
// modules/commerce/hooks/use-favorites.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene la lista de favoritos del usuario
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await apiClient.get('/favorites');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Agrega un producto a favoritos
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      return await apiClient.post('/favorites', { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

/**
 * Remueve un producto de favoritos
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId) => {
      return await apiClient.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
```

#### Paso 5: Exporta desde hooks/index.js

```javascript
// modules/commerce/hooks/index.js
export * from './use-products';
export * from './use-favorites';  // ← Agregar
```

#### Paso 6: Registra en tabs (si aplica)

```javascript
// app/(main)/_layout.jsx
<Tabs.Screen
  name="client/favorites"
  options={currentUserType === 'client' ? {
    title: 'Favoritos',
    tabBarIcon: ({ focused }) => getTabIcon('heart', focused),
  } : { href: null }}
/>
```

---

## 2. Agregar un Nuevo Módulo

### Ejemplo: Módulo de "Notifications"

#### Paso 1: Crea la estructura del módulo

```bash
mkdir -p modules/notifications/hooks
mkdir -p modules/notifications/list
mkdir -p modules/notifications/settings
touch modules/notifications/hooks/index.js
touch modules/notifications/hooks/use-notifications.js
touch modules/notifications/list/index.jsx
touch modules/notifications/settings/index.jsx
touch modules/notifications/index.js
```

**Estructura final:**
```
modules/notifications/
├── hooks/
│   ├── index.js
│   └── use-notifications.js
├── list/
│   ├── index.jsx
│   └── components/
│       └── notification-item.jsx
├── settings/
│   └── index.jsx
└── index.js
```

#### Paso 2: Crea los hooks

```javascript
// modules/notifications/hooks/use-notifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      return await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
```

```javascript
// modules/notifications/hooks/index.js
export * from './use-notifications';
```

#### Paso 3: Crea las screens

```javascript
// modules/notifications/list/index.jsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';
import { useNotifications, useMarkAsRead } from '../hooks';
import { NotificationItem } from './components/notification-item';

export default function NotificationsListScreen() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();

  const handlePress = async (notification) => {
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    // Navigate to detail or perform action
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="px-4 py-6">
          <Text variant="heading">Notificaciones</Text>
        </View>

        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handlePress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}
```

#### Paso 4: Exporta desde el barrel del módulo

```javascript
// modules/notifications/index.js
export { default as NotificationsListScreen } from './list';
export { default as NotificationsSettingsScreen } from './settings';
export * from './hooks';
```

#### Paso 5: Crea el recurso API (ver sección 3)

---

## 3. Agregar un Nuevo Recurso API

### Ejemplo: Recurso de "Notifications"

#### Paso 1: Crea la estructura

```bash
mkdir -p shared/api/notifications
touch shared/api/notifications/resource.js
touch shared/api/notifications/collection.js
touch shared/api/notifications/seeder.js
```

#### Paso 2: Crea el recurso

```javascript
// shared/api/notifications/resource.js
import { BaseFirebaseService } from '../base-firebase-service';

/**
 * Notifications resource
 * Maneja notificaciones de usuarios
 */
export class NotificationsResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'notifications');
  }

  /**
   * Handle incoming requests
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action || 'index'}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in NotificationsResource`);
    }

    return await this[handler](data, params);
  }

  /**
   * GET /notifications
   * Obtener notificaciones del usuario
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this.findWhere([
      ['userId', '==', userId]
    ], {
      orderBy: 'createdAt',
      order: 'desc',
      limit: 50
    });
  }

  /**
   * PATCH /notifications/{id}/read
   * Marcar notificación como leída
   */
  async patch_id_read(data, params) {
    const { id } = params;

    return await this.update(id, {
      read: true,
      readAt: new Date()
    });
  }

  /**
   * POST /notifications
   * Crear nueva notificación
   */
  async post_index(data, params) {
    const notificationData = {
      ...data,
      read: false,
      createdAt: new Date()
    };

    return await this.create(notificationData);
  }

  /**
   * DELETE /notifications/{id}
   * Eliminar notificación
   */
  async delete_id(data, params) {
    const { id } = params;
    return await this.delete(id);
  }
}
```

#### Paso 3: Crea la colección de datos

```javascript
// shared/api/notifications/collection.js
export const notificationsCollection = [
  {
    id: 'notif1',
    userId: 'user123',
    type: 'order_update',
    title: 'Pedido en camino',
    message: 'Tu pedido #1234 está en camino',
    read: false,
    createdAt: new Date('2025-01-20'),
  },
  {
    id: 'notif2',
    userId: 'user123',
    type: 'promotion',
    title: '20% de descuento',
    message: 'Aprovecha nuestra promoción especial',
    read: false,
    createdAt: new Date('2025-01-19'),
  },
];
```

#### Paso 4: Crea el seeder

```javascript
// shared/api/notifications/seeder.js
import { apiClient } from '../index';
import { notificationsCollection } from './collection';

export const seedNotifications = async () => {
  console.log('🌱 Seeding notifications...');

  try {
    for (const notification of notificationsCollection) {
      await apiClient.post('/notifications', notification);
    }

    console.log(`✅ Seeded ${notificationsCollection.length} notifications`);
  } catch (error) {
    console.error('❌ Failed to seed notifications:', error);
    throw error;
  }
};
```

#### Paso 5: Registra el recurso

```javascript
// shared/api/index.js
import { NotificationsResource } from './notifications/resource';

// Register resource
firebaseClient.registerResource('notifications', NotificationsResource);

// Export
export {
  // ... otros exports
  NotificationsResource,
};
```

---

## 4. Agregar un Hook de React Query

### Ejemplo: Hook para "Reviews" de productos

#### Paso 1: Decide la ubicación

- **Específico de módulo:** `modules/commerce/hooks/use-reviews.js`
- **Cross-domain:** `shared/hooks/use-reviews.js`

#### Paso 2: Crea el hook

```javascript
// modules/commerce/hooks/use-reviews.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene reviews de un producto
 * @param {string} productId - ID del producto
 * @returns {UseQueryResult} Query result con reviews
 */
export const useProductReviews = (productId) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${productId}/reviews`);
      return response.data;
    },
    enabled: !!productId, // Solo ejecutar si hay productId
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Obtiene una review específica
 * @param {string} reviewId - ID de la review
 */
export const useReview = (reviewId) => {
  return useQuery({
    queryKey: ['reviews', reviewId],
    queryFn: async () => {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    },
    enabled: !!reviewId,
  });
};

/**
 * Crea una nueva review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment }) => {
      const response = await apiClient.post('/reviews', {
        productId,
        rating,
        comment,
      });
      return response.data;
    },

    onSuccess: (data, variables) => {
      // Invalidar reviews del producto
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'product', variables.productId]
      });

      // Invalidar producto (para actualizar rating promedio)
      queryClient.invalidateQueries({
        queryKey: ['products', variables.productId]
      });

      console.log('✅ Review created:', data.id);
    },
  });
};

/**
 * Actualiza una review existente
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, rating, comment }) => {
      const response = await apiClient.put(`/reviews/${reviewId}`, {
        rating,
        comment,
      });
      return response.data;
    },

    onSuccess: (data) => {
      // Actualizar cache de la review
      queryClient.setQueryData(['reviews', data.id], data);

      // Invalidar lista de reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'product', data.productId]
      });
    },
  });
};

/**
 * Elimina una review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      await apiClient.delete(`/reviews/${reviewId}`);
      return reviewId;
    },

    onSuccess: (reviewId) => {
      // Invalidar todas las queries de reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

/**
 * Da "helpful" a una review
 */
export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    },

    // Optimistic update
    onMutate: async (reviewId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', reviewId] });

      // Snapshot previous value
      const previousReview = queryClient.getQueryData(['reviews', reviewId]);

      // Optimistically update
      queryClient.setQueryData(['reviews', reviewId], (old) => ({
        ...old,
        helpfulCount: (old?.helpfulCount || 0) + 1,
      }));

      // Return context with previous value
      return { previousReview };
    },

    // Rollback on error
    onError: (err, reviewId, context) => {
      queryClient.setQueryData(['reviews', reviewId], context.previousReview);
    },

    // Refetch after success or error
    onSettled: (data, error, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId] });
    },
  });
};
```

#### Paso 3: Exporta desde index

```javascript
// modules/commerce/hooks/index.js
export * from './use-products';
export * from './use-reviews';  // ← Agregar
```

#### Paso 4: Usa el hook en componente

```javascript
// modules/commerce/products/product-detail.jsx
import { useProductReviews, useCreateReview } from '../hooks';

export default function ProductDetailScreen({ productId }) {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const createReviewMutation = useCreateReview();

  const handleSubmitReview = async (rating, comment) => {
    try {
      await createReviewMutation.mutateAsync({
        productId,
        rating,
        comment,
      });
      Alert.alert('Success', 'Review submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  return (
    <View>
      {/* Product info */}

      <Text variant="heading">Reviews</Text>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      <ReviewForm onSubmit={handleSubmitReview} />
    </View>
  );
}
```

---

## 5. Agregar un Componente Compartido

### Ejemplo: Componente "Rating" (estrellas)

#### Paso 1: Decide si es compartido

**Pregúntate:**
- ¿Se usa en 2+ módulos? → `shared/components/ui/`
- ¿Es específico de un módulo? → `modules/{module}/components/`

#### Paso 2: Crea el componente

```javascript
// shared/components/ui/rating.jsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Rating component con estrellas
 *
 * @param {Object} props
 * @param {number} props.value - Valor actual (0-5)
 * @param {number} [props.max=5] - Máximo de estrellas
 * @param {number} [props.size=20] - Tamaño de las estrellas
 * @param {string} [props.color='#fbbf24'] - Color de estrellas llenas
 * @param {boolean} [props.editable=false] - Si es editable
 * @param {Function} [props.onChange] - Callback al cambiar valor
 */
export const Rating = ({
  value = 0,
  max = 5,
  size = 20,
  color = '#fbbf24',
  editable = false,
  onChange,
}) => {
  const handlePress = (index) => {
    if (editable && onChange) {
      onChange(index + 1);
    }
  };

  const renderStar = (index) => {
    const filled = index < Math.floor(value);
    const halfFilled = index < value && index >= Math.floor(value);

    const iconName = filled
      ? 'star'
      : halfFilled
      ? 'star-half'
      : 'star-outline';

    const StarComponent = editable ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={() => handlePress(index)}
        disabled={!editable}
      >
        <Ionicons
          name={iconName}
          size={size}
          color={filled || halfFilled ? color : '#d1d5db'}
        />
      </StarComponent>
    );
  };

  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: max }, (_, i) => renderStar(i))}
    </View>
  );
};
```

#### Paso 3: Exporta desde barrel

```javascript
// shared/components/ui/index.js
export { Button } from './button';
export { Card } from './card';
export { Rating } from './rating';  // ← Agregar
// ... otros exports
```

#### Paso 4: Úsalo en la app

```javascript
import { Rating } from '../../../shared/components/ui';

<Rating value={4.5} size={16} />
<Rating value={rating} editable onChange={setRating} />
```

---

## 6. Agregar una Nueva Tabla/Colección

### Ejemplo: Colección de "Coupons" (cupones)

#### Paso 1: Define el schema

```javascript
// shared/schemas/coupon-schema.js
import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discount: z.number().min(0).max(100),
  discountType: z.enum(['percentage', 'fixed']),
  minAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  expiresAt: z.date(),
  usageLimit: z.number().int().min(1).optional(),
  userLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

export type Coupon = z.infer<typeof couponSchema>;
```

#### Paso 2: Crea la estructura del recurso

```
shared/api/coupons/
├── resource.js
├── collection.js
└── seeder.js
```

#### Paso 3: Define el recurso

```javascript
// shared/api/coupons/resource.js
import { BaseFirebaseService } from '../base-firebase-service';

export class CouponsResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'coupons');
  }

  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action || 'index'}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in CouponsResource`);
    }

    return await this[handler](data, params);
  }

  /**
   * GET /coupons
   * Obtener cupones activos
   */
  async get_index(data, params) {
    return await this.findWhere([
      ['isActive', '==', true],
      ['expiresAt', '>', new Date()]
    ]);
  }

  /**
   * GET /coupons/{code}/validate
   * Validar un cupón por código
   */
  async get_id_validate(data, params) {
    const { id: code } = params;
    const { userId, cartAmount } = data;

    // Buscar cupón por código
    const coupons = await this.findWhere([
      ['code', '==', code.toUpperCase()],
      ['isActive', '==', true]
    ]);

    if (coupons.length === 0) {
      throw new Error('Cupón no encontrado o inactivo');
    }

    const coupon = coupons[0];

    // Validar expiración
    if (new Date(coupon.expiresAt) < new Date()) {
      throw new Error('Cupón expirado');
    }

    // Validar monto mínimo
    if (coupon.minAmount && cartAmount < coupon.minAmount) {
      throw new Error(`Monto mínimo de $${coupon.minAmount} requerido`);
    }

    // Validar usos (implementación simplificada)
    // En producción: verificar en tabla de usos

    return {
      valid: true,
      coupon,
      discount: this.calculateDiscount(coupon, cartAmount),
    };
  }

  /**
   * POST /coupons
   * Crear nuevo cupón
   */
  async post_index(data, params) {
    const couponData = {
      ...data,
      code: data.code.toUpperCase(),
      createdAt: new Date(),
      usedCount: 0,
    };

    return await this.create(couponData);
  }

  /**
   * POST /coupons/{code}/use
   * Registrar uso de cupón
   */
  async post_id_use(data, params) {
    const { id: code } = params;
    const { userId, orderId } = data;

    // Buscar cupón
    const coupons = await this.findWhere([['code', '==', code.toUpperCase()]]);

    if (coupons.length === 0) {
      throw new Error('Cupón no encontrado');
    }

    const coupon = coupons[0];

    // Incrementar contador de usos
    await this.update(coupon.id, {
      usedCount: (coupon.usedCount || 0) + 1,
    });

    // Registrar uso individual (simplificado)
    // En producción: crear registro en tabla coupon_uses

    return {
      success: true,
      couponId: coupon.id,
      orderId,
    };
  }

  // Helper method
  calculateDiscount(coupon, amount) {
    if (coupon.discountType === 'percentage') {
      const discount = (amount * coupon.discount) / 100;
      return coupon.maxDiscount
        ? Math.min(discount, coupon.maxDiscount)
        : discount;
    } else {
      return Math.min(coupon.discount, amount);
    }
  }
}
```

#### Paso 4: Crea la colección

```javascript
// shared/api/coupons/collection.js
export const couponsCollection = [
  {
    id: 'coup1',
    code: 'WELCOME20',
    discount: 20,
    discountType: 'percentage',
    minAmount: 50,
    maxDiscount: 100,
    expiresAt: new Date('2025-12-31'),
    usageLimit: 1000,
    userLimit: 1,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    usedCount: 0,
  },
  {
    id: 'coup2',
    code: 'FREESHIP',
    discount: 10,
    discountType: 'fixed',
    minAmount: 30,
    expiresAt: new Date('2025-06-30'),
    usageLimit: null,
    userLimit: 1,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    usedCount: 0,
  },
];
```

#### Paso 5: Crea el seeder

```javascript
// shared/api/coupons/seeder.js
import { apiClient } from '../index';
import { couponsCollection } from './collection';

export const seedCoupons = async () => {
  console.log('🌱 Seeding coupons...');

  try {
    for (const coupon of couponsCollection) {
      await apiClient.post('/coupons', coupon);
    }

    console.log(`✅ Seeded ${couponsCollection.length} coupons`);
  } catch (error) {
    console.error('❌ Failed to seed coupons:', error);
    throw error;
  }
};
```

#### Paso 6: Registra el recurso

```javascript
// shared/api/index.js
import { CouponsResource } from './coupons/resource';

firebaseClient.registerResource('coupons', CouponsResource);

export {
  // ... otros
  CouponsResource,
};
```

#### Paso 7: Crea los hooks

```javascript
// modules/commerce/hooks/use-coupons.js
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, userId, cartAmount }) => {
      const response = await apiClient.get(`/coupons/${code}/validate`, {
        userId,
        cartAmount,
      });
      return response.data;
    },
  });
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, userId, orderId }) => {
      const response = await apiClient.post(`/coupons/${code}/use`, {
        userId,
        orderId,
      });
      return response.data;
    },
  });
};
```

---

## 7. Agregar Validaciones

### Ejemplo: Validación de "Checkout"

#### Paso 1: Crea el schema

```javascript
// shared/schemas/checkout-schema.js
import { z } from 'zod';

export const checkoutSchema = z.object({
  // Información de contacto
  email: z.string().email('Email inválido'),
  phone: z.string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .regex(/^\d+$/, 'Solo números'),

  // Dirección de entrega
  address: z.object({
    street: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
    number: z.string().min(1, 'Número requerido'),
    city: z.string().min(2, 'Ciudad requerida'),
    state: z.string().min(2, 'Estado requerido'),
    zipCode: z.string().regex(/^\d{5}$/, 'Código postal inválido'),
    reference: z.string().optional(),
  }),

  // Método de pago
  paymentMethod: z.enum(['cash', 'card', 'transfer'], {
    errorMap: () => ({ message: 'Método de pago inválido' }),
  }),

  // Detalles de pago (condicional)
  paymentDetails: z.object({
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  }).optional(),

  // Notas adicionales
  notes: z.string().max(500, 'Notas no pueden exceder 500 caracteres').optional(),

  // Cupón (opcional)
  couponCode: z.string().optional(),
}).refine(
  (data) => {
    // Si el método es tarjeta, validar detalles
    if (data.paymentMethod === 'card') {
      return (
        data.paymentDetails &&
        data.paymentDetails.cardNumber &&
        data.paymentDetails.cardHolder &&
        data.paymentDetails.expiryDate &&
        data.paymentDetails.cvv
      );
    }
    return true;
  },
  {
    message: 'Detalles de tarjeta requeridos',
    path: ['paymentDetails'],
  }
);

export type CheckoutData = z.infer<typeof checkoutSchema>;
```

#### Paso 2: Úsalo en el componente

```javascript
// modules/commerce/checkout/index.jsx
import { useState } from 'react';
import { checkoutSchema } from '../../../shared/schemas/checkout-schema';

export default function CheckoutScreen() {
  const [errors, setErrors] = useState({});

  const handleSubmit = async (formData) => {
    try {
      // Validar datos
      const validatedData = checkoutSchema.parse(formData);

      // Procesar checkout
      await processCheckout(validatedData);

      // Navegar a confirmación
      router.push('/order-confirmation');

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatear errores para mostrar en UI
        const formattedErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        Alert.alert('Error', 'No se pudo procesar el pedido');
      }
    }
  };

  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors['email']}
      />

      <Input
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        error={errors['phone']}
        keyboardType="phone-pad"
      />

      {/* Más campos... */}

      <Button onPress={handleSubmit}>
        Finalizar Pedido
      </Button>
    </View>
  );
}
```

---

## 8. Agregar un Nuevo Tipo de Usuario

### Ejemplo: Tipo de usuario "Restaurant"

Este es un cambio mayor que requiere modificaciones en múltiples lugares.

#### Paso 1: Actualiza la configuración

```javascript
// shared/config/user-types.js
export const USER_TYPES = {
  CLIENT: 'client',
  BUSINESS: 'business',
  DELIVERY: 'delivery',
  RESTAURANT: 'restaurant',  // ← Nuevo
};

export const USER_TYPE_CONFIG = {
  // ... configs existentes ...

  restaurant: {
    id: 'restaurant',
    title: 'Restaurante',
    icon: 'restaurant',
    primary: '#f97316',  // Orange
    secondary: '#ea580c',
    light: '#fed7aa',
    background: '#fff7ed',
    gradient: ['#f97316', '#ea580c'],
    label: 'Ubicación del restaurante',
    placeholder: 'Selecciona ubicación',
    addressType: 'business',
    requiresAddress: true,
    features: [
      'manage_menu',
      'orders',
      'kitchen_display',
      'delivery_integration',
    ],
    permissions: [
      'create_dish',
      'update_menu',
      'manage_orders',
      'view_analytics',
    ],
  },
};
```

#### Paso 2: Actualiza el theme

```javascript
// shared/config/theme.js
export const theme = {
  colors: {
    // ... otros colores ...

    modes: {
      // ... otros modes ...

      restaurant: {
        primary: '#f97316',
        secondary: '#ea580c',
        light: '#fed7aa',
        background: '#fff7ed',
      },
    },
  },
};
```

#### Paso 3: Actualiza Tailwind config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'mode-client': theme.colors.modes.client.primary,
        'mode-business': theme.colors.modes.business.primary,
        'mode-delivery': theme.colors.modes.delivery.primary,
        'mode-restaurant': theme.colors.modes.restaurant.primary,  // ← Nuevo
      },
    },
  },
};
```

#### Paso 4: Crea el módulo del restaurante

```bash
mkdir -p modules/restaurant/menu
mkdir -p modules/restaurant/orders
mkdir -p modules/restaurant/kitchen
mkdir -p modules/restaurant/hooks
```

#### Paso 5: Crea las screens

```javascript
// modules/restaurant/menu/index.jsx
export default function RestaurantMenuScreen() {
  return (
    <View>
      <Text variant="heading">Mi Menú</Text>
      {/* Gestión de menú */}
    </View>
  );
}
```

#### Paso 6: Actualiza el router

```javascript
// app/(main)/_layout.jsx
<Tabs.Screen
  name="restaurant/menu"
  options={currentUserType === 'restaurant' ? {
    title: 'Menú',
    tabBarIcon: ({ focused }) => getTabIcon('restaurant', focused),
  } : { href: null }}
/>

<Tabs.Screen
  name="restaurant/orders"
  options={currentUserType === 'restaurant' ? {
    title: 'Órdenes',
    tabBarIcon: ({ focused }) => getTabIcon('receipt', focused),
  } : { href: null }}
/>
```

#### Paso 7: Actualiza el home screen

```javascript
// app/(main)/index.jsx
import RestaurantDashboard from '../../modules/restaurant/dashboard';

export default function HomeScreen() {
  const { currentUserType } = useCurrentUserType();

  const renderModeContent = () => {
    switch (currentUserType) {
      case 'business':
        return <BusinessDashboardScreen />;
      case 'delivery':
        return <DriverDeliveriesScreen />;
      case 'restaurant':  // ← Nuevo
        return <RestaurantDashboard />;
      default:
        return <ClientHomeScreen />;
    }
  };

  // ...
}
```

#### Paso 8: Actualiza el formulario de registro

```javascript
// core/auth/components/register/registration-form.jsx
// Asegúrate de que 'restaurant' sea una opción en el UserTypeSelector
```

---

## Checklist General

Cuando agregues cualquier funcionalidad nueva, verifica:

- [ ] ¿Los imports siguen la jerarquía correcta?
- [ ] ¿Los hooks están en la ubicación correcta?
- [ ] ¿Los hooks usan React Query correctamente?
- [ ] ¿Los componentes están documentados con JSDoc?
- [ ] ¿Los estilos usan NativeWind primero?
- [ ] ¿Los formularios usan Focus Manager?
- [ ] ¿Las validaciones usan Zod?
- [ ] ¿Los recursos API siguen el patrón establecido?
- [ ] ¿Se crearon los barrel exports (`index.js`)?
- [ ] ¿Se registró el recurso en `shared/api/index.js`?
- [ ] ¿Se agregó al router si es necesario?
- [ ] ¿No se usan emojis en UI de usuario?
- [ ] ¿El código sigue las reglas de nomenclatura?

---

**Última actualización:** 2025-01-22
