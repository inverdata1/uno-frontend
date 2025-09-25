# Firebase Backend Adapter

Una arquitectura modular que simula tu backend futuro usando Firebase, pero manteniendo la misma estructura de APIs que tendrás en producción.

## 🏗️ Arquitectura

```
shared/api/
├── base-firebase-service.js    # Servicios CRUD base reutilizables
├── firebase-client.js          # Cliente principal con routing
├── resources/
│   ├── users.js               # Endpoints /users/*
│   ├── businesses.js          # Endpoints /businesses/*
│   └── user-modes.js          # Endpoints /user-modes/*
└── index.js                   # Configuración e inicialización
```

## 🚀 Uso Rápido

### 1. Usar en tus Hooks (NO cambia cuando tengas backend)

```javascript
// features/auth/api/use-user-modes.js
import { apiClient } from '../../../shared/config/api-client';

export const useUserModes = () => {
  return useQuery({
    queryKey: ['user-modes'],
    queryFn: () => apiClient.get('/user-modes').then(res => res.data)
  });
};

export const useSwitchMode = () => {
  return useMutation({
    mutationFn: ({ mode, businessId }) =>
      apiClient.post('/user-modes/switch', { mode, businessId }).then(res => res.data)
  });
};
```

### 2. Usar en Componentes

```javascript
import { useUserModes, useSwitchMode } from '../api/use-user-modes';

const ModeSwitcher = () => {
  const { data: userModes, isLoading } = useUserModes();
  const switchMode = useSwitchMode();

  if (isLoading) return <Text>Cargando...</Text>;

  return (
    <View>
      <Text>Modo actual: {userModes.currentMode}</Text>

      <Button onPress={() => switchMode.mutate({ mode: 'client' })}>
        Modo Cliente
      </Button>

      <Button onPress={() => switchMode.mutate({ mode: 'business', businessId: 'biz123' })}>
        Modo Negocio
      </Button>
    </View>
  );
};
```

## 📋 Endpoints Disponibles

### User Modes
- `GET /user-modes` - Obtener modos disponibles del usuario
- `POST /user-modes` - Habilitar nuevo modo
- `POST /user-modes/switch` - Cambiar modo activo
- `PATCH /user-modes/status` - Actualizar estado de modo

### Users
- `GET /users/profile` - Obtener perfil de usuario
- `PUT /users/profile` - Actualizar perfil
- `POST /users/switch-mode` - Cambiar modo (alternativo)
- `POST /users/enable-mode` - Habilitar modo

### Businesses
- `GET /businesses` - Obtener negocios del usuario
- `POST /businesses` - Crear nuevo negocio
- `GET /businesses/{id}` - Obtener negocio específico
- `PUT /businesses/{id}` - Actualizar negocio
- `GET /businesses/{id}/branches` - Obtener sucursales
- `POST /businesses/{id}/branches` - Crear sucursal

## 🔧 Configuración

### Cambiar entre Firebase y Backend Real

```javascript
// shared/config/api-client.js
const USE_FIREBASE = true; // ← Cambiar a false cuando tengas backend
```

### Agregar Nuevo Resource

1. **Crear Resource Class:**

```javascript
// shared/api/resources/orders.js
import { BaseFirebaseService } from '../base-firebase-service';

export class OrdersResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'orders');
  }

  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action || 'index'}`;
    return await this[handler](data, params);
  }

  // GET /orders
  async get_index(data, params) {
    return await this.findAll({ userId: params.userId });
  }

  // POST /orders
  async post_index(data, params) {
    return await this.create({ ...data, userId: params.userId });
  }
}
```

2. **Registrar Resource:**

```javascript
// shared/api/index.js
import { OrdersResource } from './resources/orders';

firebaseClient.registerResource('orders', OrdersResource);
```

3. **Crear Hooks:**

```javascript
// features/orders/api/use-orders.js
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/orders').then(res => res.data)
  });
};
```

## 🗃️ Estructura de Datos Firebase

### Users Collection
```javascript
{
  id: "user123",
  email: "user@email.com",
  firstName: "Juan",
  lastName: "Pérez",

  // Modos disponibles
  modes: {
    client: { status: 'active', createdAt: timestamp },
    business: { status: 'active', createdAt: timestamp }
  },

  // Contexto actual
  currentMode: 'business',
  currentBusinessId: 'biz456',
  currentBranchId: null,
  lastModeSwitch: timestamp
}
```

### Businesses Collection
```javascript
{
  id: "biz456",
  ownerId: "user123",
  name: "Pizza Mario",
  businessType: "restaurant",
  address: "Calle 123",
  status: "active"
}
```

### Branches Collection
```javascript
{
  id: "branch789",
  businessId: "biz456",
  name: "Sucursal Centro",
  address: "Centro Comercial",
  isMain: true,
  status: "active"
}
```

## 🚀 Migración a Backend Real

Cuando tengas tu backend FastAPI listo:

1. **Cambiar flag:** `USE_FIREBASE = false`
2. **Tus hooks NO cambian** - siguen usando los mismos endpoints
3. **Copy-paste lógica** de Firebase Resources a tu backend
4. **¡Listo!** La app funciona igual

## ⚡ Ventajas

- **✅ Desarrollo rápido** - Firebase directo desde la app
- **✅ Estructura correcta** - Simula tu backend futuro
- **✅ Migración fácil** - Cambias un flag y listo
- **✅ Código limpio** - Hooks y components no cambian
- **✅ Escalable** - Fácil agregar nuevos recursos

## 🐛 Debug

```javascript
// Ver recursos registrados
console.log('Resources:', firebaseClient.listResources());

// Ver requests en tiempo real
// Los logs aparecen automáticamente en consola:
// 🔥 Firebase GET /user-modes
// ✅ Firebase GET /user-modes completed
```