# Configuración TanStack Query

## Setup Inicial

### Instalación de Dependencias
```bash
# TanStack Query core
npm install @tanstack/react-query

# DevTools para debugging (opcional pero recomendado)
npm install @tanstack/react-query-devtools

# Persisten para cache offline (opcional)
npm install @tanstack/react-query-persist-client-core
npm install @react-native-async-storage/async-storage
```

### Configuración del QueryClient

#### Configuración Base
```javascript
// shared/config/query-client.js
import { QueryClient } from '@tanstack/react-query';
import { translateAPIError } from '../utils/api-errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por defecto: 5 minutos stale, 10 minutos cache
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      
      // Retry strategy personalizada
      retry: (failureCount, error) => {
        // No reintentar errores de permisos
        if (error?.code === 'permission-denied') return false;
        if (error?.code === 'not-found') return false;
        
        // Reintentar errores de red hasta 3 veces
        if (error?.code === 'unavailable') return failureCount < 3;
        
        // Para otros errores, reintentar 1 vez
        return failureCount < 1;
      },
      
      // Delay entre reintentos (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch automático en eventos
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    
    mutations: {
      // Error handling global para mutations
      onError: (error, variables, context) => {
        const translatedError = translateAPIError(error);
        console.error('Mutation error:', translatedError);
        
        // Aquí podrías integrar sistema de notificaciones
        // showErrorToast(translatedError.message);
      },
      
      // Retry para mutations críticas
      retry: (failureCount, error) => {
        // Solo reintentar errores de red
        if (error?.code === 'unavailable') return failureCount < 2;
        return false;
      },
    },
  },
});
```

#### Configuración Avanzada con Persistencia
```javascript
// shared/config/query-client-persisted.js
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client-core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createAsyncStoragePersister = () => ({
  persistClient: async (client) => {
    try {
      await AsyncStorage.setItem('REACT_QUERY_CACHE', JSON.stringify(client));
    } catch (error) {
      console.error('Error persisting query client:', error);
    }
  },
  
  restoreClient: async () => {
    try {
      const stored = await AsyncStorage.getItem('REACT_QUERY_CACHE');
      return stored ? JSON.parse(stored) : undefined;
    } catch (error) {
      console.error('Error restoring query client:', error);
      return undefined;
    }
  },
  
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem('REACT_QUERY_CACHE');
    } catch (error) {
      console.error('Error removing query client:', error);
    }
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas para cache persistente
    },
  },
});

// Configurar persistencia
const persister = createAsyncStoragePersister();

export const initializeQueryClient = () => {
  return persistQueryClient({
    queryClient,
    persister,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    buster: '1.0', // Cambiar para invalidar cache completo
  });
};
```

### Setup del Provider

#### Provider Básico
```javascript
// app/App.jsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../shared/config/query-client';
import AppNavigator from '../navigation/app-navigator';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
};

export default App;
```

#### Provider con DevTools y Persistencia
```javascript
// app/App.jsx
import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, initializeQueryClient } from '../shared/config/query-client-persisted';
import { LoadingScreen } from '../shared/components/loading-screen';
import AppNavigator from '../navigation/app-navigator';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setupQueryClient = async () => {
      try {
        await initializeQueryClient();
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing query client:', error);
        setIsReady(true); // Continuar sin persistencia
      }
    };

    setupQueryClient();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
      {__DEV__ && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export default App;
```

## Configuraciones Específicas por Feature

### Configuración para Auth
```javascript
// features/auth/queries/auth-config.js
export const authQueryConfig = {
  staleTime: 10 * 60 * 1000, // 10 minutos - datos de usuario cambian poco
  cacheTime: 30 * 60 * 1000, // 30 minutos cache
  refetchOnWindowFocus: false, // No refetch automático para datos sensibles
};

// Uso en hooks
export const useUser = (userId) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => UserService.getUser(userId),
    ...authQueryConfig,
    enabled: !!userId,
  });
};
```

### Configuración para Business
```javascript
// features/business/queries/business-config.js
export const businessQueryConfig = {
  staleTime: 2 * 60 * 1000, // 2 minutos - negocios cambian horarios/estado
  cacheTime: 10 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchInterval: 5 * 60 * 1000, // Re-fetch cada 5 minutos
};

export const businessListConfig = {
  staleTime: 1 * 60 * 1000, // 1 minuto para listas
  cacheTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
};
```

### Configuración para Orders (Real-time)
```javascript
// features/orders/queries/order-config.js
export const orderQueryConfig = {
  staleTime: 0, // Siempre considerar como stale para datos en tiempo real
  cacheTime: 2 * 60 * 1000, // Cache corto
  refetchInterval: 30 * 1000, // Refetch cada 30 segundos
  refetchIntervalInBackground: true,
};

export const activeOrderConfig = {
  staleTime: 0,
  cacheTime: 1 * 60 * 1000,
  refetchInterval: 15 * 1000, // Más frecuente para órdenes activas
  refetchIntervalInBackground: true,
};
```

## DevTools Setup

### Configuración de DevTools
```javascript
// shared/config/devtools.js
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const DevTools = () => {
  if (!__DEV__) return null;

  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      position="bottom-right"
      toggleButtonProps={{
        style: {
          marginLeft: 20,
          transform: [{ scale: 0.8 }], // Más pequeño en mobile
        },
      }}
    />
  );
};
```

