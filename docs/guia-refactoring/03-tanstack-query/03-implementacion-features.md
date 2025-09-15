# Implementación TanStack Query por Feature

## Introducción

Este documento muestra la implementación específica de TanStack Query para cada feature del proyecto, con ejemplos completos y casos de uso reales.

## Feature: Authentication (auth/)

### Query Keys
```javascript
// features/auth/queries/user-query-keys.js
export const userQueryKeys = {
  all: ['users'],
  lists: () => [...userQueryKeys.all, 'list'],
  list: (filters) => [...userQueryKeys.lists(), { filters }],
  details: () => [...userQueryKeys.all, 'detail'],
  detail: (id) => [...userQueryKeys.details(), id],
  profile: (id) => [...userQueryKeys.detail(id), 'profile'],
  preferences: (id) => [...userQueryKeys.detail(id), 'preferences'],
};
```

### Hooks Principales
```javascript
// features/auth/queries/use-user-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../../../shared/services/user-service';
import { userQueryKeys } from './user-query-keys';

export const useUser = (userId) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => UserService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }) => UserService.updateUser(userId, updates),
    onSuccess: (updatedUser, { userId }) => {
      queryClient.setQueryData(userQueryKeys.detail(userId), updatedUser);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: (userData) => UserService.register(userData),
    onError: (error) => {
      console.error('Error en registro:', error.message);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }) => UserService.login(email, password),
    onSuccess: (user) => {
      // Cachear usuario logueado
      queryClient.setQueryData(userQueryKeys.detail(user.uid), user);
    },
  });
};
```

### Uso en Componentes
```javascript
// features/auth/screens/profile-screen.jsx
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../../../shared/hooks/use-auth';
import { useUser, useUpdateUser } from '../queries/use-user-queries';
import ProfileForm from '../components/profile-form';

const ProfileScreen = () => {
  const { user: authUser } = useAuth();
  const { data: user, isLoading } = useUser(authUser?.uid);
  const updateUserMutation = useUpdateUser();

  const handleUpdateProfile = (updates) => {
    updateUserMutation.mutate({
      userId: authUser.uid,
      updates
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 p-4">
      <ProfileForm
        user={user}
        onSubmit={handleUpdateProfile}
        loading={updateUserMutation.isLoading}
      />
    </View>
  );
};
```

## Feature: Business (business/)

### Query Keys
```javascript
// features/business/queries/business-query-keys.js
export const businessQueryKeys = {
  all: ['businesses'],
  lists: () => [...businessQueryKeys.all, 'list'],
  list: (filters) => [...businessQueryKeys.lists(), { filters }],
  search: (query) => [...businessQueryKeys.lists(), { search: query }],
  byCategory: (category) => [...businessQueryKeys.lists(), { category }],
  byLocation: (location) => [...businessQueryKeys.lists(), { location }],
  details: () => [...businessQueryKeys.all, 'detail'],
  detail: (id) => [...businessQueryKeys.details(), id],
  byOwner: (ownerId) => [...businessQueryKeys.lists(), { ownerId }],
  dashboard: (id) => [...businessQueryKeys.detail(id), 'dashboard'],
  analytics: (id) => [...businessQueryKeys.detail(id), 'analytics'],
};
```

