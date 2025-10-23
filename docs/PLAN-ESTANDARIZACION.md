# Plan de Estandarización del Codebase

**Fecha:** 2025-01-22
**Estado Actual:** Arquitectura sólida pero inconsistente
**Objetivo:** Standardizar 100% del codebase siguiendo las reglas documentadas

---

## Resumen Ejecutivo

**Calificación Actual: 7.5/10**

**Problemas Principales:**
1. Módulos sin estructura `hooks/`
2. Hooks faltantes en módulos parciales
3. Hook no exportado en barrel file
4. Archivos deprecated sin limpiar
5. Inconsistencia en estructura de API resources

---

## Fase 1: Limpieza (PRIORITY 1) - 30 minutos

### 1.1 Eliminar Archivos Deprecated

**Archivos a eliminar:**
```
shared/components/ui/address-type-selector-old.jsx
shared/components/ui/state-selector-old.jsx
```

**Comando:**
```bash
rm shared/components/ui/*-old.jsx
```

**Impacto:** BAJO - Son archivos muertos
**Riesgo:** NINGUNO

---

## Fase 2: Completar Exports (PRIORITY 1) - 15 minutos

### 2.1 Agregar Export de use-media-upload

**Archivo:** `shared/hooks/index.js`

**Cambio:**
```javascript
// Agregar esta línea
export * from './use-media-upload';
```

**Impacto:** BAJO - Hook ya existe, solo falta export
**Riesgo:** NINGUNO

---

## Fase 3: Standardizar Estructura de Módulos (PRIORITY 2) - 2 horas

### 3.1 Módulo Analytics

**Estado Actual:**
```
modules/analytics/
├── dashboard/
│   └── index.jsx
└── products/
    └── index.jsx
```

**Estado Objetivo:**
```
modules/analytics/
├── hooks/
│   ├── index.js
│   ├── use-business-stats.js
│   └── use-sales-data.js
├── dashboard/
│   ├── index.jsx
│   └── components/
│       ├── stats-card.jsx
│       └── sales-chart.jsx
└── products/
    └── index.jsx
```

**Hooks a crear:**

#### `modules/analytics/hooks/use-business-stats.js`
```javascript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene estadísticas del negocio
 * @param {string} businessId - ID del negocio
 * @param {string} timeRange - Rango de tiempo (today, week, month, year)
 */
export const useBusinessStats = (businessId, timeRange = 'month') => {
  return useQuery({
    queryKey: ['business-stats', businessId, timeRange],
    queryFn: async () => {
      const response = await apiClient.get(`/businesses/${businessId}/stats`, {
        timeRange
      });
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Obtiene datos de ventas
 */
export const useSalesData = (businessId, options = {}) => {
  const { startDate, endDate, groupBy = 'day' } = options;

  return useQuery({
    queryKey: ['sales-data', businessId, { startDate, endDate, groupBy }],
    queryFn: async () => {
      const response = await apiClient.get(`/businesses/${businessId}/sales`, {
        startDate,
        endDate,
        groupBy
      });
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### `modules/analytics/hooks/index.js`
```javascript
export * from './use-business-stats';
export * from './use-sales-data';
```

**Impacto:** MEDIO - Mejora organización
**Riesgo:** BAJO - Solo agregar, no modificar existente

---

### 3.2 Módulo Delivery

**Estado Actual:**
```
modules/delivery/
├── deliveries/
│   └── index.jsx
└── earnings/
    └── index.jsx
```

**Estado Objetivo:**
```
modules/delivery/
├── hooks/
│   ├── index.js
│   ├── use-deliveries.js
│   └── use-earnings.js
├── deliveries/
│   ├── index.jsx
│   └── components/
│       └── delivery-card.jsx
└── earnings/
    └── index.jsx
```

**Hooks a crear:**

#### `modules/delivery/hooks/use-deliveries.js`
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene entregas asignadas al delivery
 * @param {string} driverId - ID del delivery
 * @param {string} status - Filtro por status (pending, in_progress, completed)
 */
export const useDeliveries = (driverId, status) => {
  return useQuery({
    queryKey: ['deliveries', driverId, status],
    queryFn: async () => {
      const response = await apiClient.get('/deliveries', {
        driverId,
        status
      });
      return response.data;
    },
    enabled: !!driverId,
    staleTime: 30 * 1000, // 30 segundos - refetch frecuente
  });
};

/**
 * Obtiene detalle de una entrega
 */
export const useDelivery = (deliveryId) => {
  return useQuery({
    queryKey: ['deliveries', deliveryId],
    queryFn: async () => {
      const response = await apiClient.get(`/deliveries/${deliveryId}`);
      return response.data;
    },
    enabled: !!deliveryId,
  });
};

/**
 * Acepta una entrega
 */
export const useAcceptDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deliveryId, driverId }) => {
      const response = await apiClient.post(`/deliveries/${deliveryId}/accept`, {
        driverId
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['deliveries', variables.driverId]);
      queryClient.setQueryData(['deliveries', data.id], data);
    },
  });
};

/**
 * Completa una entrega
 */
export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deliveryId, proofPhoto }) => {
      const response = await apiClient.post(`/deliveries/${deliveryId}/complete`, {
        proofPhoto,
        completedAt: new Date()
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['deliveries']);
      queryClient.invalidateQueries(['earnings']); // Actualizar ganancias
    },
  });
};

/**
 * Actualiza ubicación del delivery
 */
export const useUpdateDeliveryLocation = () => {
  return useMutation({
    mutationFn: async ({ deliveryId, location }) => {
      const response = await apiClient.patch(`/deliveries/${deliveryId}/location`, {
        location
      });
      return response.data;
    },
  });
};
```

