# Stack Tecnológico - Decisiones y Justificaciones

## Frontend Framework

### React Native con Expo
**Decisión**: React Native + Expo (not bare workflow)
**Versión**: React Native 0.79+, Expo SDK 53+

**Justificaciones**:
- **Desarrollo rápido**: Expo facilita configuración y despliegue
- **Multiplataforma**: Una base de código para iOS y Android
- **Ecosistema maduro**: Gran cantidad de librerías disponibles
- **Recarga en caliente**: Desarrollo más eficiente
- **Actualizaciones OTA**: Actualizaciones sin aprobación de app store

**Trade-offs**:
- ❌ Limitaciones en módulos nativos específicos
- ❌ Tamaño de app ligeramente mayor
- ✅ Desarrollo más rápido para MVP
- ✅ Menor complejidad de setup

---

## Navegación

### Expo Router (Enrutamiento Basado en Archivos)
**Decisión**: Expo Router con enrutamiento basado en archivos

**Justificaciones**:
- **Enrutamiento basado en archivos**: Enrutamiento automático basado en estructura de archivos
- **Mejor rendimiento**: Carga diferida automática
- **Tipado seguro**: Navegación con tipado automático
- **Grupos de rutas**: Organización limpia con (auth) y (main)
- **Diseños anidados**: Diseños específicos por sección
- **Enlaces profundos**: Soporte nativo y automático

**Estructura**:
```javascript
app/
├── (auth)/          # Route group para autenticación
│   ├── _layout.jsx  # Layout específico para auth
│   ├── login.jsx
│   └── register.jsx
├── (main)/          # Route group para app principal
│   ├── _layout.jsx  # Tab navigation
│   ├── home.jsx
│   ├── stores/
│   ├── social/      # TikTok Shop funcionalidad
│   └── business/    # Dashboard condicional
└── _layout.jsx      # Root layout
```

---

## State Management

### TanStack Query + Zustand
**Decisión**: TanStack Query para server state, Zustand para client state

#### TanStack Query (Server State)
**Justificaciones**:
- **Caché inteligente**: Manejo automático de caché y sincronización
- **Actualizaciones en segundo plano**: Recarga inteligente de datos
- **Actualizaciones optimistas**: Experiencia de usuario superior
- **Herramientas de desarrollo**: Depuración excelente
- **Rendimiento**: Reduce llamadas redundantes a API

#### Zustand (Estado del Cliente)  
**Justificaciones**:
- **Simplicidad**: API más simple que Redux
- **TypeScript**: Excelente soporte
- **Tamaño**: Tamaño de paquete pequeño
- **Sin código repetitivo**: Sin acciones/reductores complicados

**Trade-offs**:
- ❌ Curva de aprendizaje adicional (TanStack Query)
- ✅ Separación clara entre estado del servidor vs cliente
- ✅ Rendimiento superior
- ✅ Mejor experiencia de desarrollo

---

## Backend & Database

### Firebase Auth + FastAPI Data Layer
**Decisión**: Firebase Auth directo + FastAPI backend para datos

**Arquitectura Híbrida**:
- **Auth**: Mobile App ↔ Firebase Auth (directo)
- **Data**: Mobile App → FastAPI → Firebase Firestore
- **Storage**: Mobile App → FastAPI → Firebase Storage
- **Authorization**: Firebase ID tokens verificados por FastAPI

**Justificaciones**:

#### **Firebase Auth Directo**:
- **UX Superior**: Flows nativos de autenticación (Google, Apple, Facebook)
- **Desarrollo Rápido**: Sin necesidad de implementar auth en backend
- **Seguridad Probada**: Firebase Auth maneja todas las complejidades de seguridad
- **Offline Support**: Estado de autenticación funciona sin conexión
- **MFA Built-in**: Autenticación multifactor nativa

#### **FastAPI para Datos**:
- **Lógica de Negocio**: Control total sobre validaciones y reglas de negocio
- **API Personalizada**: Endpoints optimizados para casos de uso específicos
- **Seguridad de Datos**: Validación centralizada antes de escribir a Firebase
- **Flexibilidad**: Cacheo, logging, integraciones externas
- **Performance**: Queries optimizadas y operaciones batch

**Configuración**:
```javascript
// shared/config/firebase.js - Solo Firebase Auth
// shared/config/api-client.js - Cliente Axios centralizado
// api/ - Funciones fetch simples por recurso (users.js, businesses.js)
// features/*/api/ - Custom hooks TanStack Query por feature
```

