# Fase 2: Reestructuración de Carpetas

## Objetivo

Reorganizar el código existente en la nueva estructura feature-based sin romper la funcionalidad actual. Esta fase prepara el terreno para las siguientes migraciones.

## Prerrequisitos

- [ ] Fase 1 completada (dependencias instaladas)
- [ ] App funcionando normalmente
- [ ] Backup del proyecto actual
- [ ] Branch `refactor/new-architecture` activo

## Estrategia de Migración

### Enfoque Gradual
1. **Mantener funcionalidad**: El app sigue funcionando durante la migración
2. **Dual import**: Temporalmente existirán archivos en ambas ubicaciones
3. **Incremental**: Mover feature por feature, no todo de una vez
4. **Testing continuo**: Probar después de cada movimiento importante

## Paso 1: Mapear Código Existente

### Identificar archivos actuales
```bash
# Crear un mapa del código actual
find . -name "*.js" -o -name "*.jsx" | grep -v node_modules > current_files.txt

# Separar por tipo de archivo
grep -i component current_files.txt > components_current.txt
grep -i screen current_files.txt > screens_current.txt
grep -i service current_files.txt > services_current.txt
```

### Clasificar por feature
Crear un documento `migration_mapping.md`:
```markdown
# Mapeo de Migración

## Auth Files
- `src/components/LoginForm.js` → `src/features/auth/components/login-form.jsx`
- `src/screens/LoginScreen.js` → `src/features/auth/screens/login-screen.jsx`
- `src/services/AuthService.js` → `src/shared/services/user-service.js`

## Business Files  
- `src/components/BusinessCard.js` → `src/features/business/components/business-card.jsx`
- `src/screens/BusinessList.js` → `src/features/business/screens/business-list-screen.jsx`

## ... etc
```

## Paso 2: Migrar Servicios (Shared)

### Identificar servicios actuales
Los servicios van en `shared/services/` porque son reutilizables entre features.

### Crear BaseService
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

### Migrar servicios específicos

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

  // Mantener métodos existentes del servicio actual
  static async login(email, password) {
    // TODO: Migrar lógica actual de login
    // Temporalmente, delegar al servicio anterior
    const OldAuthService = require('../path/to/old/AuthService');
    return OldAuthService.login(email, password);
  }

  static async register(userData) {
    // TODO: Migrar lógica actual de registro
    const OldAuthService = require('../path/to/old/AuthService');
    return OldAuthService.register(userData);
  }

  static subscribeToUser(uid, callback) {
    return this.subscribeToDocument(this.collectionName, uid, callback);
  }
}
```

### Crear archivo de transición
```javascript
// shared/services/legacy-bridge.js
// Temporalmente mantener imports del código anterior

// Re-exportar servicios nuevos con nombres anteriores para compatibility
export { UserService as AuthService } from './user-service';
export { BusinessService as BusinessService } from './business-service';
// ... otros servicios

// Esta estrategia permite cambiar imports gradualmente
```

## Paso 3: Migrar Componentes UI Base

### Identificar componentes reutilizables
Componentes que se usan en múltiples features van a `shared/components/ui/`.

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

- [ ] App funciona igual que antes
- [ ] Nueva estructura de carpetas creada
- [ ] Servicios migrados y funcionando
- [ ] Componentes UI básicos funcionando
- [ ] Al menos una feature (auth) parcialmente migrada
- [ ] Tests pasan
- [ ] No hay imports rotos
- [ ] DevTools de TanStack Query funcionan

### 🔍 Revisión de archivos

Verificar que estos archivos existen y funcionan:
- `shared/services/base-service.js`
- `shared/services/user-service.js`
- `shared/components/ui/button.jsx`
- `shared/components/ui/input.jsx`
- `features/auth/components/login-form.jsx`
- `features/auth/queries/user-query-keys.js`

## Troubleshooting

### Import errors
```javascript
// Si hay errores de import, crear más bridges temporales
// shared/legacy-exports.js
export * from './services/user-service';
export * from './components/ui';
export * from '../features/auth/components/login-form-bridge';
```

### Path resolution issues
```javascript
// Si Metro no encuentra los nuevos paths, verificar:
// metro.config.js resolver configuration
```

### Component not found errors
- Verificar que los componentes están exportados correctamente
- Verificar que los bridges temporales están en su lugar
- Verificar que no hay typos en los nombres de archivos

## Próximos Pasos

Una vez completada esta fase:
1. El proyecto tiene la nueva estructura de carpetas
2. Los servicios están migrados y funcionando
3. Los componentes UI básicos están implementados
4. Una feature (auth) está parcialmente migrada
5. El app sigue funcionando normalmente

**Continuar con**: [03 - Migración de Servicios](./03-migracion-servicios.md)