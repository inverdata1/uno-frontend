# Reglas de Desarrollo - UNO Delivery

Este documento establece las reglas y mejores prácticas que todos los desarrolladores deben seguir al contribuir al proyecto UNO Delivery.

---

## 1. Reglas de Importación

### 1.1 Jerarquía de Dependencias

**SIEMPRE RESPETA ESTA JERARQUÍA:**

```
App Layer
    ↓ puede importar de
Core + Modules
    ↓ pueden importar de
Shared
    ↓ solo importa de
External Packages
```

### 1.2 Imports Permitidos

| Desde       | Puede importar de                    | NO puede importar de     |
|-------------|--------------------------------------|--------------------------|
| `app/`      | `core/`, `modules/`, `shared/`      | -                        |
| `core/`     | `shared/`                           | `modules/`, `app/`       |
| `modules/`  | `shared/`, otros `modules/` *       | `core/`, `app/`          |
| `shared/`   | External packages                    | `app/`, `core/`, `modules/` |

\* Imports entre módulos deben ser justificados y documentados

### 1.3 Orden de Imports

**SIEMPRE usa este orden:**

```javascript
// 1. React y React Native core
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. External packages
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// 3. Shared (comenzando por hooks, luego components)
import { useUserType } from '../../../shared/hooks';
import { Button, Card } from '../../../shared/components/ui';
import { theme } from '../../../shared/config/theme';

// 4. Core
import { useAuthStore } from '../../../core/auth/stores/auth-store';

// 5. Otros Modules (si es necesario)
import { useProducts } from '../../commerce/hooks/use-products';

// 6. Locales (mismo directorio o subdirectorios)
import { PostCard } from './components/post-card';
import { calculateScore } from './utils';
```

### 1.4 Rutas de Importación

- ✅ **USA:** Rutas relativas (`../../../shared/hooks`)
- ❌ **NO USES:** Aliases (`@/`, `~/`) - Expo Router tiene problemas con estos
- ✅ **USA:** Barrel imports cuando existan (`from '../../shared/components/ui'`)
- ❌ **NO USES:** Deep imports si hay barrel (`from '../../shared/components/ui/button'`)

---

## 2. Hooks de React Query

### 2.1 Ubicación

**Hooks de dominio SIEMPRE en su módulo:**

```
✅ CORRECTO:
modules/social/hooks/use-posts.js
modules/commerce/hooks/use-products.js

❌ INCORRECTO:
shared/hooks/use-posts.js  # Esto es específico de social!
```

**Hooks cross-domain en shared:**

```
✅ CORRECTO:
shared/hooks/use-user-type.js     # Usado por todos los módulos
shared/hooks/use-addresses.js     # Usado por client, business, delivery
```

### 2.2 Naming Convention

```javascript
// QUERIES (GET - leer datos)
usePost(id)                  // Singular - obtener uno
usePosts({ limit, filter })  // Plural - obtener lista
useFeaturedPosts()           // Descriptor - lista filtrada

// MUTATIONS (CREATE/UPDATE/DELETE)
useCreatePost()              // Crear
useUpdatePost()              // Actualizar
useDeletePost()              // Eliminar
useLikePost()                // Acción específica
```

### 2.3 Estructura de un Hook Query

```javascript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Obtiene la lista de posts del feed
 * @param {Object} options - Opciones de filtrado
 * @param {number} options.limit - Límite de posts
 * @returns {UseQueryResult} Query result con posts
 */
export const usePosts = ({ limit = 20 } = {}) => {
  return useQuery({
    // QueryKey debe ser descriptiva y unique
    queryKey: ['posts', 'feed', { limit }],

    // QueryFn siempre async
    queryFn: async () => {
      const response = await apiClient.get('/posts/feed', { limit });
      return response.data;
    },

    // Opciones de cache
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (antes era cacheTime)
  });
};
```

### 2.4 Estructura de un Hook Mutation

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api';