**Flujo de API Layer**:
```javascript
// 1. Global fetch functions
// api/users.js
export const getUser = (userId) => apiClient.get(`/users/${userId}`);
export const updateUser = (userId, data) => apiClient.put(`/users/${userId}`, data);

// 2. Feature hooks con TanStack Query
// features/auth/api/use-user.js
import { useQuery, useMutation } from '@tanstack/react-query';
import * as usersApi from '../../../api/users';

export const useUser = (userId) => useQuery({
  queryKey: ['users', userId],
  queryFn: () => usersApi.getUser(userId)
});

// 3. Components usan hooks directamente
const { data: user, isLoading } = useUser(authUser?.uid);
```

**Trade-offs**:
- ❌ Dependencia dual (Firebase Auth + FastAPI)
- ❌ Complejidad de token management
- ✅ Mejor UX que auth custom
- ✅ Desarrollo más rápido que auth desde cero
- ✅ Control total sobre lógica de negocio
- ✅ Seguridad máxima para datos

---

## Styling & UI

### NativeWind (Tailwind CSS para React Native)
**Decisión**: NativeWind + sistema de componentes custom

**Justificaciones**:
- **Consistencia**: Enfoque de utilidades primero
- **Rendimiento**: Estilos compilados
- **Productividad del desarrollador**: Clases familiares de Tailwind
- **Basado en componentes**: Fácil crear sistema de diseño
- **Responsivo**: Soporte para diferentes tamaños de pantalla

**Configuración**:
```javascript
// tailwind.config.js - Configuración de design tokens
// shared/components/ui/ - Componentes base
// Utility: cn() para conditional classes
```

**Trade-offs**:
- ❌ Tamaño de paquete ligeramente mayor
- ❌ Curva de aprendizaje para Tailwind
- ✅ Desarrollo muy rápido
- ✅ Consistencia automática

---

## Forms & Validation

### TanStack Form + Zod
**Decisión**: TanStack Form para forms, Zod para validation schema

#### TanStack Form
**Justificaciones**:
- **Nativo de React Native**: Diseñado para funcionar perfectamente en React Native
- **Rendimiento superior**: Mejor que React Hook Form en RN
- **Tipado seguro**: Tipado completo listo para usar
- **Validación granular**: Validación por campo en tiempo real
- **Tamaño de paquete**: Optimizado y liviano
- **Mejor experiencia de desarrollo**: Experiencia de desarrollo superior

#### Zod
**Justificaciones**:
- **Tipado seguro**: Validación de esquemas con tipos automáticos
- **Validación en tiempo de ejecución**: Validación robusta en tiempo de ejecución
- **Esquemas componibles**: Esquemas reutilizables y modulares
- **Mensajes de error**: Mensajes de error personalizables
- **Listo para React Native**: Funciona perfectamente en móvil

**Implementación**:
```javascript
// features/auth/schemas/login-schema.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

// features/auth/components/login-form.jsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';

const LoginForm = ({ onSubmit }) => {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => onSubmit(value),
    validatorAdapter: zodValidator,
  });

  return (
    <form.Provider>
      <form.Field
        name="email"
        validators={{ onChange: loginSchema.shape.email }}
        children={(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Email"
          />
        )}
      />
    </form.Provider>
  );
};
```

---

## File Management

### Expo ImagePicker + Firebase Storage
**Decisión**: Expo ImagePicker para selección, Firebase Storage para almacenamiento

**Justificaciones**:
- **Multiplataforma**: Funciona igual en iOS/Android
- **Permisos**: Manejo automático de permisos
- **Manipulación de imágenes**: Redimensionamiento y compresión
- **Soporte de video**: Soporte para video también
- **Integración**: Integración perfecta con Firebase

**Características**:
- Selector de imágenes de galería y cámara
- Grabación y selección de video
- Generación automática de miniaturas
- Seguimiento del progreso de carga
- Preservación de metadatos

---

## Herramientas de Desarrollo

### Stack de Desarrollo
- **TypeScript**: Futuro upgrade para tipado seguro
- **ESLint + Prettier**: Formateo de código y linting
- **Jest + React Native Testing Library**: Pruebas
- **Flipper**: Depuración (React Query DevTools)

