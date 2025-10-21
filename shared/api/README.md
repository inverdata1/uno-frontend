# Firebase Backend Adapter

Una arquitectura modular que simula tu backend futuro usando Firebase, pero manteniendo la misma estructura de APIs que tendrás en producción.

## 🏗️ Arquitectura

```
shared/api/
├── base-firebase-service.js    # Servicios CRUD base reutilizables
├── firebase-client.js          # Cliente principal con routing (interceptor)
├── index.js                   # Configuración e inicialización
├── seeder.js                  # Seeder principal que ejecuta todos los seeders
├── {resource-name}/           # Carpeta por recurso
│   ├── collection.js          # Schema, constantes y definición de la colección
│   ├── resource.js            # Lógica de endpoints y operaciones CRUD
│   └── seeder.js              # (Opcional) Datos iniciales para la colección
├── user-types/
│   ├── collection.js
│   ├── resource.js
│   └── seeder.js
├── addresses/
│   ├── collection.js
│   └── resource.js
└── ...más recursos
```

## 📐 Estándar de Estructura

Cada recurso sigue un patrón consistente de carpetas y archivos:

### 🗂️ Estructura de Carpetas

```
shared/api/{resource-name}/
├── collection.js    # Definición del schema y constantes
├── resource.js      # Lógica de endpoints (CRUD y custom)
└── seeder.js        # (Opcional) Datos de prueba/iniciales
```

### 📄 collection.js

Define el schema, constantes y configuración de Firestore:

- `COLLECTION_NAME` - Nombre de la colección en Firestore
- `COLLECTION_SCHEMA` - Documentación del schema
- Constantes del recurso (ej: `USER_TYPES`, `ORDER_STATUS`)
- `FIRESTORE_RULES` - Reglas de seguridad sugeridas
- `REQUIRED_INDEXES` - (Opcional) Índices necesarios

### 📄 resource.js

Implementa la lógica de endpoints usando el patrón interceptor:

- Extiende `BaseFirebaseService`
- Implementa método `handle()` que rutea a handlers específicos
- Naming convention: `{method}_{action}` (ej: `get_index`, `post_id`, `get_id_permissions`)
- Cada handler corresponde a un endpoint específico

### 📄 seeder.js (Opcional)

Provee datos iniciales o de prueba:

- Datos de ejemplo constantes
- Función `seed{ResourceName}()` que verifica existencia antes de crear
- Se ejecuta desde el seeder principal `shared/api/seeder.js`

### 🔄 FirebaseClient (Interceptor)

El `firebase-client.js` actúa como interceptor que:

1. Recibe requests HTTP estándar (GET, POST, PUT, PATCH, DELETE)
2. Parsea el endpoint: `/users/profile` → resource: `users`, action: `profile`
3. Rutea al resource handler correspondiente
4. El resource ejecuta el método: `get_profile()`
5. Retorna la respuesta

Esto permite cambiar de Firebase a un backend real cambiando solo un flag.

## 🚀 Uso Rápido

### 1. Usar en tus Hooks (NO cambia cuando tengas backend)

```javascript
// shared/hooks/use-user-type.js
import { apiClient } from '../config/api-client';

export const useUserType = () => {
  return useQuery({
    queryKey: ['user-types'],
    queryFn: () => apiClient.get('/user-modes').then(res => res.data)
  });
};

export const useSwitchUserType = () => {
  return useMutation({
    mutationFn: ({ userType, businessId }) =>
      apiClient.post('/user-modes/switch', { mode: userType, businessId }).then(res => res.data)
  });
};
```

### 2. Usar en Componentes

```javascript
import { useCurrentUserType, useSwitchUserType } from '../hooks/use-user-type';

const ModeSwitcher = () => {
  const { currentUserType, availableUserTypes, isLoading } = useCurrentUserType();
  const switchUserType = useSwitchUserType();

  if (isLoading) return <Text>Cargando...</Text>;

  return (
    <View>
      <Text>Tipo de usuario actual: {currentUserType}</Text>

      <Button onPress={() => switchUserType.mutate({ userType: 'client' })}>
        Modo Cliente
      </Button>

      <Button onPress={() => switchUserType.mutate({ userType: 'business', businessId: 'biz123' })}>
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

1. **Crear Carpeta y Collection:**

```javascript
// shared/api/orders/collection.js
export const COLLECTION_NAME = 'orders';

export const COLLECTION_SCHEMA = {
  id: 'string (auto-generated)',
  userId: 'string (required)',
  businessId: 'string (required)',
  items: 'array (required)',
  total: 'number (required)',
  status: 'string (required)',
  createdAt: 'Timestamp (auto)',
  updatedAt: 'Timestamp (auto)'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const FIRESTORE_RULES = `
  match /orders/{orderId} {
    allow read, write: if request.auth != null
      && request.auth.uid == resource.data.userId;
  }
`;
```

2. **Crear Resource Class:**

```javascript
// shared/api/orders/resource.js
import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME } from './collection';

export class OrdersResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace('/', '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in OrdersResource`);
    }

    return await this[handler](data, params);
  }

  // GET /orders
  async get_index(data, params) {
    const { userId } = params;
    return await this.findAll({ userId });
  }

  // POST /orders
  async post_index(data, params) {
    const { userId } = params;
    return await this.create({ ...data, userId });
  }

  // GET /orders/{id}
  async get_id(data, params) {
    const { id } = params;
    return await this.findById(id);
  }
}
```

3. **(Opcional) Crear Seeder:**

```javascript
// shared/api/orders/seeder.js
import { OrdersResource } from './resource.js';
import { ORDER_STATUS } from './collection.js';

const ordersResource = new OrdersResource();

export const SAMPLE_ORDERS = [
  {
    userId: 'user123',
    businessId: 'biz456',
    items: [{ productId: 'prod1', quantity: 2, price: 10 }],
    total: 20,
    status: ORDER_STATUS.PENDING
  }
];

export const seedOrders = async () => {
  console.log('🌱 Seeding orders...');

  for (const order of SAMPLE_ORDERS) {
    const existing = await ordersResource.findOne([
      ['userId', '==', order.userId]
    ]);

    if (!existing) {
      await ordersResource.create(order);
      console.log(`✅ Created order`);
    }
  }

  console.log('🎉 Orders seeding completed');
};
```

4. **Registrar Resource:**

```javascript
// shared/api/index.js
import { OrdersResource } from './orders/resource';

firebaseClient.registerResource('orders', OrdersResource);
```

5. **Crear Hooks:**

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