# Sistema Multi-Roles - Visión General

## Problema Actual

El sistema actual tiene limitaciones fundamentales:

1. **Role único**: `userRole: "client" | "business"` - Un usuario no puede ser ambos
2. **Sin flexibilidad**: No hay sistema de cambio de contexto/modo
3. **Sin multi-business**: Un usuario no puede manejar múltiples negocios
4. **Sin branches**: No hay sistema de sucursales para negocios
5. **UI estática**: No hay sistema dinámico de UI basado en rol activo
6. **Direcciones mezcladas**: No hay separación entre direcciones personales y comerciales

## Visión del Nuevo Sistema

### 1. Multi-Role User System
Un usuario puede tener **múltiples roles simultáneamente**:
- **Client Mode**: Realizar pedidos, gestionar direcciones personales
- **Business Mode**: Gestionar negocios, productos, órdenes recibidas
- **Delivery Mode** (futuro): Aceptar entregas, rutas, etc.

### 2. Context Switching (Role Switching)
- **Selector de modo** en la UI principal
- **Estado global** del modo activo
- **UI dinámica** que cambia completamente según el modo
- **Permisos específicos** por modo activo

### 3. Multi-Business Management
- Un usuario puede **crear/administrar múltiples negocios**
- **Selector de negocio activo** cuando está en Business Mode
- **Invitaciones** para administrar negocios de otros usuarios
- **Roles dentro del negocio** (owner, admin, employee)

### 4. Branch Management System
- **Branches por negocio**: Cada negocio puede tener múltiples sucursales
- **Selector de sucursal activa**
- **Inventario por sucursal**
- **Órdenes por sucursal**
- **Staff por sucursal**

### 5. Address System Contextual
- **Personal Addresses**: Para cuando actúa como cliente
- **Business Addresses**: Para sucursales de negocios
- **Delivery Addresses**: Para entregas (futuro)
- **Default por contexto**: Dirección principal para cada rol

### 6. Dynamic UI System
- **Layouts diferentes** por modo activo
- **Navigation tabs específicas** por rol
- **Componentes condicionales**
- **Theme/colors** por tipo de negocio (opcional)

## Beneficios del Sistema

### Para Usuarios
1. **Flexibilidad total**: Un usuario puede ser cliente Y dueño de negocio
2. **UX simplificada**: Cambio fácil entre modos
3. **Multi-business**: Administrar varios negocios desde una cuenta
4. **Escalabilidad**: Agregar nuevos roles (delivery, admin) sin refactoring

### Para el Negocio (UNO)
1. **Mayor adopción**: Los clientes pueden convertirse en comercios fácilmente
2. **Retención**: Un usuario tiene múltiples razones para usar la app
3. **Network effects**: Los usuarios conectan ambos lados del marketplace
4. **Data insights**: Mejor comprensión del comportamiento usuario

### Para Desarrollo
1. **Arquitectura extensible**: Fácil agregar nuevos roles
2. **UI reutilizable**: Componentes adaptativos por contexto
3. **Separación de concerns**: Lógica clara por rol
4. **Testing**: Casos de prueba específicos por modo

## Casos de Uso Principales

### Caso 1: Cliente que abre negocio
- Usuario inicia como **client**
- Aplica para **business upgrade**
- Ahora puede alternar entre **client mode** y **business mode**
- Como cliente: hace pedidos, gestiona direcciones personales
- Como business: recibe pedidos, gestiona productos e inventario

### Caso 2: Empresario multi-business
- Usuario tiene **business mode** activo
- Posee 3 restaurantes: "Pizza Express", "Burger Palace", "Taco Loco"
- **Selector de negocio**: Cambia entre Pizza Express → Burger Palace
- **Branches**: Pizza Express tiene 2 sucursales (Centro, Norte)
- **Gestión independiente**: Cada negocio/sucursal tiene su inventario

### Caso 3: Adición de delivery role (futuro)
- Usuario ya es **client + business**
- Aplica para **delivery upgrade**
- Ahora tiene 3 modos: **client | business | delivery**
- Como delivery: acepta pedidos, gestiona rutas, ingresos por entregas

## Arquitectura Técnica Overview

### 1. Database Schema
```
Users: {
  uid: string,
  roles: ["client", "business", "delivery"],
  activeRole: "client" | "business" | "delivery",
  profile: { ... },
  addresses: {
    client: [...],
    business: [...]
  }
}

UserBusinessRoles: {
  userId: string,
  businessId: string,
  role: "owner" | "admin" | "employee",
  permissions: [...]
}

Businesses: {
  id: string,
  ownerId: string,
  branches: [...]
}

Branches: {
  id: string,
  businessId: string,
  address: {...},
  staff: [...],
  inventory: [...]
}
```

### 2. Frontend State
```javascript
// Global app state
{
  user: { ... },
  activeRole: "client" | "business" | "delivery",
  activeBusiness: businessId | null,
  activeBranch: branchId | null,
  ui: {
    layout: "client" | "business" | "delivery",
    navigation: [...],
    theme: {...}
  }
}
```

### 3. UI Components
```javascript
// Role-aware components
<RoleProvider>
  <Navigation /> {/* Different tabs per role */}
  <Layout role={activeRole}>
    <ContentArea /> {/* Different screens per role */}
  </Layout>
</RoleProvider>
```

## Próximos Pasos

1. **[Arquitectura de Datos](./01-arquitectura-datos.md)** - Schemas detallados
2. **[Sistema de Roles](./02-sistema-roles.md)** - Lógica de roles y permisos
3. **[UI Dinámica](./03-ui-dinamica.md)** - Sistema de layouts adaptativos
4. **[Gestión Addresses](./04-gestion-addresses.md)** - Direcciones por contexto
5. **[Business & Branches](./05-business-branches.md)** - Gestión multi-negocio
6. **[Implementación](./06-plan-implementacion.md)** - Fases de desarrollo

---

Este sistema está diseñado para ser **altamente flexible** y **fácil de extender** con nuevos roles sin romper funcionalidad existente.