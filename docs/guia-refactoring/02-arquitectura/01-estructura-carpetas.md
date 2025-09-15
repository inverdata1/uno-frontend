# Estructura de Carpetas - Arquitectura Feature-Based

## Visión General

La nueva estructura organiza el código por **funcionalidad** (features) en lugar de por **tipo de archivo**. Esto facilita encontrar código relacionado, escala mejor con equipos y reduce coupling entre features.

## Estructura Completa

**IMPORTANTE:** Esta app usa **Expo Router** con file-based routing. La estructura principal está en `app/` (no `src/`).

```
app/                              # Expo Router - File-based routing
├── (auth)/                       # Route group para autenticación
│   ├── _layout.jsx               # Layout para pantallas de auth
│   ├── onboarding.jsx            # Bienvenida inicial
│   ├── login.jsx                 # Pantalla de login
│   ├── register.jsx              # Pantalla de registro
│   └── reset-password.jsx        # Recuperar contraseña
├── (main)/                       # Route group para app principal unificada
│   ├── _layout.jsx               # Tab navigation para todos los usuarios
│   ├── home.jsx                  # Feed principal con productos/videos
│   ├── search.jsx                # Búsqueda y exploración
│   ├── stores/
│   │   ├── index.jsx             # Navegación de tiendas
│   │   ├── [id].jsx              # Tienda individual
│   │   └── categories.jsx        # Categorías de productos
│   ├── orders/
│   │   ├── index.jsx             # Pedidos activos
│   │   ├── [id].jsx              # Detalle de pedido
│   │   └── history.jsx           # Historial
│   ├── social/                   # Funciones tipo TikTok Shop
│   │   ├── feed.jsx              # Videos/posts con productos
│   │   ├── create-post.jsx       # Crear contenido (solo business)
│   │   └── [post-id].jsx         # Post individual
│   ├── profile/
│   │   ├── index.jsx
│   │   ├── edit.jsx
│   │   ├── addresses.jsx
│   │   ├── preferences.jsx
│   │   └── business-application.jsx # Solicitar ser negocio
│   ├── wallet/
│   │   ├── index.jsx
│   │   ├── add-funds.jsx
│   │   └── transactions.jsx
│   └── business/                 # Dashboard de negocio (condicional)
│       ├── index.jsx             # Dashboard principal
│       ├── products/
│       │   ├── index.jsx         # Gestión de productos
│       │   ├── add.jsx
│       │   └── [id]/edit.jsx
│       ├── posts/                # Contenido social
│       │   ├── index.jsx
│       │   ├── create.jsx
│       │   └── analytics.jsx
│       ├── orders/
│       │   ├── pending.jsx
│       │   ├── active.jsx
│       │   └── history.jsx
│       ├── analytics/
│       │   ├── sales.jsx
│       │   ├── customers.jsx
│       │   └── content.jsx
│       └── settings/
│           ├── store-info.jsx
│           ├── employees.jsx
│           └── branches.jsx
├── +html.jsx                     # HTML template
├── +not-found.jsx               # 404 page  
└── _layout.jsx                  # Root layout con providers

features/                         # Funcionalidades por dominio
├── auth/                         # Autenticación y registro
│   ├── components/
│   │   ├── login-form.jsx
│   │   ├── register-form.jsx
│   │   └── onboarding-flow.jsx
│   ├── hooks/
│   │   ├── use-auth.js
│   │   └── use-onboarding.js
│   ├── queries/
│   │   ├── auth-query-keys.js    # TanStack Query keys
│   │   └── use-auth-queries.js   # Auth queries y mutations
│   ├── services/
│   │   ├── auth-api.js
│   │   └── social-auth.js
│   ├── stores/
│   │   └── auth-store.js
│   └── schemas/
│       ├── login-schema.js
│       └── register-schema.js
├── user/                         # Gestión unificada de usuarios
│   ├── components/
│   ├── hooks/
│   │   ├── use-user-role.js
│   │   └── use-business-upgrade.js
│   ├── queries/
│   │   ├── user-query-keys.js    # TanStack Query keys
│   │   └── use-user-queries.js   # User queries y mutations
│   ├── services/
│   ├── stores/
│   │   ├── user-store.js
│   │   └── role-store.js
│   └── schemas/
├── social-commerce/              # TikTok Shop functionality
│   ├── components/
│   │   ├── video-post.jsx
│   │   ├── product-carousel.jsx
│   │   └── social-feed.jsx
│   ├── hooks/
│   │   ├── use-feed.js
│   │   └── use-posts.js
│   ├── services/
│   │   ├── content-api.js
│   │   └── media-upload.js
│   └── stores/
│       ├── feed-store.js
│       └── content-store.js
├── stores/                       # Gestión de tiendas/negocios
│   ├── components/
│   │   ├── store-card.jsx
│   │   ├── store-profile.jsx
│   │   └── store-hours.jsx
│   ├── hooks/
│   │   ├── use-stores.js
│   │   └── use-store-management.js
│   ├── services/
│   └── stores/
├── products/                     # Gestión de productos
│   ├── components/
│   │   ├── product-card.jsx
│   │   ├── product-form.jsx
│   │   └── product-gallery.jsx
│   ├── hooks/
│   │   ├── use-products.js
│   │   └── use-product-management.js
│   ├── services/
│   └── stores/
├── orders/                       # Gestión de órdenes
│   ├── components/
│   │   ├── order-card.jsx
│   │   ├── order-status.jsx
│   │   └── order-tracking.jsx
│   ├── hooks/
│   │   ├── use-orders.js
│   │   └── use-order-tracking.js
│   ├── services/
│   └── stores/
└── wallet/                       # Gestión de pagos/wallet
    ├── components/
    │   ├── wallet-balance.jsx
    │   ├── transaction-history.jsx
    │   └── payment-methods.jsx
    ├── hooks/
    ├── services/
    └── stores/

shared/                           # Código compartido entre features
├── components/                   # UI components reutilizables
│   └── ui/                       # Componentes básicos (Button, Input, etc.)
├── config/                       # Configuraciones globales
│   ├── firebase.js               # Setup de Firebase
│   ├── query-client.js           # Configuración de TanStack Query
│   ├── app-config.js             # Configuración de la app
│   └── storage-config.js         # Configuración de almacenamiento
├── services/                     # Servicios de acceso a datos
│   ├── base-service.js           # Clase base para servicios
│   ├── user-service.js           # Operaciones de usuarios
│   ├── business-service.js       # Operaciones de negocios
│   ├── product-service.js        # Operaciones de productos
│   ├── order-service.js          # Operaciones de órdenes
│   └── file-storage-service.js   # Manejo de archivos
├── hooks/                        # Custom hooks globales
│   ├── use-auth.js               # Hook de autenticación
│   ├── use-permissions.js        # Hook de permisos
│   └── use-media-picker.js       # Hook para selección de archivos
├── utils/                        # Utilidades globales
│   ├── constants.js              # Constantes de la app
│   ├── firebase-errors.js        # Traducción de errores
│   ├── cn.js                     # Utility función de clsx + tailwind-merge
│   └── validation.js             # Helpers de validación
├── stores/                       # Stores globales de Zustand
│   ├── auth-store.js             # Store de autenticación
│   └── app-store.js              # Store global de la app
└── types/                        # Tipos/interfaces globales (futuro TS)
```