/**
 * Crea un nuevo post
 * @returns {UseMutationResult} Mutation result
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      const response = await apiClient.post('/posts', postData);
      return response.data;
    },

    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // O actualizar cache directamente (optimistic update)
      queryClient.setQueryData(['posts', data.id], data);

      console.log('✅ Post created:', data.id);
    },

    onError: (error) => {
      console.error('❌ Failed to create post:', error);
    },
  });
};
```

### 2.5 Barrel Exports

**SIEMPRE exporta todos los hooks desde `index.js`:**

```javascript
// modules/social/hooks/index.js
export * from './use-posts';
export * from './use-stories';
export * from './use-videos';
export * from './use-categories';
```

Esto permite:
```javascript
import { usePosts, useStories } from '../hooks';
```

---

## 3. Componentes

### 3.1 Ubicación de Componentes

```
✅ Componente reutilizable (usado en 2+ módulos):
shared/components/ui/product-card.jsx

✅ Componente de módulo (usado solo en social):
modules/social/feed/components/post-card.jsx

✅ Componente local (usado solo en una screen):
modules/social/feed/components/comment-section.jsx

❌ INCORRECTO - componente específico en shared:
shared/components/ui/post-card.jsx  # Esto es específico de social!
```

### 3.2 Estructura de un Componente

```javascript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta de producto con imagen, título y precio
 *
 * @param {Object} props - Props del componente
 * @param {Object} props.product - Datos del producto
 * @param {Function} props.onPress - Callback al presionar
 * @param {string} props.variant - Variante visual (default, compact)
 */
export const ProductCard = ({
  product,
  onPress,
  variant = 'default'
}) => {
  // Hooks primero
  const [isFavorite, setIsFavorite] = useState(false);

  // Event handlers
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Render helpers (optional)
  const renderPrice = () => (
    <Text style={styles.price}>${product.price}</Text>
  );

  // Main render
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        {/* Contenido del componente */}
      </View>
    </TouchableOpacity>
  );
};

// Styles al final
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 3.3 Props y PropTypes

**USA TypeScript o JSDoc para documentar props:**

```javascript
/**
 * @typedef {Object} ProductCardProps
 * @property {Object} product - Producto a mostrar
 * @property {Function} [onPress] - Callback opcional al presionar
 * @property {('default'|'compact')} [variant='default'] - Variante visual
 */

/**
 * @param {ProductCardProps} props
 */
export const ProductCard = ({ product, onPress, variant = 'default' }) => {
  // ...
};
```

---

## 4. Estilos

### 4.1 Prioridad de Estilos

1. **Primera opción:** NativeWind (Tailwind CSS)
2. **Segunda opción:** StyleSheet API
3. **Última opción:** Inline styles

### 4.2 Uso de NativeWind

```javascript
import { View, Text } from 'react-native';

// ✅ CORRECTO - usando NativeWind
export const Card = ({ children }) => (
  <View className="bg-white rounded-xl p-4 shadow-md">
    <Text className="text-lg font-semibold text-gray-900">
      {children}
    </Text>
  </View>
);
```

### 4.3 Uso de StyleSheet

**Cuando NativeWind no es suficiente:**

```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
  },
  gradient: {
    // Estilos complejos que NativeWind no soporta bien
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
});
```

### 4.4 NO Uses Inline Styles

```javascript
// ❌ MALO - inline styles difíciles de mantener
<View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12 }}>

// ✅ BUENO - NativeWind
<View className="p-4 bg-white rounded-xl">

// ✅ TAMBIÉN BUENO - StyleSheet
<View style={styles.card}>
```

---

## 5. Formularios

### 5.1 SIEMPRE Usa el Focus Manager

```javascript
import { useFocusManager } from '../../../shared/hooks';

export const LoginForm = () => {
  const { refs, focusNext, focusField } = useFocusManager(['email', 'password']);

  return (
    <View>
      <Input
        ref={refs.email}
        placeholder="Email"
        onSubmitEditing={() => focusNext('email')}
        returnKeyType="next"
      />
      <Input
        ref={refs.password}
        placeholder="Password"
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />
    </View>
  );
};
```

### 5.2 Validación con Zod

**Schemas en `shared/schemas/`:**

```javascript
// shared/schemas/auth/login-schema.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
```

**Uso en componente:**

```javascript
import { loginSchema } from '../../../shared/schemas/auth/login-schema';

const handleSubmit = async (data) => {
  try {
    const validated = loginSchema.parse(data);
    await login(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Manejar errores de validación
      console.error(error.errors);
    }
  }
};
```