#### `modules/delivery/hooks/use-earnings.js`
```javascript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene ganancias del delivery
 * @param {string} driverId - ID del delivery
 * @param {string} timeRange - Rango (today, week, month, all)
 */
export const useEarnings = (driverId, timeRange = 'month') => {
  return useQuery({
    queryKey: ['earnings', driverId, timeRange],
    queryFn: async () => {
      const response = await apiClient.get('/earnings', {
        driverId,
        timeRange
      });
      return response.data;
    },
    enabled: !!driverId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Obtiene estadísticas de ganancias
 */
export const useEarningsStats = (driverId) => {
  return useQuery({
    queryKey: ['earnings-stats', driverId],
    queryFn: async () => {
      const response = await apiClient.get(`/earnings/${driverId}/stats`);
      return response.data;
    },
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### `modules/delivery/hooks/index.js`
```javascript
export * from './use-deliveries';
export * from './use-earnings';
```

**Impacto:** MEDIO - Mejora organización
**Riesgo:** BAJO

---

### 3.3 Módulo Commerce - Completar Hooks

**Estado Actual:**
```
modules/commerce/hooks/
├── index.js
└── use-products.js
```

**Estado Objetivo:**
```
modules/commerce/hooks/
├── index.js
├── use-products.js
├── use-stores.js
└── use-orders.js
```

**Hooks a crear:**

#### `modules/commerce/hooks/use-stores.js`
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene lista de tiendas
 * @param {Object} filters - Filtros (category, location, rating)
 */
export const useStores = (filters = {}) => {
  return useQuery({
    queryKey: ['stores', filters],
    queryFn: async () => {
      const response = await apiClient.get('/stores', filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Obtiene detalle de una tienda
 */
export const useStore = (storeId) => {
  return useQuery({
    queryKey: ['stores', storeId],
    queryFn: async () => {
      const response = await apiClient.get(`/stores/${storeId}`);
      return response.data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Obtiene tiendas destacadas
 */
export const useFeaturedStores = () => {
  return useQuery({
    queryKey: ['stores', 'featured'],
    queryFn: async () => {
      const response = await apiClient.get('/stores/featured');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Sigue una tienda
 */
export const useFollowStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, userId }) => {
      const response = await apiClient.post(`/stores/${storeId}/follow`, {
        userId
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['stores', variables.storeId]);
    },
  });
};

/**
 * Deja de seguir una tienda
 */
export const useUnfollowStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, userId }) => {
      const response = await apiClient.delete(`/stores/${storeId}/follow`, {
        userId
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['stores', variables.storeId]);
    },
  });
};
```

#### `modules/commerce/hooks/use-orders.js`
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene órdenes del usuario
 * @param {string} userId - ID del usuario
 * @param {string} status - Filtro por status
 */