### Debug Helpers
```javascript
// shared/utils/query-debug.js
import { queryClient } from '../config/query-client';

export const debugQueryCache = () => {
  if (__DEV__) {
    console.log('Query Cache:', queryClient.getQueryCache().getAll());
  }
};

export const debugQueryKey = (queryKey) => {
  if (__DEV__) {
    const query = queryClient.getQueryCache().find({ queryKey });
    console.log(`Query [${JSON.stringify(queryKey)}]:`, query);
  }
};

export const clearQueryCache = () => {
  if (__DEV__) {
    queryClient.clear();
    console.log('Query cache cleared');
  }
};

// Hook para debugging
export const useQueryDebug = (queryKey, enabled = __DEV__) => {
  React.useEffect(() => {
    if (enabled) {
      debugQueryKey(queryKey);
    }
  }, [queryKey, enabled]);
};
```

## Error Handling Global

### Traducción de Errores HTTP/API
```javascript
// shared/utils/api-errors.js
const errorMessages = {
  400: 'Los datos proporcionados no son válidos',
  401: 'Debes iniciar sesión para continuar',
  403: 'No tienes permisos para realizar esta acción',
  404: 'El recurso solicitado no existe',
  409: 'Este recurso ya existe',
  422: 'Los datos proporcionados contienen errores',
  429: 'Has excedido el límite de uso. Intenta más tarde.',
  500: 'Error interno del servidor. Intenta más tarde.',
  502: 'Servicio temporalmente no disponible. Intenta de nuevo.',
  503: 'Servicio temporalmente no disponible. Intenta de nuevo.',
};

export const translateAPIError = (error) => {
  const status = error?.response?.status || error?.status || 'unknown';
  const message = errorMessages[status] || error?.message || 'Ha ocurrido un error inesperado';

  return {
    status,
    message,
    originalError: error,
    details: error?.response?.data,
  };
};
```

### Error Boundary para Queries
```javascript
// shared/components/query-error-boundary.jsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

class QueryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Query Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          onRetry={() => {
            this.setState({ hasError: false, error: null });
            this.props.onRetry?.();
          }}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, onRetry }) => {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries(); // Invalidar todas las queries
    onRetry?.();
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-lg font-semibold text-red-600 mb-2">
        Algo salió mal
      </Text>
      <Text className="text-gray-600 text-center mb-4">
        {error?.message || 'Ha ocurrido un error inesperado'}
      </Text>
      <Pressable
        onPress={handleRetry}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Reintentar</Text>
      </Pressable>
    </View>
  );
};

export default QueryErrorBoundary;
```

## Performance y Optimizaciones

### Configuración de Background Refetch
```javascript
// shared/config/background-config.js
import { AppState } from 'react-native';
import { focusManager } from '@tanstack/react-query';

// Configurar focus manager para React Native
export const setupFocusManager = () => {
  const onAppStateChange = (status) => {
    focusManager.setFocused(status === 'active');
  };

  AppState.addEventListener('change', onAppStateChange);
  
  return () => {
    AppState.removeEventListener('change', onAppStateChange);
  };
};
```

### Prefetch Strategy
```javascript
// shared/hooks/use-prefetch-strategy.js
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { businessQueryKeys } from '../../features/business/queries/business-query-keys';
import { productQueryKeys } from '../../features/products/queries/product-query-keys';

export const usePrefetchStrategy = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchUserData = async () => {
    if (!user?.uid) return;

    // Prefetch datos del usuario
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.detail(user.uid),
      queryFn: () => UserService.getUser(user.uid),
      staleTime: 10 * 60 * 1000,
    });

    // Prefetch órdenes activas
    queryClient.prefetchQuery({
      queryKey: orderQueryKeys.active(user.uid),
      queryFn: () => OrderService.getActiveOrders(user.uid),
      staleTime: 1 * 60 * 1000,
    });
  };

  const prefetchHomeData = async () => {
    // Prefetch negocios destacados
    queryClient.prefetchQuery({
      queryKey: businessQueryKeys.list({ featured: true }),
      queryFn: () => BusinessService.getFeatured(),
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch categorías populares
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.list({ trending: true }),
      queryFn: () => ProductService.getTrending(),
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    prefetchUserData,
    prefetchHomeData,
  };
};
```

### Cache Cleanup Strategy
```javascript
// shared/utils/cache-cleanup.js
import { queryClient } from '../config/query-client';

// Limpiar cache cuando usuario hace logout
export const clearUserCache = (userId) => {
  queryClient.removeQueries({
    queryKey: userQueryKeys.detail(userId)
  });
  
  queryClient.removeQueries({
    queryKey: orderQueryKeys.byUser(userId)
  });
};

// Limpiar cache obsoleto (ejecutar periódicamente)
export const cleanupStaleCache = () => {
  queryClient.getQueryCache().getAll().forEach((query) => {
    const cacheTime = query.cacheTime || 5 * 60 * 1000;
    const isStale = Date.now() - query.state.dataUpdatedAt > cacheTime;
    
    if (isStale && !query.observers.length) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
};
```

Esta configuración asegura que TanStack Query funcione de manera óptima en el proyecto, con manejo adecuado de errores, cache inteligente y performance optimizada.

---

## 📖 Navegación

**Anterior:** [Implementación por Features](./03-implementacion-features.md) | **Siguiente:** [Migración - Inicio](../04-migracion/00-inicio.md)