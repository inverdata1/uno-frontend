# Estructura de Carpetas - Arquitectura Feature-Based

## Visión General

La nueva estructura organiza el código por **funcionalidad** (features) en lugar de por **tipo de archivo**. Esto facilita encontrar código relacionado, escala mejor con equipos y reduce coupling entre features.

## Estructura Completa

```
src/
├── app/                          # App entry point y configuración global
│   ├── App.jsx                   # Componente raíz con providers
│   └── app.config.js             # Configuración de Expo
├── shared/                       # Código compartido entre features
│   ├── components/               # UI components reutilizables
│   │   └── ui/                   # Componentes básicos (Button, Input, etc.)
│   ├── config/                   # Configuraciones globales
│   │   ├── firebase.js           # Setup de Firebase
│   │   └── query-client.js       # Setup de TanStack Query
│   ├── services/                 # Servicios de acceso a datos
│   │   ├── base-service.js       # Clase base para servicios
│   │   ├── user-service.js       # Operaciones de usuarios
│   │   ├── business-service.js   # Operaciones de negocios
│   │   ├── product-service.js    # Operaciones de productos
│   │   ├── order-service.js      # Operaciones de órdenes
│   │   └── file-storage-service.js # Manejo de archivos
│   ├── hooks/                    # Custom hooks globales
│   │   ├── use-auth.js           # Hook de autenticación
│   │   └── use-permissions.js    # Hook de permisos
│   ├── utils/                    # Utilidades globales
│   │   ├── constants.js          # Constantes de la app
│   │   ├── firebase-errors.js    # Traducción de errores
│   │   └── validation.js         # Helpers de validación
│   ├── queries/                  # Queries cross-feature
│   │   ├── storage-query-keys.js # Query keys para storage
│   │   └── use-storage-queries.js # Hooks de storage
│   └── types/                    # Tipos/interfaces globales (futuro TS)
├── features/                     # Features organizados por dominio
│   ├── auth/                     # Autenticación y registro
│   │   ├── components/           # Componentes específicos de auth
│   │   │   ├── login-form.jsx    # Formulario de login
│   │   │   ├── register-form.jsx # Formulario de registro
│   │   │   └── auth-guard.jsx    # Componente de protección de rutas
│   │   ├── screens/              # Screens de autenticación
│   │   │   ├── login-screen.jsx  # Pantalla de login
│   │   │   ├── register-screen.jsx # Pantalla de registro
│   │   │   └── forgot-password-screen.jsx # Recuperar contraseña
│   │   ├── queries/              # TanStack Query para auth
│   │   │   ├── user-query-keys.js # Query keys de usuario
│   │   │   └── use-user-queries.js # Hooks de usuario
│   │   └── utils/                # Utilidades específicas de auth
│   │       └── validation.js     # Validaciones de auth
│   ├── home/                     # Pantalla principal y navegación
│   │   ├── components/           # Componentes del home
│   │   │   ├── welcome-banner.jsx # Banner de bienvenida
│   │   │   ├── quick-actions.jsx  # Acciones rápidas
│   │   │   └── recent-orders.jsx  # Órdenes recientes
│   │   ├── screens/              # Screens del home
│   │   │   └── home-screen.jsx   # Pantalla principal
│   │   └── queries/              # Queries del home
│   │       └── use-home-queries.js # Data del dashboard
│   ├── business/                 # Gestión de negocios
│   │   ├── components/           # Componentes de business
│   │   │   ├── business-card.jsx # Card de negocio
│   │   │   ├── business-form.jsx # Formulario de negocio
│   │   │   └── business-hours.jsx # Horarios de atención
│   │   ├── screens/              # Screens de business
│   │   │   ├── business-list-screen.jsx # Lista de negocios
│   │   │   ├── business-detail-screen.jsx # Detalle de negocio
│   │   │   ├── business-dashboard-screen.jsx # Dashboard del owner
│   │   │   └── business-application-screen.jsx # Aplicación para ser business
│   │   ├── queries/              # Queries de business
│   │   │   ├── business-query-keys.js # Query keys de negocios
│   │   │   └── use-business-queries.js # Hooks de negocios
│   │   └── utils/                # Utilidades de business
│   │       └── business-helpers.js # Helpers específicos
│   ├── products/                 # Gestión de productos
│   │   ├── components/           # Componentes de productos
│   │   │   ├── product-card.jsx  # Card de producto
│   │   │   ├── product-form.jsx  # Formulario de producto
│   │   │   ├── product-gallery.jsx # Galería de imágenes
│   │   │   └── product-search.jsx # Búsqueda de productos
│   │   ├── screens/              # Screens de productos
│   │   │   ├── product-list-screen.jsx # Lista de productos
│   │   │   ├── product-detail-screen.jsx # Detalle de producto
│   │   │   └── product-management-screen.jsx # Gestión de productos
│   │   ├── queries/              # Queries de productos
│   │   │   ├── product-query-keys.js # Query keys de productos
│   │   │   └── use-product-queries.js # Hooks de productos
│   │   └── utils/                # Utilidades de productos
│   │       └── product-helpers.js # Helpers de productos
│   ├── orders/                   # Gestión de órdenes
│   │   ├── components/           # Componentes de órdenes
│   │   │   ├── order-card.jsx    # Card de orden
│   │   │   ├── order-form.jsx    # Formulario de orden
│   │   │   ├── order-status.jsx  # Estado de orden
│   │   │   └── order-tracking.jsx # Seguimiento de orden
│   │   ├── screens/              # Screens de órdenes
│   │   │   ├── order-list-screen.jsx # Lista de órdenes
│   │   │   ├── order-detail-screen.jsx # Detalle de orden
│   │   │   ├── checkout-screen.jsx # Proceso de compra
│   │   │   └── order-history-screen.jsx # Historial de órdenes
│   │   ├── queries/              # Queries de órdenes
│   │   │   ├── order-query-keys.js # Query keys de órdenes
│   │   │   └── use-order-queries.js # Hooks de órdenes
│   │   └── utils/                # Utilidades de órdenes
│   │       └── order-helpers.js  # Helpers de órdenes
│   ├── social/                   # Features sociales (futuro)
│   │   ├── components/           # Componentes sociales
│   │   │   ├── post-card.jsx     # Card de post
│   │   │   ├── post-form.jsx     # Formulario de post
│   │   │   └── social-feed.jsx   # Feed social
│   │   ├── screens/              # Screens sociales
│   │   │   ├── social-feed-screen.jsx # Feed principal
│   │   │   └── create-post-screen.jsx # Crear post
│   │   ├── queries/              # Queries sociales
│   │   │   ├── social-query-keys.js # Query keys sociales
│   │   │   └── use-social-queries.js # Hooks sociales
│   │   └── utils/                # Utilidades sociales
│   │       └── social-helpers.js # Helpers sociales
│   └── profile/                  # Gestión del perfil
│       ├── components/           # Componentes del perfil
│       │   ├── profile-form.jsx  # Formulario de perfil
│       │   ├── avatar-picker.jsx # Selector de avatar
│       │   └── settings-list.jsx # Lista de configuraciones
│       ├── screens/              # Screens del perfil
│       │   ├── profile-screen.jsx # Pantalla de perfil
│       │   ├── edit-profile-screen.jsx # Editar perfil
│       │   └── settings-screen.jsx # Configuraciones
│       └── queries/              # Queries del perfil
│           └── use-profile-queries.js # Hooks del perfil (usa user-queries)
└── navigation/                   # Navegación global
    ├── app-navigator.jsx         # Navegación principal
    ├── tab-navigator.jsx         # Navegación por tabs
    ├── stack-navigator.jsx       # Stack navigation
    └── navigation-types.js       # Tipos de navegación
```