### CI/CD
- **EAS Build**: Automatización de compilaciones con Expo
- **EAS Update**: Actualizaciones por aire
- **EAS Submit**: Automatización de envío a app stores

---

## Librerías Principales

### Core Dependencies
```json
{
  "expo": "^53.0.10",
  "react": "19.0.0",
  "react-native": "^0.79.3",
  "expo-router": "~4.0.0",
  "@tanstack/react-query": "^5.59.0",
  "@tanstack/react-form": "^0.33.0",
  "@tanstack/zod-form-adapter": "^0.33.0",
  "zustand": "^5.0.0",
  "firebase": "^11.9.1",
  "axios": "^1.7.9",
  "nativewind": "^4.1.0",
  "zod": "^3.24.0",
  "expo-image-picker": "~16.1.4",
  "react-native-gesture-handler": "~2.20.0",
  "@react-native-async-storage/async-storage": "^1.24.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.3.0",
  "clsx": "^1.2.0",
  "tailwind-merge": "^1.12.0"
}
```

### Desarrollo
```json
{
  "@tanstack/react-query-devtools": "^5.59.0",
  "@testing-library/react-native": "^12.7.0",
  "@testing-library/jest-native": "^5.5.0",
  "jest": "^29.7.0",
  "eslint": "^9.17.0",
  "eslint-plugin-react-hooks": "^5.1.0",
  "prettier": "^3.4.0",
  "@babel/core": "^7.26.0"
}
```

---

## Arquitectura de Datos

### Flujo de Datos
1. **Componentes UI** → Disparan eventos de usuario
2. **Hooks de TanStack Query** → Manejan estado del servidor y caché
3. **Capa de Servicios** → Abstrae llamadas a Firebase
4. **Firebase** → Almacena y sincroniza datos
5. **Stores de Zustand** → Maneja estado del cliente (UI, preferencias)

### Estrategia de Caché
- **TanStack Query**: Caché automático con invalidación inteligente
- **Firestore**: Caché sin conexión nativo
- **Caché de Imágenes**: Expo Image con caché automático

---

## Optimizaciones de Rendimiento

### Optimización de Paquete
- **Metro bundler**: Optimización automática de paquete
- **Hermes**: Motor JavaScript optimizado
- **División de código**: Importaciones dinámicas donde sea necesario

### Rendimiento en Tiempo de Ejecución
- **FlatList**: Para listas grandes con virtualización
- **Optimización de imágenes**: Redimensionamiento y compresión automática  
- **Carga diferida**: Pantallas y componentes cargados bajo demanda

### Optimización de Red
- **Deduplicación de consultas**: TanStack Query evita solicitudes duplicadas
- **Sincronización en segundo plano**: Actualizaciones en segundo plano
- **Soporte sin conexión**: Firestore offline + reintentos de TanStack Query

---

## Consideraciones de Seguridad

### Autenticación
- **Firebase Auth**: Autenticación multi-proveedor
- **Almacenamiento seguro**: AsyncStorage para tokens
- **Gestión de sesión**: Auto-renovación de tokens

### Seguridad de Datos
- **Reglas de Seguridad Firestore**: Control de acceso granular
- **Validación de entrada**: Esquemas Zod en cliente y backend
- **Seguridad de carga de archivos**: Validación de tipos y tamaños

### Privacidad
- **Cifrado de datos de usuario**: En tránsito y en reposo (Firebase)
- **Permisos mínimos**: Solo permisos necesarios
- **Retención de datos**: Políticas claras de retención

---

## Plan de Escalabilidad

### Escalamiento Técnico
- **Arquitectura modular**: Organización basada en características
- **Listo para microservicios**: Los servicios pueden migrarse a APIs personalizadas
- **CDN**: Firebase Storage con CDN global
- **Fragmentación de base de datos**: Subcolecciones Firestore para escalabilidad

### Escalamiento de Equipo  
- **Propiedad de características**: Los equipos pueden trabajar independientemente
- **Interfaces claras**: Capa de servicios bien definida
- **Documentación**: Guías para incorporación rápida
- **Estrategia de pruebas**: Pipeline de pruebas automatizadas

Esta stack está diseñada para desarrollo rápido de MVP con path claro hacia escalabilidad y mantenimiento a largo plazo.

---

## 📖 Navegación

**Anterior:** [Estructura de Carpetas](./01-estructura-carpetas.md) | **Siguiente:** [Colecciones Firebase](./03-colecciones-firebase.md)