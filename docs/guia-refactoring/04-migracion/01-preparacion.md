# Fase 1: Preparación del Entorno

## Objetivo

Crear un nuevo proyecto Expo desde cero e implementar la arquitectura moderna con **Expo Router**, **TanStack Query**, **TanStack Form** y **Zustand**. El código existente será descartado excepto por referencia.

## Prerrequisitos

- [ ] Backup de la carpeta /screens existente a /backup/screens/
- [ ] Crear branch `feature/fresh-implementation`
- [ ] Team informado sobre el fresh start
- [ ] Acceso a Firebase console (nuevo proyecto o limpieza del existente)

## Paso 1: Limpiar Proyecto Actual

### Crear backup mínimo para referencia
```bash
# Solo hacer backup de screens por si necesitamos consultar algo
mkdir -p backup
mv screens/ backup/screens/ 2>/dev/null || echo "No hay carpeta screens/"

# Limpiar todo el código viejo - vamos a empezar limpio
rm -rf src/ components/ navigation/ services/ 2>/dev/null || true
rm App.js 2>/dev/null || true
```

## Paso 2: Verificar Setup de Expo

### Confirmar que tenemos Expo funcionando
```bash
# Verificar que Expo CLI esté instalado
npm list -g expo-cli || npm install -g expo-cli

# Verificar que el proyecto base de Expo funcione
npm start
```

**IMPORTANTE**: Como ya tenemos un proyecto Expo inicializado, solo necesitamos asegurarnos que funcione correctamente después de la limpieza.

## Paso 3: Instalación de Dependencias

### Dependencias Core
```bash
# Expo Router (File-based routing)
npx expo install expo-router

# TanStack Query (Server state)
npm install @tanstack/react-query@latest

# State Management (Client state)
npm install zustand@latest

# Forms y Validación (IMPORTANTE: TanStack Form, no React Hook Form)
npm install @tanstack/react-form@latest
npm install @tanstack/zod-form-adapter@latest
npm install zod@latest

# Styling
npm install nativewind@latest
npm install tailwindcss@latest
npm install clsx@latest
npm install tailwind-merge@latest
```

### DevTools y Testing
```bash
# TanStack Query DevTools
npm install --save-dev @tanstack/react-query-devtools

# Testing
npm install --save-dev @testing-library/react-native
npm install --save-dev @testing-library/jest-native

# Linting mejorado
npm install --save-dev eslint-plugin-react-hooks
npm install --save-dev @typescript-eslint/eslint-plugin # Para futuro TS
```

## Paso 2: Configuración de NativeWind

### Crear tailwind.config.js
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        // Agrega fonts custom aquí si las usas
      },
    },
  },
  plugins: [],
};
```

### Configurar babel.config.js
```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // ... otros plugins existentes
    ],
  };
};
```

## Paso 3: Configuración de Metro

### metro.config.js
```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configurar NativeWind
config.transformer.babelTransformerPath = require.resolve("nativewind/babel");

module.exports = config;
```

## Paso 4: Configuración Global CSS

### Crear global.css (opcional)
```css
/* global.css - Solo si necesitas estilos globales específicos */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility classes */
.shadow-soft {
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
}
```

## Paso 5: Setup de Utilidades

### Crear utilidad cn()
```javascript
// shared/utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Crear constantes globales
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

## Paso 6: Configuración de Firebase Auth

### Crear configuración de Firebase (solo Auth)
```javascript
// shared/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  // Solo config necesaria para Auth
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Crear cliente HTTP con interceptores
```javascript
// shared/config/api-client.js
import axios from 'axios';
import { auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar Firebase ID token automáticamente
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error('Error getting Firebase token:', error);
  }
  return config;
});

// Interceptor para manejar errores de auth
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refresh
      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true); // Force refresh
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Si falla el refresh, redirect a login
        console.error('Token refresh failed:', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

## Paso 7: Configuración del QueryClient

### Crear configuración básica
```javascript
// shared/config/query-client.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error) => {
        // No reintentar errores de permisos HTTP
        if (error?.status === 401 || error?.status === 403) return false;
        if (error?.status === 404 || error?.status === 422) return false;

        // Reintentar hasta 3 veces para errores de red (5xx)
        if (error?.status >= 500) return failureCount < 3;

        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // No retry automático para mutations
    },
  },
});
```

## Paso 7: Setup de ESLint

### Actualizar .eslintrc.js
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // Reglas para el nuevo código
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Desactivar si no usas PropTypes
    
    // Reglas para TanStack Query
    'react-hooks/exhaustive-deps': ['warn', {
      'additionalHooks': '(useQuery|useMutation|useInfiniteQuery)'
    }],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

## Paso 8: Configuración de Testing

### Actualizar jest.config.js
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './src/test-setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo|@expo|@react-navigation|@tanstack|zustand)/)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.js'
  ]
};
```

### Crear test-setup.js
```javascript
// src/test-setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Firebase
jest.mock('../shared/config/firebase', () => ({
  auth: {},
}));

