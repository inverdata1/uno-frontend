# Patrones Básicos de TanStack Query

## Introducción

Este documento cubre los patrones fundamentales para usar TanStack Query en el proyecto. Cada patrón está diseñado para integrarse perfectamente con nuestros servicios de Firebase existentes.

## Patrón 1: Query Simple (useQuery)

### Caso de Uso
Obtener datos que se leen frecuentemente y pueden ser cacheados.

### Implementación
```javascript
// features/auth/queries/use-user-queries.js
import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../../shared/services/user-service';
import { userQueryKeys } from './user-query-keys';

export const useUser = (userId) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => UserService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};
```

### Uso en Componentes
```javascript
// features/profile/screens/profile-screen.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../../shared/hooks/use-auth';
import { useUser } from '../../auth/queries/use-user-queries';

const ProfileScreen = () => {
  const { user: authUser } = useAuth();
  const { data: user, isLoading, error } = useUser(authUser?.uid);

  if (isLoading) return <Text>Cargando perfil...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!user) return <Text>Usuario no encontrado</Text>;

  return (
    <View>
      <Text>{user.displayName}</Text>
      <Text>{user.email}</Text>
    </View>
  );
};
```

## Patrón 2: Query con Parámetros Dinámicos

### Caso de Uso
Queries que dependen de filtros o búsquedas del usuario.

### Implementación
```javascript
// features/business/queries/use-business-queries.js
export const useBusinessesByCategory = (category, location) => {
  return useQuery({
    queryKey: businessQueryKeys.byCategory(category, location),
    queryFn: () => BusinessService.getByCategory(category, location),
    enabled: !!category && !!location,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
```

### Query Keys Dinámicas
```javascript
// features/business/queries/business-query-keys.js
export const businessQueryKeys = {
  all: ['businesses'],
  lists: () => [...businessQueryKeys.all, 'list'],
  list: (filters) => [...businessQueryKeys.lists(), { filters }],
  byCategory: (category, location) => [
    ...businessQueryKeys.lists(), 
    { category, location }
  ],
  details: () => [...businessQueryKeys.all, 'detail'],
  detail: (id) => [...businessQueryKeys.details(), id],
};
```

## Patrón 3: Mutation Simple (useMutation)

### Caso de Uso
Operaciones que modifican datos en el servidor.

### Implementación
```javascript
// features/auth/queries/use-user-queries.js
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }) => UserService.updateUser(userId, updates),
    onSuccess: (updatedUser, { userId }) => {
      // Actualizar cache inmediatamente
      queryClient.setQueryData(
        userQueryKeys.detail(userId),
        updatedUser
      );
      
      // Invalidar queries relacionadas si es necesario
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('Error actualizando usuario:', error);
      // Aquí podrías mostrar un toast o notificación
    },
  });
};
```

### Uso en Componentes
```javascript
// features/profile/components/profile-form.jsx
const ProfileForm = ({ user, onSuccess }) => {
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (formData) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: user.uid,
        updates: formData
      });
      onSuccess?.();
    } catch (error) {
      // Error ya manejado en onError del mutation
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button 
        type="submit" 
        disabled={updateUserMutation.isLoading}
      >
        {updateUserMutation.isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};
```

## Patrón 4: Mutation con Optimistic Updates

### Caso de Uso
Operaciones donde queremos mostrar el cambio inmediatamente para mejor UX.

### Implementación
```javascript
// features/business/queries/use-business-queries.js
export const useToggleBusinessFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, isFavorite }) => 
      BusinessService.toggleFavorite(businessId, isFavorite),
    
    // Optimistic update - cambiar UI inmediatamente
    onMutate: async ({ businessId, isFavorite }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({
        queryKey: businessQueryKeys.detail(businessId)
      });

      // Snapshot del estado anterior
      const previousBusiness = queryClient.getQueryData(
        businessQueryKeys.detail(businessId)
      );

      // Update optimista
      queryClient.setQueryData(
        businessQueryKeys.detail(businessId),
        (old) => ({
          ...old,
          isFavorite: isFavorite
        })
      );

      // Retornar contexto para rollback
      return { previousBusiness, businessId };
    },
    
    onError: (err, variables, context) => {
      // Rollback en caso de error
      if (context?.previousBusiness) {
        queryClient.setQueryData(
          businessQueryKeys.detail(context.businessId),
          context.previousBusiness
        );
      }
    },
    
    onSettled: (data, error, { businessId }) => {
      // Refetch para asegurar consistencia
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(businessId)
      });
    },
  });
};
```

## Patrón 5: Queries Infinitas (useInfiniteQuery)

### Caso de Uso
Listados con paginación o scroll infinito.

### Implementación
```javascript
// features/products/queries/use-product-queries.js
export const useInfiniteProducts = (businessId, filters = {}) => {
  return useInfiniteQuery({
    queryKey: productQueryKeys.infinite(businessId, filters),
    queryFn: ({ pageParam = null }) => 
      ProductService.getProducts(businessId, {
        ...filters,
        cursor: pageParam,
        limit: 20
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};
```

### Uso con FlatList
```javascript
// features/products/screens/product-list-screen.jsx
const ProductListScreen = ({ businessId }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteProducts(businessId);

  const products = data?.pages.flatMap(page => page.products) || [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => 
        isFetchingNextPage ? <LoadingSpinner /> : null
      }
    />
  );
};
```

