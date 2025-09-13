# Guía de Refactoring - Uno Delivery App

## Navegación de Documentos

Esta guía está dividida en secciones lógicas para facilitar la comprensión y implementación:

### 1. Análisis del Estado Actual
- **[Problemas Actuales](./01-analisis/00-problemas-actuales.md)** - 11 problemas críticos identificados
- **[Decisión Arquitectónica](./01-analisis/01-decision-arquitectonica.md)** - Por qué app unificada vs dual

### 2. Arquitectura Nueva
- **[Estructura de Carpetas](./02-arquitectura/01-estructura-carpetas.md)** - Organización feature-based
- **[Stack Tecnológico](./02-arquitectura/02-stack-tecnologico.md)** - Decisiones técnicas y justificaciones
- **[Colecciones Firebase](./02-arquitectura/03-colecciones-firebase.md)** - Estructura completa de la base de datos

### 3. TanStack Query
- **[Introducción](./03-tanstack-query/00-inicio.md)** - Qué es y por qué lo usamos
- **[Estrategia Query Keys](./03-tanstack-query/01-estrategia-query-keys.md)** - Organización distribuida por feature
- **[Patrones Básicos](./03-tanstack-query/02-patrones-basicos.md)** - Queries, mutations y patterns comunes
- **[Implementación por Feature](./03-tanstack-query/03-implementacion-features.md)** - Ejemplos específicos
- **[Configuración](./03-tanstack-query/04-configuracion.md)** - Setup técnico inicial

### 4. Plan de Migración
- **[Fases de Migración](./04-migracion/fases-migracion.md)** - Fases de migración completa
- **[Migración TanStack Query](./04-migracion/plan-migracion-tanstack-query.md)** - Migración específica de queries

### 5. Desarrollo
- **[Lista Completa](../LISTA-DESARROLLO-COMPLETA.md)** - Lista completa para app final
- **[Agregar Features](./05-guia-desarrollo/00-00-agregar-nuevas-features.md)** - Guía para nuevas funcionalidades

## Cómo Usar Esta Guía

### Para Developers Nuevos al Proyecto
1. Lee primero **01-analisis** para entender el contexto
2. Revisa **02-arquitectura** para conocer la nueva estructura
3. Estudia **03-tanstack-query** para entender el manejo de datos
4. Consulta **04-migracion** cuando vayas a implementar

### Para Implementation
- Cada documento incluye ejemplos mínimos necesarios para entender conceptos
- Los archivos están pensados para ser leídos independientemente
- Referencias cruzadas cuando un concepto depende de otro

## Principios de Esta Refactorización

1. **Eliminación de Duplicación**: Unificar client/business modes
2. **Arquitectura Feature-Based**: Organización por funcionalidad
3. **React Native Moderno**: Hooks, context, mejores prácticas
4. **Developer Experience**: Herramientas y patterns que faciliten desarrollo
5. **Escalabilidad**: Preparado para crecimiento del equipo y features

Esta guía está diseñada para ser leída de forma secuencial, comenzando por el análisis de problemas y culminando con la implementación completa de la nueva arquitectura.

---

## 📖 Navegación

**Siguiente:** [01 - Análisis de Problemas Actuales](./01-analisis/00-problemas-actuales.md)