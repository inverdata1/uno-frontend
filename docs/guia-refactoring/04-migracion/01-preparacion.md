# Fase 1: Preparación del Entorno

## Objetivo

Preparar el proyecto para la migración instalando dependencias necesarias, configurando herramientas de desarrollo y creando el entorno base para la nueva arquitectura.

## Prerrequisitos

- [ ] Backup completo del proyecto actual
- [ ] Crear branch `refactor/new-architecture`
- [ ] Team informado sobre la migración
- [ ] Acceso a Firebase console del proyecto

## Paso 1: Instalación de Dependencias

### Dependencias Core
```bash
# TanStack Query
npm install @tanstack/react-query@latest

# State Management
npm install zustand@latest

# Navegación
npm install @react-navigation/native@latest
npm install @react-navigation/native-stack@latest
npm install @react-navigation/bottom-tabs@latest
npm install react-native-screens react-native-safe-area-context

# Forms y Validación
npm install react-hook-form@latest
npm install @hookform/resolvers@latest
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

## Paso 6: Configuración del QueryClient

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
        // No reintentar errores de permisos
        if (error?.code === 'permission-denied') return false;
        if (error?.code === 'not-found') return false;
        
        // Reintentar hasta 3 veces para errores de red
        return failureCount < 3;
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
  db: {},
  storage: {},
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

### Crear estructura nueva
```bash
mkdir -p src/shared/{components/ui,config,services,hooks,utils,queries,types}
mkdir -p src/features/{auth,business,products,orders,social,profile}/{components,screens,queries,utils}
mkdir -p src/navigation
mkdir -p src/app
```

### Crear archivos index base
```javascript
// shared/components/ui/index.js
// Placeholder para futuras exportaciones
export * from './button';
export * from './input';
export * from './loading-spinner';
// ... otros componentes UI
```

## Paso 10: Migración del App.js Principal

### Respaldar App.js actual
```bash
cp App.js App.js.backup
```

### Crear nuevo App.js
```javascript
// App.js
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './src/shared/config/query-client';

// Import del app anterior para mantener funcionando
import OldApp from './App.js.backup';

// TODO: Reemplazar con nueva navegación cuando esté lista
// import AppNavigator from './src/navigation/app-navigator';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* TEMPORAL: Usar app anterior mientras migramos */}
      <OldApp />
      
      {/* TODO: Reemplazar con nueva arquitectura */}
      {/* <AppNavigator /> */}
      
      {/* DevTools solo en desarrollo */}
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
   - App debe funcionar exactamente igual que antes
   - No debe haber errores en console
   - DevTools de TanStack Query deben aparecer (solo en dev)

4. **Verificar estructura de carpetas**:
```bash
ls -la src/
# Debe mostrar: shared/, features/, navigation/, app/
```

5. **Probar utilidad cn()**:
```javascript
// Test rápido en cualquier componente
import { cn } from './src/shared/utils/cn';
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
1. El proyecto debe funcionar exactamente igual que antes
2. Todas las nuevas dependencias están instaladas
3. La estructura base de carpetas está creada
4. Las herramientas de desarrollo están configuradas

**Continuar con**: [02 - Reestructuración de Carpetas](./02-reestructuracion.md)