### Hooks Avanzados
```javascript
// features/business/queries/use-business-queries.js
export const useBusinessesByCategory = (category, location) => {
  return useQuery({
    queryKey: businessQueryKeys.byCategory(category),
    queryFn: () => BusinessService.getByCategory(category, location),
    enabled: !!category,
    staleTime: 2 * 60 * 1000,
  });
};

export const useBusinessSearch = (searchQuery, filters = {}) => {
  return useQuery({
    queryKey: businessQueryKeys.search(searchQuery),
    queryFn: () => BusinessService.search(searchQuery, filters),
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 1 * 60 * 1000,
    keepPreviousData: true, // Mantener resultados anteriores mientras carga nuevos
  });
};

export const useBusinessesByOwner = (ownerId) => {
  return useQuery({
    queryKey: businessQueryKeys.byOwner(ownerId),
    queryFn: () => BusinessService.getByOwner(ownerId),
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (businessData) => BusinessService.create(businessData),
    onSuccess: (newBusiness) => {
      // Agregar al cache de listas
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.lists()
      });
      
      // Agregar al cache específico
      queryClient.setQueryData(
        businessQueryKeys.detail(newBusiness.id),
        newBusiness
      );
    },
  });
};

export const useToggleBusinessStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, isOpen }) => 
      BusinessService.toggleStatus(businessId, isOpen),
    
    // Optimistic update para mejor UX
    onMutate: async ({ businessId, isOpen }) => {
      await queryClient.cancelQueries({
        queryKey: businessQueryKeys.detail(businessId)
      });

      const previousBusiness = queryClient.getQueryData(
        businessQueryKeys.detail(businessId)
      );

      queryClient.setQueryData(
        businessQueryKeys.detail(businessId),
        (old) => ({ ...old, isOpen })
      );

      return { previousBusiness, businessId };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousBusiness) {
        queryClient.setQueryData(
          businessQueryKeys.detail(context.businessId),
          context.previousBusiness
        );
      }
    },
  });
};
```

## Feature: Products (products/)

### Query Keys con Relaciones
```javascript
// features/products/queries/product-query-keys.js
export const productQueryKeys = {
  all: ['products'],
  lists: () => [...productQueryKeys.all, 'list'],
  list: (filters) => [...productQueryKeys.lists(), { filters }],
  byBusiness: (businessId) => [...productQueryKeys.lists(), { businessId }],
  byCategory: (businessId, category) => [
    ...productQueryKeys.byBusiness(businessId), 
    { category }
  ],
  search: (businessId, query) => [
    ...productQueryKeys.byBusiness(businessId), 
    { search: query }
  ],
  details: () => [...productQueryKeys.all, 'detail'],
  detail: (id) => [...productQueryKeys.details(), id],
  infinite: (businessId, filters) => [
    ...productQueryKeys.byBusiness(businessId),
    'infinite',
    { filters }
  ],
};
```

### Implementación con Paginación
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
    staleTime: 1 * 60 * 1000,
  });
};

export const useProductsByCategory = (businessId, category) => {
  return useQuery({
    queryKey: productQueryKeys.byCategory(businessId, category),
    queryFn: () => ProductService.getByCategory(businessId, category),
    enabled: !!businessId && !!category,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData) => ProductService.create(productData),
    onSuccess: (newProduct) => {
      // Invalidar listas del business
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.byBusiness(newProduct.businessId)
      });
      
      // Invalidar queries infinitas
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.infinite(newProduct.businessId)
      });
      
      // Cachear producto específico
      queryClient.setQueryData(
        productQueryKeys.detail(newProduct.id),
        newProduct
      );
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, stock }) => 
      ProductService.updateStock(productId, stock),
    
    // Optimistic update para stock
    onMutate: async ({ productId, stock }) => {
      await queryClient.cancelQueries({
        queryKey: productQueryKeys.detail(productId)
      });

      const previousProduct = queryClient.getQueryData(
        productQueryKeys.detail(productId)
      );

      queryClient.setQueryData(
        productQueryKeys.detail(productId),
        (old) => ({ ...old, stock, updatedAt: new Date().toISOString() })
      );

      return { previousProduct, productId };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productQueryKeys.detail(context.productId),
          context.previousProduct
        );
      }
    },
  });
};
```

## Feature: Orders (orders/)

### Query Keys Complejas
```javascript
// features/orders/queries/order-query-keys.js
export const orderQueryKeys = {
  all: ['orders'],
  lists: () => [...orderQueryKeys.all, 'list'],
  list: (filters) => [...orderQueryKeys.lists(), { filters }],
  byUser: (userId) => [...orderQueryKeys.lists(), { userId }],
  byBusiness: (businessId) => [...orderQueryKeys.lists(), { businessId }],
  byStatus: (status) => [...orderQueryKeys.lists(), { status }],
  active: (userId) => [...orderQueryKeys.byUser(userId), { status: 'active' }],
  history: (userId) => [...orderQueryKeys.byUser(userId), { status: 'completed' }],
  details: () => [...orderQueryKeys.all, 'detail'],
  detail: (id) => [...orderQueryKeys.details(), id],
  tracking: (id) => [...orderQueryKeys.detail(id), 'tracking'],
  realtime: (id) => [...orderQueryKeys.detail(id), 'realtime'],
};
```

### Real-time Updates
```javascript
// features/orders/queries/use-order-queries.js
export const useOrderRealtime = (orderId) => {
  const queryClient = useQueryClient();
  
  // Configurar listener en tiempo real
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = OrderService.subscribeToOrder(orderId, (orderData) => {
      queryClient.setQueryData(orderQueryKeys.detail(orderId), orderData);
      
      // También actualizar en listas si está presente
      queryClient.setQueriesData(
        { queryKey: orderQueryKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          return oldData.map(order => 
            order.id === orderId ? orderData : order
          );
        }
      );
    });

    return unsubscribe;
  }, [orderId, queryClient]);

  return useQuery({
    queryKey: orderQueryKeys.realtime(orderId),
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
    refetchOnWindowFocus: false, // No refetch manual, confiamos en real-time
  });
};