## Diferencias Clave vs Estructura Tradicional

### ✅ Expo Router (File-based Routing)
- **Routing automático** basado en estructura de archivos
- **Mejor performance** con lazy loading
- **App unificada** sin separación artificial de modos  
- **Layouts anidados** para diferentes secciones
- **Navegación type-safe**

### ✅ Route Groups
- **(auth)**: Pantallas de autenticación con layout específico
- **(main)**: App principal con tabs dinámicos según rol de usuario
- **Conditional routing**: Business dashboard solo visible para business owners

### ✅ TikTok Shop Inspiration
- **Social commerce**: Videos/posts con productos integrados
- **Feed principal**: Contenido social mezclado con productos
- **Creator tools**: Solo business owners pueden crear contenido

## Convenciones de Nombres

### Archivos y Carpetas: kebab-case
```
login-form.jsx
business-application.jsx
store-info.jsx
```

### Componentes: PascalCase
```jsx
const LoginForm = () => { ... }
const BusinessApplication = () => { ... }
const StoreInfo = () => { ... }
```

### Hooks y Funciones: camelCase
```javascript
const useAuth = () => { ... }
const useBusinessUpgrade = () => { ... }
const getUserRole = () => { ... }
```

## Características de la Nueva Estructura

### ✅ Features por Dominio (Domain-Driven)
- **Separación clara** de responsabilidades
- **Escalabilidad** para equipos grandes
- **Reutilización** de código entre features