---

## 6. API y Backend

### 6.1 SIEMPRE Usa apiClient

```javascript
// ✅ CORRECTO
import { apiClient } from '../../../shared/api';

const response = await apiClient.get('/posts', { limit: 20 });

// ❌ INCORRECTO - NO uses Firebase SDK directamente en components/hooks
import { getFirestore, collection, getDocs } from 'firebase/firestore';
```

### 6.2 Estructura de Recursos API

**Cada recurso debe tener esta estructura:**

```
shared/api/{resource}/
├── resource.js        # Clase del recurso (endpoints)
├── collection.js      # Colección de datos iniciales
└── seeder.js          # Funciones para seed de datos
```

**Ejemplo de resource.js:**

```javascript
import { BaseFirebaseService } from '../base-firebase-service';

export class PostsResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'posts'); // Nombre de la colección
  }

  /**
   * GET /posts/feed
   */
  async get_feed(data, params) {
    const { limit = 20 } = params;
    return await this.findAll({}, {
      orderBy: 'createdAt',
      order: 'desc',
      limit
    });
  }

  /**
   * POST /posts
   */
  async post_index(data, params) {
    return await this.create(data);
  }
}
```

### 6.3 Registro de Recursos

**SIEMPRE registra en `shared/api/index.js`:**

```javascript
import { PostsResource } from './posts/resource';

firebaseClient.registerResource('posts', PostsResource);
```

---

## 7. Estado Global (Zustand)

### 7.1 Cuándo Usar Zustand

**USA Zustand para:**
- Estado de autenticación (usuario actual)
- Configuración de app (tema, idioma)
- Estado UI global (modales, notifications)

**NO USES Zustand para:**
- Datos del servidor (usa React Query)
- Estado local de componente (usa useState)
- Estado derivado (usa useMemo)

### 7.2 Estructura de un Store

```javascript
// core/auth/stores/auth-store.js
import { create } from 'zustand';
import { authService } from '../services/auth-service';

export const useAuthStore = create((set, get) => ({
  // Estado
  user: null,
  isLoading: true,

  // Acciones
  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.signIn(email, password);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null });
  },

  // Selectores (optional)
  isAuthenticated: () => !!get().user,
}));
```

### 7.3 Uso del Store

```javascript
import { useAuthStore } from '../../../core/auth/stores/auth-store';

export const ProfileScreen = () => {
  // ✅ CORRECTO - suscribirse solo a lo necesario
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  // ❌ MALO - suscribirse a todo el store
  const { user, signOut, isLoading } = useAuthStore();
};
```

---

## 8. Nomenclatura

### 8.1 Archivos

| Tipo                | Convención            | Ejemplo                    |
|---------------------|-----------------------|----------------------------|
| Componente          | kebab-case.jsx        | `product-card.jsx`         |
| Hook                | use-{nombre}.js       | `use-products.js`          |
| Service             | {nombre}-service.js   | `auth-service.js`          |
| Store               | {nombre}-store.js     | `auth-store.js`            |
| Util                | {nombre}.js           | `address-helpers.js`       |
| Schema              | {nombre}-schema.js    | `login-schema.js`          |
| Screen              | index.jsx             | `feed/index.jsx`           |

### 8.2 Variables y Funciones

```javascript
// ✅ CORRECTO
const userName = 'John';
const fetchUserData = async () => {};
const isLoading = false;

// ❌ INCORRECTO
const user_name = 'John';  // snake_case
const FetchUserData = () => {};  // PascalCase para función
const loading = false;  // falta prefijo is/has
```

### 8.3 Componentes

```javascript
// ✅ CORRECTO - PascalCase
export const ProductCard = () => {};
export const UserProfile = () => {};

// ❌ INCORRECTO
export const productCard = () => {};  // camelCase
export const product_card = () => {};  // snake_case
```

### 8.4 Constantes

```javascript
// ✅ CORRECTO - UPPER_SNAKE_CASE para constantes globales
export const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
export const API_BASE_URL = 'https://api.example.com';

// ✅ TAMBIÉN CORRECTO - camelCase para constantes locales
const defaultLimit = 20;
const colors = ['red', 'blue', 'green'];
```

