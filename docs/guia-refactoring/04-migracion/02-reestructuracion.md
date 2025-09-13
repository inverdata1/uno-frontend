# Fase 2: Estructura Base

## Objetivo

Implementar la estructura de carpetas feature-based completa desde cero. Crear todos los directorios y archivos base necesarios para la nueva arquitectura con Expo Router.

## Prerrequisitos

- [ ] Fase 1 completada (proyecto Expo limpio)
- [ ] App mostrando "Fresh Start" sin errores
- [ ] Dependencias instaladas correctamente
- [ ] Branch `feature/fresh-implementation` activo

## Estrategia de Implementación

### Enfoque Clean Slate
1. **Estructura completa**: Crear toda la arquitectura de una vez
2. **Expo Router**: Implementar file-based routing desde el inicio
3. **Feature-based**: Organización por dominio desde día 1
4. **Best practices**: Seguir convenciones modernas desde el principio

## Paso 1: Crear Estructura de Carpetas Completa

### Crear estructura app/ (Expo Router)
```bash
# Crear estructura principal de Expo Router
mkdir -p app/{(auth),(main)/{business,orders,profile,social,stores,wallet}}

# Crear layouts
touch app/_layout.jsx
touch app/(auth)/_layout.jsx
touch app/(main)/_layout.jsx

# Crear pantallas de auth
touch app/(auth)/{onboarding,login,register,reset-password}.jsx

# Crear pantallas principales
touch app/(main)/{home,search}.jsx
touch app/(main)/profile/{index,edit,addresses,preferences,business-application}.jsx
touch app/(main)/orders/{index,history}.jsx
touch app/(main)/social/{feed,create-post}.jsx
touch app/(main)/stores/{index,categories}.jsx
touch app/(main)/wallet/{index,add-funds,transactions}.jsx

# Crear dashboard business (condicional)
mkdir -p app/(main)/business/{products,orders,analytics,posts,settings}
touch app/(main)/business/index.jsx
touch app/(main)/business/products/{index,add}.jsx
touch app/(main)/business/orders/{pending,active,history}.jsx
touch app/(main)/business/analytics/{sales,customers,content}.jsx
touch app/(main)/business/posts/{index,create,analytics}.jsx
touch app/(main)/business/settings/{store-info,employees,branches}.jsx

# Archivos especiales de Expo Router
touch app/{+html.jsx,+not-found.jsx}
```

### Crear estructura features/
```bash
# Crear features por dominio
mkdir -p features/{auth,user,social-commerce,stores,products,orders,wallet}/{components,hooks,services,stores,schemas}

# Crear archivos index para exportaciones
touch features/{auth,user,social-commerce,stores,products,orders,wallet}/index.js
```

## Paso 2: Crear Estructura shared/

### Crear toda la estructura shared desde cero
```bash
# Crear estructura shared completa
mkdir -p shared/{components/ui,config,services,hooks,utils,stores,types}

# Crear archivos de configuración
touch shared/config/{firebase.js,query-client.js,app-config.js,storage-config.js}

# Crear servicios nuevos
touch shared/services/{base-service.js,user-service.js,business-service.js,product-service.js,order-service.js,file-storage-service.js}

# Crear hooks globales
touch shared/hooks/{use-auth.js,use-permissions.js,use-media-picker.js}

# Crear utilidades nuevas
touch shared/utils/{constants.js,firebase-errors.js,cn.js,validation.js}

# Crear stores con Zustand
touch shared/stores/{auth-store.js,app-store.js}

# Crear componentes UI desde cero
mkdir -p shared/components/ui
touch shared/components/ui/{button.jsx,input.jsx,loading-spinner.jsx,index.js}
```

## Paso 3: Implementar Archivos Base Iniciales

### Implementar shared/utils/cn.js
```javascript
// shared/utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Implementar shared/utils/constants.js
```javascript
// shared/utils/constants.js
export const APP_CONFIG = {
  name: 'Uno Delivery',
  version: '2.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

export const QUERY_STALE_TIME = {
  SHORT: 30 * 1000,      // 30 segundos
  MEDIUM: 2 * 60 * 1000,  // 2 minutos  
  LONG: 5 * 60 * 1000,    // 5 minutos
  VERY_LONG: 10 * 60 * 1000, // 10 minutos
};

export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,   // 1 minuto
  MEDIUM: 5 * 60 * 1000,  // 5 minutos
  LONG: 10 * 60 * 1000,   // 10 minutos
  VERY_LONG: 30 * 60 * 1000, // 30 minutos
};
```

### Implementar shared/config/query-client.js
```javascript
// shared/config/query-client.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error) => {
        if (error?.code === 'permission-denied') return false;
        if (error?.code === 'not-found') return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### Implementar BaseService
