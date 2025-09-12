# Stack Tecnológico - Decisiones y Justificaciones

## Frontend Framework

### React Native con Expo
**Decisión**: React Native + Expo (not bare workflow)
**Versión**: React Native 0.72+, Expo SDK 49+

**Justificaciones**:
- **Desarrollo rápido**: Expo facilita setup y deployment
- **Cross-platform**: Una codebase para iOS y Android
- **Ecosystem maduro**: Gran cantidad de librerías disponibles
- **Hot reload**: Desarrollo más eficiente
- **OTA Updates**: Actualizaciones sin app store approval

**Trade-offs**:
- ❌ Limitaciones en módulos nativos específicos
- ❌ Tamaño de app ligeramente mayor
- ✅ Desarrollo más rápido para MVP
- ✅ Menor complejidad de setup

---

## Navegación

### React Navigation v6
**Decisión**: @react-navigation/native + stack/tab navigators

**Justificaciones**:
- **Estándar de facto**: Librería más usada en React Native
- **File-based routing**: Expo Router para estructura clara
- **Deep linking**: Soporte nativo para URLs
- **Performance**: Navegación nativa optimizada
- **Customizable**: Fácil personalización de transitions

**Configuración**:
```javascript
// navigation/app-navigator.jsx - Stack principal
// navigation/tab-navigator.jsx - Tabs bottom
// Expo Router para file-based routing (futuro upgrade)
```

---

## State Management

### TanStack Query + Zustand
**Decisión**: TanStack Query para server state, Zustand para client state

#### TanStack Query (Server State)
**Justificaciones**:
- **Cache inteligente**: Manejo automático de cache y sincronización
- **Background updates**: Re-fetch inteligente
- **Optimistic updates**: UX superior
- **DevTools**: Debugging excelente
- **Performance**: Reduce llamadas redundantes a API

#### Zustand (Client State)  
**Justificaciones**:
- **Simplicidad**: API más simple que Redux
- **TypeScript**: Excelente soporte
- **Size**: Bundle size pequeño
- **No boilerplate**: Sin actions/reducers complicados

**Trade-offs**:
- ❌ Curva de aprendizaje adicional (TanStack Query)
- ✅ Separación clara server vs client state
- ✅ Performance superior
- ✅ Mejor developer experience

---

## Backend & Database

### Firebase (Firestore + Auth + Storage)
**Decisión**: Firebase como BaaS principal

**Justificaciones**:
- **Real-time**: Firestore real-time updates
- **Authentication**: Firebase Auth con providers múltiples
- **File storage**: Firebase Storage integrado
- **Offline support**: Firestore offline caching
- **Scalability**: Auto-scaling sin setup
- **Security**: Security rules granulares

**Configuración**:
```javascript
// shared/config/firebase.js - Setup principal
// shared/services/ - Servicios por dominio
// Security rules en firestore.rules
```

**Trade-offs**:
- ❌ Vendor lock-in con Google
- ❌ Costos pueden escalar
- ✅ Time to market muy rápido
- ✅ No necesita backend development

---

## Styling & UI

### NativeWind (Tailwind CSS para React Native)
**Decisión**: NativeWind + sistema de componentes custom

**Justificaciones**:
- **Consistency**: Utility-first approach
- **Performance**: Styles compilados
- **Developer productivity**: Clases familiares de Tailwind
- **Component-based**: Fácil crear design system
- **Responsive**: Support para diferentes screen sizes

**Configuración**:
```javascript
// tailwind.config.js - Configuración de design tokens
// shared/components/ui/ - Componentes base
// Utility: cn() para conditional classes
```

**Trade-offs**:
- ❌ Bundle size ligeramente mayor
- ❌ Curva de aprendizaje para Tailwind
- ✅ Desarrollo muy rápido
- ✅ Consistency automática

---

## Forms & Validation

### React Hook Form + Zod
**Decisión**: React Hook Form para forms, Zod para validation schema

#### React Hook Form
**Justificaciones**:
- **Performance**: Minimal re-renders
- **Bundle size**: Más pequeño que Formik
- **API**: API intuitiva y poderosa
- **Integration**: Excelente con React Native

#### Zod
**Justificaciones**:
- **Type safety**: Schema validation con tipos
- **Runtime validation**: Validation en runtime
- **Composable**: Schemas reutilizables
- **Error messages**: Mensajes de error claros

