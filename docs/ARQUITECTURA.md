# Arquitectura del Proyecto UNO Delivery

## Visión General

UNO Delivery es una aplicación React Native construida con **Expo Router** que sigue una arquitectura basada en **dominios** y **separación de responsabilidades**. La aplicación soporta múltiples tipos de usuario (cliente, negocio, delivery) en una sola codebase.

## Calificación Actual de Arquitectura: 7.5/10

La arquitectura tiene una base sólida con clara separación de dominios, pero requiere mantenimiento continuo para mantener la consistencia conforme el proyecto escale.

---

## Estructura de Carpetas

```
uno-delivery/
├── app/                    # Capa de navegación (Expo Router)
├── core/                   # Infraestructura central
│   └── auth/              # Dominio de autenticación
├── modules/               # Dominios de funcionalidad
│   ├── social/           # Posts, historias, videos, categorías
│   ├── commerce/         # Productos, tiendas, órdenes
│   ├── delivery/         # Entregas y ganancias del delivery
│   ├── analytics/        # Dashboard y analytics de negocio
│   └── home/             # Pantallas home por tipo de usuario
├── shared/               # Utilidades y componentes compartidos
│   ├── api/             # Capa adaptadora de Firebase
│   ├── components/      # Componentes UI reutilizables
│   ├── hooks/           # Hooks compartidos cross-domain
│   ├── config/          # Configuración centralizada
│   ├── stores/          # Estados globales (Zustand)
│   ├── utils/           # Funciones utilitarias
│   └── schemas/         # Esquemas de validación (Zod)
└── docs/                # Documentación del proyecto
```

---

## Capas de la Arquitectura

### 1. App Layer (Capa de Navegación)

**Ubicación:** `app/`

**Responsabilidad:** Gestión de routing y navegación usando Expo Router (file-based routing).

**Reglas:**
- Solo contiene archivos de routing y layouts
- Importa screens desde `modules/` y `core/`
- No debe contener lógica de negocio
- Puede usar hooks de `shared/` y `core/`

**Ejemplo:**
```javascript
// app/(main)/index.jsx
import ClientHomeScreen from '../../modules/home/client-home';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';

export default function HomeScreen() {
  const { currentUserType } = useCurrentUserType();
  // Renderiza screen según tipo de usuario
}
```

---

### 2. Core Layer (Infraestructura Central)

**Ubicación:** `core/`

**Responsabilidad:** Contiene dominios de infraestructura crítica que toda la aplicación necesita.

**Actualmente contiene:**
- `core/auth/` - Autenticación, registro, gestión de tipos de usuario

**Estructura de un módulo core:**
```
core/auth/
├── components/      # Componentes de auth (login, register)
├── services/        # Servicios (auth-service.js)
├── stores/          # Estado global (auth-store.js)
└── index.js         # Barrel exports (solo lo esencial)
```

**Reglas:**
- Solo debe contener funcionalidad de infraestructura crítica
- Puede importar de `shared/`
- NO debe importar de `modules/`
- Exports públicos limitados a lo esencial

**Candidatos futuros para core:**
- `core/notifications/` - Sistema de notificaciones push
- `core/analytics/` - Analytics y tracking de eventos
- `core/payments/` - Procesamiento de pagos

---

### 3. Modules Layer (Dominios de Funcionalidad)

**Ubicación:** `modules/`

**Responsabilidad:** Dominios de funcionalidad del negocio, organizados por contexto.

**Módulos actuales:**

#### `modules/social/`
Funcionalidad de red social: posts, historias, videos, categorías.

```
modules/social/
├── hooks/           # Hooks de dominio
│   ├── use-posts.js
│   ├── use-stories.js
│   ├── use-videos.js
│   └── use-categories.js
├── feed/            # Feature: Feed de posts
├── stories/         # Feature: Story viewer
├── videos/          # Feature: Video viewer
└── categories/      # Feature: Categorías
```

#### `modules/commerce/`
E-commerce: productos, tiendas, órdenes.

```
modules/commerce/
├── hooks/
│   └── use-products.js
├── products/        # Feature: Catálogo de productos
├── stores/          # Feature: Tiendas
└── orders/          # Feature: Órdenes
```

#### `modules/delivery/`
Entregas y ganancias para deliveries.

#### `modules/analytics/`
Dashboard y analytics para negocios.

#### `modules/home/`
Pantallas home personalizadas por tipo de usuario.

**Reglas:**
- Cada módulo debe ser lo más independiente posible
- Puede importar de `shared/` y hooks de otros `modules/` (con cuidado)
- NO debe importar de `core/` directamente (usar shared/)
- Debe tener su propia carpeta `hooks/` con React Query hooks