## Convenciones de Nombres

### Archivos y Carpetas
- **kebab-case**: `business-card.jsx`, `user-service.js`
- **Carpetas**: Singular para utilidades (`util`, `config`), plural para colecciones (`components`, `screens`, `queries`)
- **Screens**: Siempre terminan en `-screen.jsx`
- **Components**: Descriptivos, terminan en `.jsx`
- **Services**: Terminan en `-service.js`
- **Utils**: Terminan en `-helpers.js` o función específica

### Imports y Exports
- **Default export**: Para componentes principales
- **Named exports**: Para utilidades y helpers
- **Index files**: Solo cuando simplifican imports significativamente

```javascript
// ✅ Buenos imports
import LoginScreen from '../screens/login-screen';
import { validateEmail } from '../utils/validation';
import { useUser } from '../queries/use-user-queries';

// ❌ Evitar
import LoginScreen from '../screens/LoginScreen'; // PascalCase en archivos
import * as UserQueries from '../queries'; // Import masivo
```

## Reglas por Tipo de Carpeta

### `/shared`
**Propósito**: Código reutilizable entre múltiples features

**Reglas**:
- No puede importar de `/features`
- Debe ser genérico y reutilizable
- Cambios aquí afectan toda la app

**Qué incluir**:
- UI components básicos (Button, Input, Card)
- Servicios de datos (Firebase, API calls)
- Configuraciones globales
- Hooks de propósito general