export const useOrders = (userId, status) => {
  return useQuery({
    queryKey: ['orders', userId, status],
    queryFn: async () => {
      const response = await apiClient.get('/orders', {
        userId,
        status
      });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 segundos
  });
};

/**
 * Obtiene detalle de una orden
 */
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

/**
 * Crea una nueva orden
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['orders', variables.userId]);
    },
  });
};

/**
 * Cancela una orden
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, {
        reason
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.setQueryData(['orders', data.id], data);
    },
  });
};

/**
 * Obtiene tracking de una orden
 */
export const useOrderTracking = (orderId) => {
  return useQuery({
    queryKey: ['orders', orderId, 'tracking'],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}/tracking`);
      return response.data;
    },
    enabled: !!orderId,
    refetchInterval: 10 * 1000, // Refetch cada 10 segundos
  });
};
```

#### Actualizar `modules/commerce/hooks/index.js`
```javascript
export * from './use-products';
export * from './use-stores';  // ← Agregar
export * from './use-orders';  // ← Agregar
```

**Impacto:** ALTO - Completa el módulo commerce
**Riesgo:** BAJO

---

## Fase 4: Standardizar API Resources (PRIORITY 3) - 3 horas

### 4.1 Problema Actual

Algunos recursos usan estructura de carpeta, otros archivos planos:

**Estructura inconsistente:**
```
shared/api/
├── products/          ✅ Estructura completa
│   ├── resource.js
│   ├── collection.js
│   └── seeder.js
├── posts/             ✅ Estructura completa
│   ├── resource.js
│   ├── collection.js
│   └── seeder.js
├── users.js           ❌ Archivo plano
├── businesses.js      ❌ Archivo plano
└── user-types-api.js  ❌ Mal nombre
```

### 4.2 Plan de Migración

**Migrar a estructura de carpeta:**

1. **users.js** → **users/**
   ```
   shared/api/users/
   ├── resource.js      (mover contenido de users.js)
   ├── collection.js    (crear colección inicial)
   └── seeder.js        (crear seeder)
   ```

2. **businesses.js** → **businesses/**
   ```
   shared/api/businesses/
   ├── resource.js
   ├── collection.js
   └── seeder.js
   ```

3. **user-types-api.js** → **user-types/**
   ```
   shared/api/user-types/
   ├── resource.js      (renombrar y mover)
   ├── collection.js    (crear)
   └── seeder.js        (crear)
   ```

**Impacto:** MEDIO - Mejora consistencia
**Riesgo:** MEDIO - Requiere actualizar imports en `shared/api/index.js`

---

## Fase 5: Agregar Recursos API Faltantes (PRIORITY 3) - 4 horas

### 5.1 Recursos Necesarios

#### Deliveries Resource
```
shared/api/deliveries/
├── resource.js
├── collection.js
└── seeder.js
```

#### Orders Resource
```
shared/api/orders/
├── resource.js
├── collection.js
└── seeder.js
```

#### Stores Resource
```
shared/api/stores/
├── resource.js
├── collection.js
└── seeder.js
```

#### Reviews Resource
```
shared/api/reviews/
├── resource.js
├── collection.js
└── seeder.js
```

**Impacto:** ALTO - Completa backend simulado
**Riesgo:** BAJO

---

## Fase 6: Documentación (PRIORITY 2) - 2 horas

### 6.1 README por Módulo

Crear `README.md` en cada módulo:

```
modules/social/README.md
modules/commerce/README.md
modules/delivery/README.md
modules/analytics/README.md
modules/home/README.md
```

**Contenido mínimo:**
- Descripción del módulo
- Features incluidos
- Hooks disponibles
- Cómo agregar nuevos features

**Impacto:** MEDIO - Mejora onboarding
**Riesgo:** NINGUNO

---

## Resumen de Prioridades

### PRIORITY 1 (URGENTE) - 45 minutos
- [ ] Eliminar archivos `-old.jsx`
- [ ] Exportar `use-media-upload` en `shared/hooks/index.js`

### PRIORITY 2 (ALTA) - 6 horas
- [ ] Crear `modules/analytics/hooks/` con hooks
- [ ] Crear `modules/delivery/hooks/` con hooks
- [ ] Completar `modules/commerce/hooks/` (stores, orders)
- [ ] Crear READMEs por módulo

### PRIORITY 3 (MEDIA) - 7 horas
- [ ] Standardizar estructura de API resources
- [ ] Crear recursos API faltantes (deliveries, orders, stores, reviews)

### PRIORITY 4 (BAJA)
- [ ] Configurar ESLint rules
- [ ] Agregar tests unitarios
- [ ] Mover components de layout a app-shell

---

## Métricas de Éxito

**Antes de estandarización:**
- Calificación: 7.5/10
- Módulos con hooks: 2/4 (50%)
- API resources con estructura: 50%
- Cobertura de tests: 0%

**Después de estandarización:**
- Calificación objetivo: 9.0/10
- Módulos con hooks: 4/4 (100%)
- API resources con estructura: 100%
- Hooks faltantes: 0
- Documentación: 100%

---

## Checklist de Estandarización

### Estructura de Módulos
- [ ] Todos los módulos tienen `hooks/` folder
- [ ] Todos los hooks tienen barrel export (`index.js`)
- [ ] Todos los módulos tienen README.md

### Hooks
- [ ] Todos los hooks siguen naming convention
- [ ] Todos los hooks están documentados con JSDoc
- [ ] Todos los hooks usan React Query correctamente
- [ ] No hay hooks duplicados entre shared y modules

### API
- [ ] Todos los recursos siguen estructura de carpeta
- [ ] Todos los recursos tienen resource.js, collection.js, seeder.js
- [ ] Todos los recursos están registrados en index.js
- [ ] No hay inconsistencias en naming

### Limpieza
- [ ] No hay archivos `-old.*`
- [ ] No hay código comentado extenso
- [ ] No hay TODOs sin owner

### Documentación
- [ ] ARQUITECTURA.md actualizado
- [ ] REGLAS-DESARROLLO.md actualizado
- [ ] GUIA-NUEVAS-FUNCIONALIDADES.md actualizado
- [ ] Cada módulo tiene README.md

---

**Tiempo Total Estimado:** 15-20 horas
**Recomendación:** Ejecutar en 3 sprints de 1 semana c/u

---

**Última actualización:** 2025-01-22