**Estructura estándar de un módulo:**
```
modules/{domain}/
├── hooks/              # React Query hooks del dominio
│   ├── index.js       # Barrel exports
│   └── use-{resource}.js
├── {feature}/          # Features individuales
│   ├── index.jsx      # Screen principal
│   └── components/    # Componentes locales del feature
└── index.js           # Barrel exports del módulo (opcional)
```

---

### 4. Shared Layer (Compartido)

**Ubicación:** `shared/`

**Responsabilidad:** Código verdaderamente compartido entre todos los dominios.

#### `shared/api/`
Capa adaptadora de Firebase que simula un REST API.

```
shared/api/
├── firebase-client.js       # Cliente principal
├── base-firebase-service.js # Clase base para recursos
├── {resource}/
│   ├── resource.js         # Clase del recurso
│   ├── collection.js       # Colección de datos
│   └── seeder.js           # Seeder de datos
└── index.js                # Inicialización y exports
```

**Reglas API:**
- Todos los recursos deben seguir el patrón `{resource}/resource.js + collection.js`
- Los endpoints deben registrarse en `shared/api/index.js`
- Usar solo `apiClient` para llamadas, no Firebase SDK directamente

#### `shared/components/`
Componentes UI reutilizables.

```
shared/components/
├── ui/              # Componentes base (Button, Card, Input, etc.)
├── forms/           # Formularios complejos
├── modals/          # Modales y bottom sheets
└── layout/          # Componentes de layout
```

**Reglas:**
- Solo componentes verdaderamente reutilizables
- No deben contener lógica de negocio específica
- Deben ser configurables via props

#### `shared/hooks/`
Hooks compartidos cross-domain.

**Hooks actuales:**
- `use-user-type.js` - Gestión de tipos de usuario
- `use-addresses.js` - CRUD de direcciones
- `use-focus-manager.js` - Gestión de foco en forms

**Reglas:**
- Solo hooks que se usan en múltiples módulos
- Hooks específicos de un dominio van en `modules/{domain}/hooks/`

#### `shared/config/`
Configuración centralizada.

- `theme.js` - Tema de colores y estilos
- `user-types.js` - Configuración de tipos de usuario
- `firebase.js` - Configuración de Firebase

#### `shared/stores/`
Estados globales (Zustand).

**Actualmente vacío** - los stores están en `core/auth/stores/`

#### `shared/utils/`
Funciones utilitarias puras.

- `colors.js` - Helpers de colores
- `address-helpers.js` - Helpers de direcciones
- `cn.js` - Class name utility

---

## Flujo de Datos

### 1. Fetching de Datos (React Query)

```
Component
    ↓
Module Hook (use-posts.js)
    ↓
apiClient (Firebase Adapter)
    ↓
Resource Class (PostsResource)
    ↓
BaseFirebaseService
    ↓
Firestore
```

**Ejemplo completo:**
```javascript
// 1. Component
import { usePosts } from '../hooks/use-posts';

function FeedScreen() {
  const { data: posts } = usePosts({ limit: 20 });
}

// 2. Module Hook
export const usePosts = ({ limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['posts', 'feed', { limit }],
    queryFn: () => apiClient.get('/posts/feed', { limit }),
  });
};

// 3. Resource (handled by apiClient internally)
```

### 2. Mutations (Crear/Actualizar/Eliminar)

```javascript
// Hook con mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData) => apiClient.post('/posts', postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// En el component
const createPostMutation = useCreatePost();
await createPostMutation.mutateAsync({ title: '...', content: '...' });
```

---

## Patrones y Convenciones

### 1. Importaciones

**Orden de imports:**
```javascript
// 1. Externos
import React from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

// 2. Shared
import { Button } from '../../../shared/components/ui';
import { useUserType } from '../../../shared/hooks';

// 3. Core
import { useAuthStore } from '../../../core/auth/stores/auth-store';

// 4. Módulos (si es necesario)
import { useProducts } from '../../commerce/hooks/use-products';

// 5. Locales
import { PostCard } from './components/post-card';
```

**Rutas de importación:**
- Usar rutas relativas (`../../../`)
- NO usar alias (`@/`, `~/`) - Expo Router no los soporta bien
- Importar desde barrel files (`/index.js`) cuando existan

### 2. Naming Conventions

**Archivos:**
- Componentes: `kebab-case.jsx` (ej: `user-type-selector.jsx`)
- Hooks: `use-{nombre}.js` (ej: `use-posts.js`)
- Servicios: `{nombre}-service.js` (ej: `auth-service.js`)
- Stores: `{nombre}-store.js` (ej: `auth-store.js`)
- Utilidades: `{nombre}.js` (ej: `colors.js`)