### ✅ Zustand para State Management
- **Stores distribuidos** por feature
- **Persistencia** con AsyncStorage
- **DevTools** para debugging

### ✅ File Storage Service
- **Servicio unificado** para archivos
- **Metadata objects** para mejor organización
- **Hook personalizado** para media picker

## Ejemplos de Implementación

### Expo Router Layout
```javascript
// app/_layout.jsx - Root layout
import { Slot, SplashScreen } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../shared/hooks/use-auth';

export default function RootLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
```

### Conditional Navigation
```javascript
// app/(main)/_layout.jsx - Tab navigation
import { Tabs } from 'expo-router';
import { useUserRole } from '../../features/user/hooks/use-user-role';

export default function MainLayout() {
  const { userRole } = useUserRole();

  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="social" options={{ title: 'Social' }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos' }} />
      
      {/* Conditional business tab */}
      {userRole === 'business' && (
        <Tabs.Screen name="business" options={{ title: 'Mi Negocio' }} />
      )}
      
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
```

### Feature Store Example
```javascript
// features/auth/stores/auth-store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
      
      // Business upgrade functionality
      upgradeToBusinessRole: async () => {
        const user = get().user;
        if (user) {
          const updatedUser = { ...user, role: 'business' };
          set({ user: updatedUser });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: AsyncStorage,
    }
  )
);
```

## Beneficios de Esta Estructura

### Para Desarrolladores:
- **Onboarding más rápido** con convenciones claras
- **Debugging simplificado** con mejor organización
- **Código más limpio** y mantenible
- **Features aisladas** reducen conflictos
- **Testing más fácil** con separación clara

### Para el Producto:
- **Mejor performance** con lazy loading
- **UX unificada** sin friction entre modos
- **Social commerce** moderno tipo TikTok Shop
- **Escalabilidad** para nuevas features
- **Mantenimiento** más simple a largo plazo

### Legacy Features Migrados:
- ❌ **Eliminado**: Separación artificial cliente/business apps
- ✅ **Unificado**: Single app con roles dinámicos
- ✅ **Mejorado**: Navigation con Expo Router
- ✅ **Agregado**: Social commerce functionality

## Implementación Práctica

### Stack Tecnológico Actualizado
- **Expo Router**: File-based routing con route groups
- **TanStack Query**: Server state management con cache inteligente y sincronización
- **Zustand**: Client state management distribuido por feature
- **TanStack Form + Zod**: Forms con validación robusta y type safety
- **NativeWind**: Styling con Tailwind CSS para React Native
- **Firebase**: Backend con colecciones optimizadas para app unificada

### Próximos Pasos
1. **Setup Expo Router**: Configurar routing con route groups
2. **TanStack Query**: Configurar queries y mutations por feature
3. **Feature stores**: Implementar Zustand stores para client state
4. **Social commerce**: Implementar funcionalidad tipo TikTok Shop
5. **Fresh implementation**: Plan de implementación desde cero

## Beneficios Clave

### ✅ **Performance**
- Lazy loading automático con Expo Router
- Bundle splitting por feature
- Optimizaciones de cache inteligentes

### ✅ **User Experience**
- App unificada sin friction
- Navegación fluida entre roles
- Social commerce integrado

### ✅ **Developer Experience**  
- File-based routing más intuitivo
- Hot reload mejorado
- Debugging simplificado

Esta estructura soporta el crecimiento de la app y facilita el trabajo en equipo.

---

## 📖 Navegación

**Anterior:** [Decisión Arquitectónica](../01-analisis/01-decision-arquitectonica.md) | **Siguiente:** [Stack Tecnológico](./02-stack-tecnologico.md)