**Uso**:
```javascript
// Validation schemas en utils/validation.js
// Forms con useForm + Controller
// Resolvers con @hookform/resolvers/zod
```

---

## File Management

### Expo ImagePicker + Firebase Storage
**Decisión**: Expo ImagePicker para selección, Firebase Storage para almacenamiento

**Justificaciones**:
- **Cross-platform**: Funciona igual en iOS/Android
- **Permissions**: Manejo automático de permisos
- **Image manipulation**: Resize y compression
- **Video support**: Soporte para video también
- **Integration**: Integración perfecta con Firebase

**Features**:
- Image picker de galería y camera
- Video recording y selection
- Automatic thumbnail generation
- Upload progress tracking
- Metadata preservation

---

## Development Tools

### Development Stack
- **TypeScript**: Futuro upgrade para type safety
- **ESLint + Prettier**: Code formatting y linting
- **Jest + React Native Testing Library**: Testing
- **Flipper**: Debugging (React Query DevTools)

### CI/CD
- **EAS Build**: Build automation con Expo
- **EAS Update**: Over-the-air updates
- **EAS Submit**: App store submission automation

---

## Librerías Principales

### Core Dependencies
```json
{
  "@react-navigation/native": "^6.1.0",
  "@tanstack/react-query": "^4.29.0",
  "zustand": "^4.3.0",
  "firebase": "^9.22.0",
  "nativewind": "^2.0.0",
  "react-hook-form": "^7.44.0",
  "zod": "^3.21.0",
  "expo-image-picker": "~14.1.0"
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

### Development
```json
{
  "@testing-library/react-native": "^12.1.0",
  "jest": "^29.5.0",
  "eslint": "^8.42.0",
  "prettier": "^2.8.0"
}
```

---

## Arquitectura de Datos

### Data Flow
1. **UI Components** → Disparan eventos de usuario
2. **TanStack Query Hooks** → Manejan server state y cache
3. **Service Layer** → Abstrae llamadas a Firebase
4. **Firebase** → Almacena y sincroniza datos
5. **Zustand Stores** → Maneja client state (UI, preferences)

### Caching Strategy
- **TanStack Query**: Cache automático con invalidación inteligente
- **Firestore**: Offline caching nativo
- **Image Caching**: Expo Image con cache automático

---

## Performance Optimizations

### Bundle Optimization
- **Metro bundler**: Optimización automática de bundle
- **Hermes**: JavaScript engine optimizado
- **Code splitting**: Dynamic imports donde sea necesario

### Runtime Performance
- **FlatList**: Para listas grandes con virtualization
- **Image optimization**: Resize y compression automática  
- **Lazy loading**: Screens y components cargados on-demand

### Network Optimization
- **Query deduplication**: TanStack Query evita requests duplicados
- **Background sync**: Actualizaciones en background
- **Offline support**: Firestore offline + TanStack Query retry

---

## Security Considerations

### Authentication
- **Firebase Auth**: Multi-provider authentication
- **Secure storage**: AsyncStorage para tokens
- **Session management**: Auto-refresh de tokens

### Data Security
- **Firestore Security Rules**: Access control granular
- **Input validation**: Zod schemas en client y backend
- **File upload security**: Validación de tipos y tamaños

### Privacy
- **User data encryption**: En transit y at rest (Firebase)
- **Minimal permissions**: Solo permisos necesarios
- **Data retention**: Políticas claras de retención

---

## Scalability Plan

### Technical Scaling
- **Modular architecture**: Feature-based organization
- **Microservices ready**: Servicios pueden migrarse a APIs custom
- **CDN**: Firebase Storage con CDN global
- **Database sharding**: Firestore subcollections para scalability

### Team Scaling  
- **Feature ownership**: Teams pueden trabajar independientemente
- **Clear interfaces**: Service layer bien definido
- **Documentation**: Guías para onboarding rápido
- **Testing strategy**: Automated testing pipeline

Esta stack está diseñada para desarrollo rápido de MVP con path claro hacia escalabilidad y mantenimiento a largo plazo.

---

## 📖 Navegación

**Anterior:** [Estructura de Carpetas](./estructura-carpetas.md) | **Siguiente:** [Colecciones Firebase](./colecciones-firebase.md)