export const useActiveOrders = (userId) => {
  return useQuery({
    queryKey: orderQueryKeys.active(userId),
    queryFn: () => OrderService.getActiveOrders(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 segundos para órdenes activas
    refetchInterval: 60 * 1000, // Refetch cada minuto
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => OrderService.create(orderData),
    onSuccess: (newOrder) => {
      // Invalidar órdenes del usuario
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.byUser(newOrder.userId)
      });
      
      // Invalidar órdenes del negocio
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.byBusiness(newOrder.businessId)
      });
      
      // Cachear la nueva orden
      queryClient.setQueryData(
        orderQueryKeys.detail(newOrder.id),
        newOrder
      );
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status, details }) => 
      OrderService.updateStatus(orderId, status, details),
    
    onSuccess: (updatedOrder) => {
      // Actualizar orden específica
      queryClient.setQueryData(
        orderQueryKeys.detail(updatedOrder.id),
        updatedOrder
      );
      
      // Invalidar listas relevantes
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.byUser(updatedOrder.userId)
      });
      
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.byBusiness(updatedOrder.businessId)
      });
    },
  });
};
```

## Feature: Social (social/)

### Query Keys para Features Sociales
```javascript
// features/social/queries/social-query-keys.js
export const socialQueryKeys = {
  all: ['social'],
  posts: () => [...socialQueryKeys.all, 'posts'],
  postList: (filters) => [...socialQueryKeys.posts(), 'list', { filters }],
  postDetail: (id) => [...socialQueryKeys.posts(), 'detail', id],
  postComments: (postId) => [...socialQueryKeys.postDetail(postId), 'comments'],
  feed: (userId) => [...socialQueryKeys.posts(), 'feed', { userId }],
  userPosts: (userId) => [...socialQueryKeys.posts(), 'user', { userId }],
  likes: () => [...socialQueryKeys.all, 'likes'],
  postLikes: (postId) => [...socialQueryKeys.likes(), 'post', postId],
  userLikes: (userId) => [...socialQueryKeys.likes(), 'user', userId],
};
```

### Implementación Social Features
```javascript
// features/social/queries/use-social-queries.js
export const useSocialFeed = (userId) => {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.feed(userId),
    queryFn: ({ pageParam = null }) => 
      SocialService.getFeed(userId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postData) => SocialService.createPost(postData),
    onSuccess: (newPost) => {
      // Invalidar feed del usuario
      queryClient.invalidateQueries({
        queryKey: socialQueryKeys.feed(newPost.userId)
      });
      
      // Invalidar posts del usuario
      queryClient.invalidateQueries({
        queryKey: socialQueryKeys.userPosts(newPost.userId)
      });
      
      // Cachear el nuevo post
      queryClient.setQueryData(
        socialQueryKeys.postDetail(newPost.id),
        newPost
      );
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, userId, isLiked }) => 
      SocialService.toggleLike(postId, userId, isLiked),
    
    // Optimistic update para likes
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({
        queryKey: socialQueryKeys.postDetail(postId)
      });

      const previousPost = queryClient.getQueryData(
        socialQueryKeys.postDetail(postId)
      );

      queryClient.setQueryData(
        socialQueryKeys.postDetail(postId),
        (old) => ({
          ...old,
          isLiked: isLiked,
          likesCount: isLiked ? old.likesCount + 1 : old.likesCount - 1
        })
      );

      return { previousPost, postId };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          socialQueryKeys.postDetail(context.postId),
          context.previousPost
        );
      }
    },
  });
};
```

## Cross-Feature Integration

### Shared Storage Queries
```javascript
// shared/queries/use-storage-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileStorageService } from '../services/file-storage-service';
import { userQueryKeys } from '../../features/auth/queries/user-query-keys';
import { businessQueryKeys } from '../../features/business/queries/business-query-keys';