**Variables y funciones:**
- camelCase para variables y funciones
- PascalCase para componentes y clases
- UPPER_SNAKE_CASE para constantes

**Hooks de React Query:**
```javascript
// Queries (GET)
useUsers()        // Lista
useUser(id)       // Detalle

// Mutations (POST/PUT/DELETE)
useCreateUser()
useUpdateUser()
useDeleteUser()
```

### 3. Barrel Exports

Cada carpeta debe tener un `index.js` para exportar su API pública:

```javascript
// shared/components/ui/index.js
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';
export { Text } from './text';
```

Esto permite:
```javascript
import { Button, Card, Text } from '../../shared/components/ui';
// En lugar de:
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
```

---

## Tecnologías Principales

### Frontend Framework
- **React Native** - Framework de UI
- **Expo SDK 52** - Tooling y APIs nativas
- **Expo Router** - File-based routing

### Estado y Data Fetching
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management (usado en auth)

### Backend y Base de Datos
- **Firebase Authentication** - Autenticación de usuarios
- **Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos

### Estilos
- **NativeWind (Tailwind CSS)** - Estilos utilitarios
- **StyleSheet API** - Estilos nativos cuando es necesario

### Validación
- **Zod** - Validación de schemas

### UI Components
- **@gorhom/bottom-sheet** - Bottom sheets nativos
- **@expo/vector-icons** - Iconos (Ionicons)

---

## Decisiones de Arquitectura (ADRs)

### ADR-001: Uso de Expo Router en lugar de React Navigation
**Decisión:** Usar Expo Router para routing.
**Razón:** File-based routing más simple, mejor TypeScript support, deep linking automático.

### ADR-002: Arquitectura de Módulos por Dominio
**Decisión:** Organizar features en módulos de dominio (social, commerce, delivery).
**Razón:** Mejor escalabilidad, separación clara de responsabilidades, más fácil de mantener.

### ADR-003: Firebase como Backend Simulado
**Decisión:** Usar Firebase con capa adaptadora que simula REST API.
**Razón:** Desarrollo rápido, fácil migración futura a backend real, abstracción limpia.

### ADR-004: TanStack Query para Data Fetching
**Decisión:** Usar React Query para todas las operaciones de datos.
**Razón:** Cache automático, invalidación declarativa, mejor UX con loading states.

### ADR-005: Hooks de Dominio en Modules
**Decisión:** Cada módulo tiene su carpeta `hooks/` con hooks de React Query.
**Razón:** Encapsulación de lógica de datos, reutilización, testing más fácil.

### ADR-006: Terminología "userType" en lugar de "mode"
**Decisión:** Migrar toda la terminología de "mode" a "userType".
**Razón:** Claridad semántica, evita confusión con otros conceptos de "mode".

---

## Diagrama de Dependencias

```
┌─────────────────────────────────────┐
│           APP LAYER                 │
│    (Expo Router Screens)           │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│   CORE      │  │    MODULES      │
│             │  │  (Domains)      │
│  - auth     │  │  - social       │
│             │  │  - commerce     │
│             │  │  - delivery     │
│             │  │  - analytics    │
└──────┬──────┘  └──────┬──────────┘
       │                │
       └───────┬────────┘
               │
        ┌──────▼──────┐
        │   SHARED    │
        │             │
        │ - api       │
        │ - components│
        │ - hooks     │
        │ - config    │
        │ - utils     │
        └─────────────┘
```

**Reglas de dependencias:**
- ✅ App → Core, Modules
- ✅ Core → Shared
- ✅ Modules → Shared, otros Modules (con cuidado)
- ✅ Shared → External packages only
- ❌ Core → Modules (PROHIBIDO)
- ❌ Shared → Core, Modules (PROHIBIDO)

---

## Mejoras Futuras Planificadas

1. **Crear módulo `core/payments/`** - Centralizar lógica de pagos
2. **Standardizar estructura interna de modules/** - Todos deben tener hooks/, components/, utils/
3. **Implementar ESLint rules** - Prevenir imports prohibidos
4. **Mejorar testing** - Unit tests para hooks, integration tests para features
5. **Documentar cada módulo** - README.md en cada carpeta de módulo
6. **Crear `app/components/`** - Para componentes de shell (user-type-switcher, adaptive-header)

---

## Referencias

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Firebase Docs](https://firebase.google.com/docs)
- [NativeWind Docs](https://www.nativewind.dev/)
