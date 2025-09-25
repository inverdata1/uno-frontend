# UNO Delivery - Sistema de Diseño General

## Navegación de Documentos

Esta documentación describe la arquitectura completa del sistema UNO Delivery multi-roles. Los documentos están organizados de forma lógica para facilitar la comprensión del sistema.

### 📖 Índice de Documentos

#### 1. Visión General
- **[01 - Visión Arquitectónica](./01-vision-arquitectonica.md)** - Principios de diseño y overview del sistema

#### 2. Frontend Architecture
- **[02 - Arquitectura Frontend](./02-arquitectura-frontend.md)** - React Native, Zustand, TanStack Query
- **[03 - Sistema UI Dinámico](./03-sistema-ui-dinamico.md)** - Componentes adaptativos y navegación por roles

#### 3. Backend Architecture
- **[04 - Arquitectura Backend](./04-arquitectura-backend.md)** - FastAPI, servicios y API design
- **[05 - Sistema de Permisos](./05-sistema-permisos.md)** - RBAC y autorización

#### 4. Database Design
- **[06 - Arquitectura Base de Datos](./06-arquitectura-base-datos.md)** - Firestore collections y schemas
- **[07 - Estrategias de Datos](./07-estrategias-datos.md)** - Optimización, indexing y scaling

#### 5. User Experience
- **[09 - Sistema de Modos de Usuario](./09-sistema-modos-usuario.md)** - Arquitectura multi-modo y cambio de contexto

#### 6. System Integration
- **[08 - Integración del Sistema](./08-integracion-sistema.md)** - Data flows y comunicación entre servicios
- **[10 - Tiempo Real](./10-tiempo-real.md)** - WebSockets y notificaciones

#### 7. Operations & Security
- **[11 - Performance y Escalabilidad](./11-performance-escalabilidad.md)** - Optimizaciones y estrategias de scaling
- **[12 - Seguridad](./12-seguridad.md)** - Autenticación, autorización y privacidad
- **[13 - Monitoreo y Operaciones](./13-monitoreo-operaciones.md)** - Monitoring, logging y DevOps

#### 8. Future Planning
- **[14 - Extensibilidad](./14-extensibilidad.md)** - Plan para nuevos modos y features
- **[15 - Roadmap](./15-roadmap.md)** - Timeline y próximos pasos

## Cómo Usar Esta Documentación

### Para Developers Nuevos
1. Empezar con **Visión Arquitectónica** para entender el contexto
2. Leer **Arquitectura Frontend** y **Backend** para conocer las tecnologías
3. Revisar **Base de Datos** para entender el modelo de datos
4. Consultar documentos específicos según el área de trabajo

### Para Implementation
- Cada documento incluye ejemplos de código funcionales
- Diagramas y esquemas para visualizar conceptos complejos
- Referencias cruzadas entre documentos relacionados
- Consideraciones de performance y security en cada sección

### Para Planning y Management
- **Visión Arquitectónica** para decisiones de alto nivel
- **Extensibilidad** y **Roadmap** para planning futuro
- **Performance** y **Monitoreo** para operational concerns

## Principios del Sistema

1. **Single App, Multiple Modes**: Una aplicación que se transforma según el modo de usuario activo
2. **Mode-Based Everything**: UI, datos, permisos y navegación basados en modo de usuario
3. **Multi-Business Management**: Gestión de múltiples negocios y sucursales desde una cuenta
4. **Context-Aware Data**: Información filtrada por contexto de modo activo
5. **Persistent Context**: Contexto de usuario persistente entre sesiones
6. **Real-time Operations**: Actualizaciones en tiempo real
7. **Extensible Architecture**: Fácil agregar nuevos modos de usuario y features

## Estado del Proyecto

### ✅ Completado
- [x] Arquitectura de modos de usuario definida
- [x] Estructura de base de datos para multi-modo diseñada
- [x] Sistema de permisos basado en modos especificado
- [x] Frontend strategy con Zustand y almacenamiento persistente
- [x] API design patterns establecidos
- [x] Hook de gestión de focus para formularios implementado

### 🔄 En Desarrollo
- [ ] Implementación de cambio de modos de usuario
- [ ] Sistema de sucursales multi-negocio
- [ ] UI adaptativa por modo de usuario
- [ ] Gestión de contexto persistente

### 📋 Planeado
- [ ] Modo delivery con perfiles de repartidor
- [ ] Sistema de notificaciones en tiempo real
- [ ] Analytics por modo de usuario
- [ ] Optimización mobile por contexto

---

**Última actualización:** 25/09/2024
**Versión del sistema:** 2.0 (Sistema de Modos de Usuario)
**Contacto:** Equipo de desarrollo UNO Delivery