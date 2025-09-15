# Query Keys - Estrategia Distribuida

## Qué Son las Query Keys?

Las query keys son **identificadores únicos** para cada pedazo de data en el cache de TanStack Query. Son como "direcciones" que le dicen al cache qué datos invalidar, actualizar o compartir.

## Enfoque: Distribuido por Feature

En lugar de un archivo gigante centralizado, cada feature maneja sus propias query keys:

### Estructura de Archivos
```
features/
├── auth/queries/
│   ├── user-query-keys.js      # Solo keys de usuarios
│   └── use-user-queries.js     # Hooks que usan esas keys
├── business/queries/
│   ├── business-query-keys.js  # Solo keys de negocios
│   └── use-business-queries.js
├── products/queries/
│   ├── product-query-keys.js
│   └── use-product-queries.js
└── orders/queries/
    ├── order-query-keys.js
    └── use-order-queries.js

shared/queries/
├── storage-query-keys.js       # Solo storage (cross-feature)
└── use-storage-queries.js
```

## Estructura Jerárquica

### Ejemplo: User Query Keys
```javascript
// features/auth/queries/user-query-keys.js
export const userQueryKeys = {
  all: ['users'],                                    // ['users']
  lists: () => [...userQueryKeys.all, 'list'],      // ['users', 'list']
  list: (filters) => [...userQueryKeys.lists(), { filters }], // ['users', 'list', {filters}]
  details: () => [...userQueryKeys.all, 'detail'],  // ['users', 'detail']
  detail: (id) => [...userQueryKeys.details(), id], // ['users', 'detail', 'user123']
  profile: (id) => [...userQueryKeys.detail(id), 'profile'], // ['users', 'detail', 'user123', 'profile']
};
```

## Por Qué Esta Estructura?

### 1. **Invalidación Inteligente**
```javascript
// Invalidar SOLO el usuario específico
queryClient.invalidateQueries({
  queryKey: userQueryKeys.detail('user123')
}); // Solo invalida ['users', 'detail', 'user123']

// Invalidar TODOS los usuarios
queryClient.invalidateQueries({
  queryKey: userQueryKeys.all
}); // Invalida todo lo que empiece con ['users']
```

### 2. **Organización por Feature**
- Cada equipo puede trabajar en su feature sin conflictos
- Cambios en una feature no afectan otras
- Imports más limpios y específicos

### 3. **Cross-Feature Dependencies**
```javascript
// shared/queries/use-storage-queries.js
import { userQueryKeys } from '../../features/auth/queries/user-query-keys';

// Storage puede invalidar datos de usuario después de subir imagen
queryClient.invalidateQueries({
  queryKey: userQueryKeys.all
});
```

## Convenciones de Nombres

### Query Keys
- **Singular para entities**: `userQueryKeys`, `businessQueryKeys`
- **Métodos descriptivos**: `.detail(id)`, `.byOwner(id)`, `.search(query)`
- **Jerarquía clara**: `all` → `lists/details` → específicos

### Archivos
- **Query keys**: `[feature]-query-keys.js`
- **Hooks**: `use-[feature]-queries.js`
- **Kebab-case**: Como el resto del proyecto

## Ventajas del Enfoque Distribuido

### ✅ Mantenibilidad
- Cada feature es independiente
- Fácil localizar y modificar keys específicas
- No hay archivos gigantes difíciles de navegar

### ✅ Escalabilidad  
- Agregar nuevas features no afecta las existentes
- Teams pueden trabajar en paralelo
- Merge conflicts mínimos

### ✅ Performance
- Imports más pequeños (solo lo que necesitas)
- Tree shaking más eficiente
- Cache invalidation más granular

### ❌ vs Enfoque Centralizado
- **Centralizado**: Un archivo con 200+ líneas, merge conflicts constantes
- **Distribuido**: Múltiples archivos pequeños y específicos

---

## 📖 Navegación

**Anterior:** [TanStack Query - Inicio](./00-inicio.md) | **Siguiente:** [Patrones Básicos](./02-patrones-basicos.md)