```javascript
// shared/services/base-service.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export class BaseService {
  /**
   * Obtener un documento por ID
   */
  static async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documentos con query
   */
  static async queryDocuments(collectionName, queryConstraints = []) {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crear documento
   */
  static async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar documento
   */
  static async updateDocument(collectionName, docId, updates) {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateData);
      return { id: docId, ...updates };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   */
  static async deleteDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return docId;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  static subscribeToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    });
  }
}
```

### Implementar servicios desde cero

#### UserService
```javascript
// shared/services/user-service.js
import { BaseService } from './base-service';
import { where, orderBy } from 'firebase/firestore';

export class UserService extends BaseService {
  static collectionName = 'Users';

  static async getUser(uid) {
    return this.getDocument(this.collectionName, uid);
  }

  static async updateUser(uid, updates) {
    return this.updateDocument(this.collectionName, uid, updates);
  }

  static async createUser(userData) {
    return this.createDocument(this.collectionName, userData);
  }

  static async getUsersByRole(role) {
    return this.queryDocuments(this.collectionName, [
      where('role', '==', role),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    ]);
  }

  static async upgradeToBusinessRole(uid, businessData) {
    const updates = {
      userRole: 'business',
      businessProfile: {
        applicationStatus: 'pending',
        appliedAt: new Date().toISOString(),
        ...businessData
      }
    };
    return this.updateUser(uid, updates);
  }

  static subscribeToUser(uid, callback) {
    return this.subscribeToDocument(this.collectionName, uid, callback);
  }
}
```

## Paso 4: Implementar Componentes UI Base

### Crear componentes UI desde cero
Vamos a construir un sistema de componentes limpio con NativeWind.

### Button Component
```javascript
// shared/components/ui/button.jsx
import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cn } from '../../utils/cn';

const Button = ({ 
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  onPress,
  className,
  ...props 
}) => {
  const baseClasses = 'items-center justify-center rounded-lg';
  
  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-200 active:bg-secondary-300',
    outline: 'border border-primary-600 bg-transparent',
    ghost: 'bg-transparent',
  };

  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-secondary-800',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? 'white' : '#3b82f6'} 
        />
      ) : (
        <Text className={cn(
          'font-semibold',
          textColorClasses[variant]
        )}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
```

### Input Component
```javascript
// shared/components/ui/input.jsx
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { cn } from '../../utils/cn';

const Input = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'border border-gray-300 rounded-lg px-3 py-2 text-gray-900',
          'focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
          error && 'border-red-500',
          className
        )}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-600 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
```

### Loading Spinner
```javascript
// shared/components/ui/loading-spinner.jsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'large', 
  text = 'Cargando...', 
  className 
}) => {
  return (
    <View className={cn('flex-1 justify-center items-center', className)}>
      <ActivityIndicator size={size} color="#3b82f6" />
      {text && (
        <Text className="text-gray-600 mt-2 text-center">
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;
```

### Actualizar index.js
```javascript
// shared/components/ui/index.js
export { default as Button } from './button';
export { default as Input } from './input';
export { default as LoadingSpinner } from './loading-spinner';
```

## Paso 4: Migrar Feature Auth

### Crear estructura Auth
```bash
mkdir -p src/features/auth/{components,screens,queries,utils}
```

### Migrar LoginForm
```javascript
// features/auth/components/login-form.jsx
import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../../shared/components/ui';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const LoginForm = ({ onSubmit, loading = false }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <View className="space-y-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            placeholder="tu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Contraseña"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            placeholder="••••••••"
            secureTextEntry
          />
        )}
      />
      
      <Button
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        className="mt-6"
      >
        Iniciar Sesión
      </Button>
    </View>
  );
};

export default LoginForm;
```

### Crear query keys
```javascript
// features/auth/queries/user-query-keys.js
export const userQueryKeys = {
  all: ['users'],
  lists: () => [...userQueryKeys.all, 'list'],
  list: (filters) => [...userQueryKeys.lists(), { filters }],
  details: () => [...userQueryKeys.all, 'detail'],
  detail: (id) => [...userQueryKeys.details(), id],
  profile: (id) => [...userQueryKeys.detail(id), 'profile'],
};
```