---

## 9. Control de Versiones (Git)

### 9.1 Commits

**Formato:**
```
<tipo>: <descripción corta>

<descripción detallada opcional>
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambio de funcionalidad
- `docs:` Cambios en documentación
- `style:` Cambios de formato (espacios, comas, etc.)
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

**Ejemplos:**
```
feat: add user profile screen
fix: resolve login form validation error
refactor: migrate mode to userType terminology
docs: update architecture documentation
```

### 9.2 Branches

**Nomenclatura:**
```
<tipo>/<descripción-corta>
```

**Ejemplos:**
```
feature/add-payment-screen
fix/login-validation
refactor/migrate-to-usertype
hotfix/crash-on-startup
```

### 9.3 Pull Requests

**Título:** Mismo formato que commits

**Descripción debe incluir:**
1. ¿Qué cambia este PR?
2. ¿Por qué es necesario?
3. ¿Cómo se probó?
4. Screenshots (si aplica)

---

## 10. Testing (Futuro)

### 10.1 Qué Testear

**Prioridad 1:**
- Hooks de React Query
- Funciones utilitarias puras
- Servicios críticos (auth-service)

**Prioridad 2:**
- Componentes compartidos (UI components)
- Formularios complejos
- Validaciones (schemas)

**Prioridad 3:**
- Screens completas
- Flujos end-to-end

### 10.2 Ubicación de Tests

```
modules/social/hooks/
├── use-posts.js
└── use-posts.test.js

shared/utils/
├── address-helpers.js
└── address-helpers.test.js
```

---

## 11. Performance

### 11.1 React Query Cache

```javascript
// ✅ BUENA práctica - configurar staleTime
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000,  // 5 minutos
});

// ❌ MALA práctica - sin staleTime (refetch constante)
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});
```

### 11.2 Memoization

```javascript
import { useMemo, useCallback } from 'react';

// ✅ Memoizar cálculos costosos
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);

// ✅ Memoizar callbacks
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 11.3 FlatList Optimization

```javascript
// ✅ CORRECTO
<FlatList
  data={posts}
  renderItem={renderPost}
  keyExtractor={(item) => item.id}
  // Optimizaciones importantes
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## 12. Seguridad

### 12.1 NO Commitear Secrets

```javascript
// ❌ NUNCA hagas esto
const API_KEY = 'sk_live_abc123...';

// ✅ Usa variables de entorno
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.apiKey;
```

### 12.2 Validación de Inputs

```javascript
// ✅ SIEMPRE valida inputs del usuario
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

const result = schema.safeParse(userInput);
if (!result.success) {
  // Manejar error
}
```

---

## 13. Accesibilidad

### 13.1 SIEMPRE Usa accessible Props

```javascript
// ✅ CORRECTO
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Agregar al carrito"
  accessibilityHint="Presiona para agregar este producto al carrito"
  accessibilityRole="button"
>
  <Text>Agregar</Text>
</TouchableOpacity>
```

---

## 14. Emojis en UI

### 14.1 NO Uses Emojis

```javascript
// ❌ NUNCA uses emojis en UI de usuario
<Text>Pedido completado ✅</Text>

// ✅ USA iconos de libraries
<Ionicons name="checkmark-circle" size={20} color="green" />
<Text>Pedido completado</Text>
```

**EXCEPCIÓN:** Emojis están permitidos en:
- Console logs (`console.log('✅ Success')`)
- Comentarios de desarrollo
- Documentación

---

## Resumen de Reglas Críticas

1. ✅ Respeta la jerarquía de dependencias (App → Core/Modules → Shared)
2. ✅ SIEMPRE usa apiClient, nunca Firebase SDK directamente
3. ✅ Hooks de dominio en `modules/{domain}/hooks/`
4. ✅ Hooks cross-domain en `shared/hooks/`
5. ✅ Usa NativeWind como primera opción para estilos
6. ✅ Usa Focus Manager para todos los formularios
7. ✅ NO uses emojis en UI de usuario
8. ✅ SIEMPRE documenta con JSDoc
9. ✅ Commits descriptivos siguiendo el formato establecido
10. ✅ NO commitear secrets o API keys

---

**Última actualización:** 2025-01-22