// Mock TanStack Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  }),
}));
```

## Paso 9: Estructura Base de Carpetas

### Crear estructura nueva (Profy.dev API Layer)
```bash
# Shared config y utilidades
mkdir -p shared/{config,components/ui,hooks,utils,types}

# Global API layer
mkdir -p api

# Features con API hooks
mkdir -p features/{auth,business,products,orders,social,profile}/{api,components,screens,utils}

# Navigation y app
mkdir -p navigation app
```

### Crear archivos base de API layer

**Global API client:**
```javascript
// api/client.js
import axios from 'axios';
import { auth } from '../shared/config/firebase';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

// Auto-attach Firebase tokens
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Sample API functions:**
```javascript
// api/users.js
import { apiClient } from './client';

export const getProfile = () => apiClient.get('/users/profile');
export const updateProfile = (data) => apiClient.put('/users/profile', data);
export const getUser = (userId) => apiClient.get(`/users/${userId}`);
```

**Sample feature hooks:**
```javascript
// features/auth/api/use-user.js
import { useQuery, useMutation } from '@tanstack/react-query';
import * as usersApi from '../../../api/users';

export const useProfile = () => useQuery({
  queryKey: ['users', 'profile'],
  queryFn: usersApi.getProfile
});

export const useUpdateProfile = () => useMutation({
  mutationFn: usersApi.updateProfile
});
```

## Paso 10: Crear App.js Principal

### Crear nuevo App.js desde cero
```javascript
// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { Text, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from './shared/config/query-client';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Uno Delivery - Fresh Start 🚀
          </Text>
          <Text style={{ marginTop: 10, color: '#666' }}>
            Arquitectura nueva funcionando correctamente
          </Text>
        </View>
        
        {/* DevTools solo en desarrollo */}
        {__DEV__ && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            position="bottom-right"
          />
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
```

## Validación

### ✅ Verificar que todo funciona

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar el proyecto**:
```bash
npm start
```

3. **Verificar que carga sin errores**:
   - App debe mostrar "Uno Delivery - Fresh Start 🚀"
   - No debe haber errores en console
   - DevTools de TanStack Query deben aparecer (solo en dev)

4. **Verificar estructura nueva**:
```bash
ls -la 
# Debe mostrar: shared/, features/, app/
# Ya no tenemos código viejo, solo backup/screens/
```

5. **Probar utilidad cn()**:
```javascript
// Test rápido en cualquier componente
import { cn } from './shared/utils/cn';
console.log(cn('bg-red-500', 'text-white')); // Debe imprimir clases
```

## Troubleshooting

### Error: "Cannot resolve module"
```bash
# Limpiar cache y reinstalar
npm run clear
rm -rf node_modules package-lock.json
npm install
```

### Error: Metro bundler issues
```bash
# Reset Metro cache
npx expo start --clear
```

### Error: NativeWind not working
- Verificar que `babel.config.js` incluye `nativewind/babel`
- Verificar que `tailwind.config.js` tiene los paths correctos
- Restart del metro bundler

### Error: TanStack Query DevTools
- Solo funcionan en desarrollo (`__DEV__ = true`)
- Si no aparecen, verificar que están instaladas como devDependency

## Próximos Pasos

Una vez completada esta fase:
1. Tenemos un proyecto Expo completamente limpio y funcional
2. Todas las dependencias nuevas están instaladas y configuradas
3. La estructura base de carpetas está creada desde cero
4. Las herramientas de desarrollo (TanStack Query DevTools, NativeWind) están configuradas
5. Solo mantenemos /backup/screens/ como referencia mínima
---

## 📖 Navegación

**Anterior:** [Migración - Inicio](./00-inicio.md) | **Siguiente:** [Reestructuración de Carpetas](./02-reestructuracion.md)