### `/features/[feature-name]`
**Propósito**: Código específico de una funcionalidad

**Reglas**:
- Puede importar de `/shared`
- Puede importar de otras features SOLO para tipos/interfaces
- Debe ser independiente y cohesivo

**Estructura obligatoria**:
- `/components` - Componentes específicos del feature
- `/screens` - Pantallas del feature
- `/queries` - TanStack Query hooks y keys
- `/utils` (opcional) - Utilidades específicas

### `/components`
**Propósito**: Componentes React reutilizables

**Reglas**:
- Un componente por archivo
- Default export del componente principal
- Props documentadas con PropTypes o comentarios
- Componente debe ser puro cuando sea posible

```javascript
// features/auth/components/login-form.jsx
import React from 'react';
import { Button, Input } from '../../../shared/components/ui';

const LoginForm = ({ onSubmit, loading = false }) => {
  // Implementación
  return (
    {/* JSX */}
  );
};

export default LoginForm;
```

### `/screens`
**Propósito**: Pantallas completas de la aplicación

**Reglas**:
- Una screen por archivo
- Manejo de navegación y parámetros
- Composición de múltiples componentes
- Conexión con queries/mutations

```javascript
// features/auth/screens/login-screen.jsx
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import LoginForm from '../components/login-form';
import { useLoginUser } from '../queries/use-user-queries';

const LoginScreen = () => {
  const navigation = useNavigation();
  const loginMutation = useLoginUser();
  
  // Implementación
  return (
    <LoginForm onSubmit={loginMutation.mutate} />
  );
};

export default LoginScreen;
```

### `/queries`
**Propósito**: TanStack Query hooks y query keys

**Reglas**:
- Query keys en archivo separado `-query-keys.js`
- Hooks en archivo `-queries.js`
- Un hook por operación (useUser, useUpdateUser, etc.)

```javascript
// features/auth/queries/user-query-keys.js
export const userQueryKeys = {
  all: ['users'],
  detail: (id) => [...userQueryKeys.all, 'detail', id],
};

// features/auth/queries/use-user-queries.js
import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../../shared/services/user-service';
import { userQueryKeys } from './user-query-keys';

export const useUser = (userId) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => UserService.getUser(userId),
    enabled: !!userId,
  });
};
```

### `/services`
**Propósito**: Acceso a datos (Firebase, APIs)

**Reglas**:
- Un service por entidad/dominio
- Solo operaciones de datos, sin lógica de UI
- Métodos estáticos para operaciones simples
- Error handling consistente

```javascript
// shared/services/user-service.js
import { BaseService } from './base-service';

export class UserService extends BaseService {
  static async getUser(uid) {
    return this.getDocument('Users', uid);
  }
  
  static async updateUser(uid, updates) {
    return this.updateDocument('Users', uid, updates);
  }
}
```

## Agregar Nueva Feature

### 1. Crear Estructura
```bash
mkdir -p features/nueva-feature/{components,screens,queries,utils}
```

### 2. Archivos Obligatorios
- `queries/nueva-feature-query-keys.js` - Query keys
- `queries/use-nueva-feature-queries.js` - Hooks de TanStack Query
- `components/index.js` - Exports de componentes principales
- `screens/index.js` - Exports de screens

### 3. Service Layer (si necesario)
- `shared/services/nueva-feature-service.js` - Operaciones de datos

### 4. Navegación
- Agregar rutas en `navigation/app-navigator.jsx`
- Definir tipos en `navigation/navigation-types.js`

### 5. Testing
- `__tests__/` en cada subcarpeta para tests específicos

## Beneficios de Esta Estructura

### ✅ **Escalabilidad**
- Cada feature es independiente
- Equipos pueden trabajar en paralelo
- Fácil agregar/remover features

### ✅ **Mantenibilidad**
- Código relacionado está junto
- Cambios están localizados
- Dependencias claras

### ✅ **Reutilización**
- `/shared` contiene código común
- Componentes son modulares
- Patrones consistentes

### ✅ **Testing**
- Features se pueden testear independientemente
- Mocking más fácil
- Tests más focalizados

Esta estructura soporta el crecimiento de la app y facilita el trabajo en equipo.

---

## 📖 Navegación

**Anterior:** [Decisión Arquitectónica](../01-analisis/decision-arquitectonica.md) | **Siguiente:** [Stack Tecnológico](./stack-tecnologico.md)