## Patrón 6: Queries Dependientes

### Caso de Uso
Queries que necesitan ejecutarse en secuencia.

### Implementación
```javascript
// features/orders/queries/use-order-queries.js
export const useOrderWithDetails = (orderId) => {
  // Query principal
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
  });

  // Query dependiente - solo se ejecuta cuando tenemos el business ID
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: businessQueryKeys.detail(order?.businessId),
    queryFn: () => BusinessService.getBusiness(order.businessId),
    enabled: !!order?.businessId,
  });

  return {
    order,
    business,
    isLoading: orderLoading || businessLoading,
    isError: !order && !orderLoading, // Error si no hay orden y no está cargando
  };
};
```

## Patrón 7: Invalidación de Cache

### Invalidación Específica
```javascript
// Invalidar un usuario específico
queryClient.invalidateQueries({
  queryKey: userQueryKeys.detail(userId)
});

// Invalidar todas las listas de usuarios
queryClient.invalidateQueries({
  queryKey: userQueryKeys.lists()
});

// Invalidar todo lo relacionado con usuarios
queryClient.invalidateQueries({
  queryKey: userQueryKeys.all
});
```

### Invalidación Cross-Feature
```javascript
// shared/services/file-storage-service.js
export class FileStorageService extends BaseService {
  static async uploadProfileImage(userId, imageUri) {
    const imageUrl = await this.uploadFile(imageUri, `profiles/${userId}`);
    
    // Actualizar usuario con nueva imagen
    await UserService.updateUser(userId, { profileImage: imageUrl });
    
    // Invalidar cache del usuario desde otro servicio
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({
      queryKey: userQueryKeys.detail(userId)
    });
    
    return imageUrl;
  }
}
```

## Patrón 8: Error Handling Global

### Configuración Global
```javascript
// shared/config/query-client.js
import { QueryClient } from '@tanstack/react-query';
import { showErrorToast } from '../utils/toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar errores de autenticación
        if (error?.code === 'permission-denied') return false;
        
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },
      staleTime: 1 * 60 * 1000, // 1 minuto por defecto
    },
    mutations: {
      onError: (error) => {
        // Mostrar error global
        showErrorToast(error.message);
      },
    },
  },
});
```

## Patrón 9: Queries con Real-time (Firestore)

### Implementación con Listeners
```javascript
// features/orders/queries/use-order-queries.js
export const useOrderRealtime = (orderId) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = OrderService.subscribeToOrder(orderId, (order) => {
      queryClient.setQueryData(orderQueryKeys.detail(orderId), order);
    });

    return unsubscribe;
  }, [orderId, queryClient]);

  return useQuery({
    queryKey: orderQueryKeys.detail(orderId),
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
  });
};
```

## Patrón 10: Prefetching

### Prefetch de Datos Relacionados
```javascript
// features/business/screens/business-detail-screen.jsx
const BusinessDetailScreen = ({ route }) => {
  const { businessId } = route.params;
  const queryClient = useQueryClient();
  
  const { data: business } = useBusiness(businessId);
  
  useEffect(() => {
    if (business) {
      // Prefetch productos del negocio
      queryClient.prefetchQuery({
        queryKey: productQueryKeys.byBusiness(businessId),
        queryFn: () => ProductService.getByBusiness(businessId),
        staleTime: 2 * 60 * 1000,
      });
      
      // Prefetch reviews del negocio
      queryClient.prefetchQuery({
        queryKey: reviewQueryKeys.byBusiness(businessId),
        queryFn: () => ReviewService.getByBusiness(businessId),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [business, businessId, queryClient]);

  return (
    <BusinessDetailView business={business} />
  );
};
```

## Mejores Prácticas

### 1. **Tiempos de Cache Apropiados**
```javascript
// Datos que cambian raramente
staleTime: 10 * 60 * 1000, // 10 minutos

// Datos que cambian frecuentemente  
staleTime: 30 * 1000, // 30 segundos

// Datos críticos o en tiempo real
staleTime: 0, // Siempre considerar como stale
```

### 2. **Enabled Condicional**
```javascript
// Siempre validar parámetros requeridos
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => UserService.getUser(userId),
  enabled: !!userId && userId !== 'anonymous',
});
```

### 3. **Manejo de Loading States**
```javascript
const MyComponent = () => {
  const { data, isLoading, isFetching, error } = useQuery(/*...*/);
  
  // isLoading = primera carga
  // isFetching = cualquier fetch (incluye background updates)
  
  if (isLoading) return <InitialLoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <View>
      {isFetching && <BackgroundLoadingIndicator />}
      <DataView data={data} />
    </View>
  );
};
```

### 4. **Cleanup en Mutations**
```javascript
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (businessId) => BusinessService.deleteBusiness(businessId),
    onSuccess: (_, businessId) => {
      // Remover del cache específico
      queryClient.removeQueries({
        queryKey: businessQueryKeys.detail(businessId)
      });
      
      // Invalidar listas para que se actualicen
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.lists()
      });
    },
  });
};
```

Estos patrones cubren el 95% de los casos de uso en el proyecto y aseguran un uso consistente de TanStack Query en toda la aplicación.

---

## 📖 Navegación

**Anterior:** [Estrategia Query Keys](./01-estrategia-query-keys.md) | **Siguiente:** [Implementación por Features](./03-implementacion-features.md)