### Crear bridge temporal
```javascript
// features/auth/components/login-form-bridge.jsx
// Bridge temporal para mantener el código anterior funcionando

import React from 'react';
import LoginForm from './login-form';

// Component wrapper que mantiene la API anterior
const LoginFormBridge = (props) => {
  return <LoginForm {...props} />;
};

// Exportar también con el nombre anterior si es necesario
export { LoginFormBridge as OldLoginForm };
export default LoginForm;
```

## Paso 5: Actualizar Imports Gradualmente

### Estrategia de imports duales
```javascript
// En archivos que usan los componentes migrados:

// ANTES:
// import LoginForm from '../components/LoginForm';

// DURANTE LA MIGRACIÓN (bridge):
import LoginForm from '../features/auth/components/login-form-bridge';

// DESPUÉS (cuando todo esté migrado):
// import LoginForm from '../features/auth/components/login-form';
```

### Crear alias temporales
```javascript
// shared/components/index.js - Bridge temporal
// Re-exportar componentes nuevos con nombres anteriores

export { default as LoginForm } from '../features/auth/components/login-form';
export { default as BusinessCard } from '../features/business/components/business-card';
// ... otros componentes

// Esto permite imports como:
// import { LoginForm } from '../shared/components';
```

## Paso 6: Testing de Migración Parcial

### Verificar que nada se rompió
```bash
# Ejecutar tests existentes
npm test

# Ejecutar la app
npm start

# Verificar funcionalidades clave:
# - Login/logout
# - Navegación básica  
# - Operaciones CRUD básicas
```

### Testing manual
- [ ] App inicia sin errores
- [ ] Login funciona normalmente
- [ ] Navegación funciona normalmente
- [ ] No hay warnings de imports faltantes
- [ ] DevTools muestran queries (si ya hay algunas)

## Paso 7: Documentar Cambios

### Actualizar README de migración
```markdown
# Estado de Migración

## Completado ✅
- Servicios base migrados
- Componentes UI básicos
- Auth components migrados
- Estructura de carpetas creada

## En Progreso 🚧
- Business feature migration
- Products feature migration

## Pendiente ⏳
- Orders feature migration
- Navigation migration
- Full TanStack Query integration
```

## Validación Final

### ✅ Checklist de validación

- [ ] Estructura completa de carpetas creada desde cero
- [ ] Archivos base implementados (cn.js, constants.js, query-client.js)
- [ ] Componentes UI básicos (Button, Input) funcionando
- [ ] App arranca sin errores con "Fresh Start" message
- [ ] TanStack Query DevTools funcionan
- [ ] NativeWind classes se aplican correctamente

### 🔍 Revisión de archivos nuevos

Verificar que estos archivos existen y tienen contenido implementado:
- `app/` estructura completa con route groups (nueva)
- `features/` estructura por dominio (nueva)
- `shared/utils/cn.js` (nuevo)
- `shared/utils/constants.js` (nuevo)
- `shared/config/query-client.js` (nuevo)
- `shared/components/ui/button.jsx` (nuevo)
- `shared/components/ui/input.jsx` (nuevo)
- `backup/screens/` (solo para referencia)

## Troubleshooting

### Missing touch command (Windows)
```bash
# En Windows usar:
echo.> app/_layout.jsx
echo.> app/(auth)/_layout.jsx
# etc...
```

### Structure creation issues
```bash
# Crear manualmente si los comandos no funcionan
mkdir app
mkdir "app/(auth)"
mkdir "app/(main)"
# etc...
```

### Import path issues
- Usar paths relativos correctos desde cada archivo
- Verificar que las exportaciones existen en archivos index

## Próximos Pasos

Una vez completada esta fase:
1. Tenemos la estructura completa implementada desde cero
2. Los archivos base están creados y funcionando
3. Los componentes UI básicos están implementados
4. El proyecto está listo para implementar features completas
5. La app arranca correctamente con mensaje "Fresh Start"

**Continuar con**: [03 - Testing y Deploy](./03-testing.md)

---

## 📖 Navegación

**Anterior:** [Preparación del Entorno](./01-preparacion.md) | **Siguiente:** [Testing y Deploy](./03-testing.md)