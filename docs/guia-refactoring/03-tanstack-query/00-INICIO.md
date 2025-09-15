# TanStack Query - Implementación del Proyecto

## Qué es TanStack Query?

TanStack Query (anteriormente React Query) es una librería para **manejo del estado del servidor** en React. Reemplaza el patrón manual de loading/error/data con hooks inteligentes que incluyen cache, sincronización automática y mejor UX.

## Por Qué lo Necesitamos?

### Problema Actual
```javascript
// ❌ Patrón manual repetido en cada componente
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [user, setUser] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await UserService.getUser(userId);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, [userId]);
```

### Solución con TanStack Query
```javascript
// ✅ Una línea, cache automático, error handling incluido
const { data: user, isLoading, error } = useUser(userId);
```

## Integración con Arquitectura Existente

TanStack Query **NO reemplaza** nuestros servicios de Firebase. Los **envuelve** con funcionalidades adicionales:

- **Servicios existentes**: `UserService`, `BusinessService`, etc. → Se mantienen igual
- **TanStack Query**: Agrega cache, loading states, error handling, optimistic updates
- **Componentes**: Usan hooks simples en lugar de useState/useEffect manual

## Documentos de Esta Sección

1. **[Estrategia Query Keys](./01-estrategia-query-keys.md)** - Cómo organizamos las query keys por feature
2. **[Patrones Básicos](./02-patrones-basicos.md)** - Patrones básicos de queries y mutations
3. **[Implementación por Feature](./03-implementacion-features.md)** - Ejemplos por cada feature del app
4. **[Configuración](./04-configuracion.md)** - Configuración técnica y setup inicial

## Beneficios Principales

### 1. **Mejor Performance**
- Cache inteligente evita llamadas duplicadas
- Datos se comparten entre componentes automáticamente
- Invalidación granular cuando hay cambios

### 2. **UX Superior**
- Loading states consistentes
- Optimistic updates (cambios instantáneos que se revierten si hay error)
- Retry automático en caso de errores de red

### 3. **Menos Código**
- Elimina useState/useEffect repetitivo
- Error handling centralizado
- Debugging más fácil con DevTools

### 4. **Mejor Mantenibilidad**
- Query keys organizadas por feature
- Hooks reutilizables entre componentes
- Integración limpia con servicios existentes

## Antes de Continuar

**Importante**: Esta implementación mantiene toda la arquitectura de servicios actual. Solo agrega una capa de cache inteligente encima. Los servicios de Firebase no cambian.

---

## 📖 Navegación

**Anterior:** [Colecciones Firebase](../02-arquitectura/03-colecciones-firebase.md) | **Siguiente:** [Estrategia Query Keys](./01-estrategia-query-keys.md)