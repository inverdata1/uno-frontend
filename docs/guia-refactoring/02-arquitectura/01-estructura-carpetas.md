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
├── auth/                         # Autenticación con Firebase Auth
│   ├── api/                      # TanStack Query hooks (con axios calls incluidos)
│   │   ├── use-user-profile.js   # getUserProfile() + useQuery hook
│   │   └── use-business-upgrade.js # upgradeAccount() + useMutation hook
│   ├── components/
│   │   ├── login-form.jsx        # Firebase Auth login
│   │   ├── register-form.jsx     # Firebase Auth register
│   │   └── social-login.jsx      # Google/Apple login
│   ├── hooks/
│   │   └── use-auth-state.js     # Firebase Auth state listener
│   └── schemas/
│       ├── login-schema.js       # Zod validation
│       └── register-schema.js
├── businesses/                   # Negocios/tiendas
│   ├── api/                      # TanStack Query hooks (con axios calls incluidos)
│   │   ├── use-get-businesses.js # getBusinesses() + useQuery hook
│   │   ├── use-create-business.js # createBusiness() + useMutation hook
│   │   └── use-update-business.js # updateBusiness() + useMutation hook
│   ├── components/
│   │   ├── business-card.jsx
│   │   ├── business-form.jsx
│   │   └── business-hours-form.jsx
│   └── schemas/
│       └── business-schema.js
├── products/                     # Productos
│   ├── api/                      # TanStack Query hooks (con axios calls incluidos)
│   │   ├── use-get-products.js   # getProducts() + useQuery hook
│   │   ├── use-create-product.js # createProduct() + useMutation hook
│   │   └── use-update-product.js # updateProduct() + useMutation hook
│   ├── components/
│   │   ├── product-card.jsx
│   │   ├── product-form.jsx
│   │   └── product-gallery.jsx
│   └── schemas/
│       └── product-schema.js
├── orders/                       # Órdenes/pedidos
│   ├── api/                      # TanStack Query hooks (con axios calls incluidos)
│   │   ├── use-get-orders.js     # getOrders() + useQuery hook
│   │   ├── use-create-order.js   # createOrder() + useMutation hook
│   │   └── use-update-order.js   # updateOrderStatus() + useMutation hook
│   ├── components/
│   │   ├── order-card.jsx
│   │   ├── order-status.jsx
│   │   └── cart.jsx
│   └── schemas/
│       └── order-schema.js
├── social/                       # Social commerce (TikTok Shop style)
│   ├── api/                      # TanStack Query hooks (con axios calls incluidos)
│   │   ├── use-get-feed.js       # getFeed() + useQuery hook
│   │   ├── use-create-post.js    # createPost() + useMutation hook
│   │   └── use-upload-media.js   # uploadMedia() + useMutation hook
│   ├── components/
│   │   ├── video-post.jsx
│   │   ├── social-feed.jsx
│   │   └── create-post-form.jsx
│   └── schemas/
│       └── post-schema.js
└── wallet/                       # Pagos y wallet
    ├── api/                      # TanStack Query hooks (con axios calls incluidos)
    │   ├── use-get-wallet.js     # getWallet() + useQuery hook
    │   └── use-process-payment.js # processPayment() + useMutation hook
    ├── components/
    │   ├── wallet-balance.jsx
    │   └── payment-form.jsx
    └── schemas/
        └── payment-schema.js

shared/                           # Código compartido
├── components/                   # UI components reutilizables
│   └── ui/                       # Componentes básicos (Button, Input, etc.)
├── config/                       # Configuraciones globales
│   ├── firebase-auth.js          # Firebase Auth setup (solo auth)
│   ├── api-client.js             # Axios instance con Firebase token interceptor
│   └── query-client.js           # TanStack Query config
├── hooks/                        # Custom hooks globales
│   ├── use-auth.js               # Firebase Auth hook
│   └── use-media-picker.js       # File picker hook
├── utils/                        # Utilidades globales
│   ├── constants.js              # Constantes de la app
│   ├── api-errors.js             # Traducción de errores HTTP
│   └── cn.js                     # clsx + tailwind-merge utility
├── stores/                       # Zustand stores (client state only)
│   └── app-store.js              # UI state global
└── types/                        # Tipos TypeScript (futuro)
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

### API Hook with Inline Fetch Function Example
```javascript
// features/auth/api/use-user-profile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';

// Simple fetch function inline
const getProfile = () => apiClient.get('/users/profile');

export const useProfile = () => useQuery({
  queryKey: ['users', 'profile'],
  queryFn: getProfile,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Another hook with inline fetch
const updateProfile = (data) => apiClient.put('/users/profile', data);

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
    }
  });
};
```

### Business Example
```javascript
// features/businesses/api/use-get-businesses.js
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/config/api-client';

// Simple fetch function inline
const getBusinesses = (filters) =>
  apiClient.get('/businesses', { params: filters });

export const useGetBusinesses = (filters) => useQuery({
  queryKey: ['businesses', filters],
  queryFn: () => getBusinesses(filters),
  staleTime: 2 * 60 * 1000, // 2 minutes
});
```

### Firebase Auth Hook Example
```javascript
// features/auth/hooks/use-auth-state.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../shared/config/firebase-auth';

export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
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
- **TanStack Query**: Server state management con cache inteligente
- **Firebase Auth**: Direct authentication (Google, Apple, Email)
- **FastAPI Backend**: Custom API layer for business logic
- **Profy.dev API Pattern**: Global fetch functions + feature hooks
- **Zustand**: Minimal client state management
- **TanStack Form + Zod**: Forms con validación robusta
- **NativeWind**: Styling con Tailwind CSS para React Native
- **Axios**: HTTP client con Firebase token interceptors

### Próximos Pasos
1. **Global API Layer**: Crear funciones fetch simples en `/api/`
2. **Firebase Auth Setup**: Configurar autenticación directa
3. **Feature API Hooks**: Implementar TanStack Query hooks por feature
4. **Expo Router**: Configurar routing con route groups
5. **Social commerce**: Implementar funcionalidad tipo TikTok Shop

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