export const storageQueryKeys = {
  all: ['storage'],
  uploads: () => [...storageQueryKeys.all, 'uploads'],
  upload: (id) => [...storageQueryKeys.uploads(), id],
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, path, metadata }) => 
      FileStorageService.uploadFile(file, path, metadata),
    
    onSuccess: (result, { metadata }) => {
      // Invalidar datos relacionados basado en el tipo de archivo
      if (metadata.type === 'profile') {
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.detail(metadata.userId)
        });
      } else if (metadata.type === 'business') {
        queryClient.invalidateQueries({
          queryKey: businessQueryKeys.detail(metadata.businessId)
        });
      }
    },
  });
};
```

### Query Prefetching Strategy
```javascript
// navigation/app-navigator.jsx
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

const HomeTabScreen = () => {
  const queryClient = useQueryClient();
  
  useFocusEffect(
    React.useCallback(() => {
      // Prefetch datos que probablemente el usuario necesite
      queryClient.prefetchQuery({
        queryKey: businessQueryKeys.list({ featured: true }),
        queryFn: () => BusinessService.getFeatured(),
        staleTime: 5 * 60 * 1000,
      });
      
      queryClient.prefetchQuery({
        queryKey: productQueryKeys.list({ trending: true }),
        queryFn: () => ProductService.getTrending(),
        staleTime: 3 * 60 * 1000,
      });
    }, [queryClient])
  );

  return <HomeScreen />;
};
```

## Performance Optimizations

### Select para Datos Parciales
```javascript
// Solo obtener campos específicos para mejorar performance
export const useBusinessBasicInfo = (businessId) => {
  return useQuery({
    queryKey: businessQueryKeys.detail(businessId),
    queryFn: () => BusinessService.getBusiness(businessId),
    select: (data) => ({
      id: data.id,
      name: data.name,
      logo: data.logo,
      rating: data.rating,
      isOpen: data.isOpen
    }),
    enabled: !!businessId,
  });
};
```

### Structural Sharing para Arrays
```javascript
export const useProductList = (businessId) => {
  return useQuery({
    queryKey: productQueryKeys.byBusiness(businessId),
    queryFn: () => ProductService.getByBusiness(businessId),
    select: (data) => 
      data.map(product => ({
        ...product,
        displayPrice: `$${product.price.toFixed(2)}`
      })),
    enabled: !!businessId,
    structuralSharing: true, // Evita re-renders innecesarios
  });
};
```

Esta implementación asegura que cada feature tenga una gestión de estado del servidor robusta, eficiente y mantenible usando TanStack Query.

---

## 📖 Navegación

**Anterior:** [Patrones Básicos](./02-patrones-basicos.md) | **Siguiente:** [Configuración](./04-configuracion.md)