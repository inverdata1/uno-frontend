# Colecciones Firebase - Estructura de Base de Datos

## Visión General

La base de datos usa Firestore con estructura NoSQL optimizada para la app unificada. Cada colección está diseñada para escalabilidad y eficiencia de queries.

## Convenciones de Nombres

### Colecciones
- **PascalCase**: `Users`, `Businesses`, `Products`, `Orders`
- **Singular/Plural**: Plural para colecciones (`Users` no `User`)
- **Descriptivos**: Nombres claros que indican el contenido

### Documentos
- **camelCase para campos**: `firstName`, `businessName`, `createdAt`
- **IDs**: Auto-generados por Firebase o UIDs para usuarios
- **Timestamps**: Siempre `createdAt` y `updatedAt`

### Subcollections
- **camelCase**: `orderItems`, `businessHours`, `socialPosts`
- **Relación clara**: Nombre indica relación con documento padre

## Estructura de Colecciones

### Users
```javascript
// Collection: Users/{userId}
{
  uid: "user123",                    // Firebase Auth UID
  email: "user@example.com",
  firstName: "Juan",
  lastName: "Pérez",
  phone: "+584121234567",
  userRole: "client" | "business",   // Role unificado
  profileImage: {
    url: "https://firebase...",
    fileName: "profile_123.jpg",
    uploadedAt: "2024-01-15T10:30:00Z"
  },
  address: {
    street: "Av. Francisco de Miranda, Edif. Torre Exa, Piso 15",
    city: "Caracas",
    state: "Distrito Capital",
    zipCode: "1060",
    coordinates: {
      lat: 10.5019,
      lng: -66.9143
    }
  },
  businessProfile: {               // Solo si userRole === 'business'
    businessId: "business456",     // Referencia a documento en Businesses
    applicationStatus: "approved" | "pending" | "rejected",
    appliedAt: "2024-01-15T10:30:00Z",
    approvedAt: "2024-01-16T14:20:00Z"
  },
  preferences: {
    notifications: true,
    language: "es",
    theme: "light" | "dark"
  },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Businesses
```javascript
// Collection: Businesses/{businessId}
{
  id: "business456",
  ownerId: "user123",              // Referencia a Users
  businessName: "Arepa Gourmet Valencia",
  category: "restaurant",          // restaurant, store, service
  description: "Arepas artesanales y comida tradicional venezolana",
  logo: {
    url: "https://firebase...",
    fileName: "logo_456.jpg",
    uploadedAt: "2024-01-15T11:00:00Z"
  },
  coverImage: {
    url: "https://firebase...",
    fileName: "cover_456.jpg",
    uploadedAt: "2024-01-15T11:00:00Z"
  },
  contact: {
    phone: "+584121234567",
    email: "contacto@arepagourmet.ve",
    whatsapp: "+584121234567"
  },
  address: {
    street: "Av. Bolívar Norte, C.C. Crystal Plaza, Local 105",
    city: "Valencia",
    state: "Carabobo",
    zipCode: "2001",
    coordinates: {
      lat: 10.1621,
      lng: -68.0077
    }
  },
  businessHours: {
    monday: { open: "08:00", close: "22:00", closed: false },
    tuesday: { open: "08:00", close: "22:00", closed: false },
    wednesday: { open: "08:00", close: "22:00", closed: false },
    thursday: { open: "08:00", close: "22:00", closed: false },
    friday: { open: "08:00", close: "23:00", closed: false },
    saturday: { open: "09:00", close: "23:00", closed: false },
    sunday: { open: "09:00", close: "21:00", closed: false }
  },
  stats: {
    totalOrders: 0,
    averageRating: 0,
    totalReviews: 0
  },
  status: "active" | "inactive" | "suspended",
  createdAt: "2024-01-15T11:00:00Z",
  updatedAt: "2024-01-15T11:00:00Z"
}
```

### Products
```javascript
// Collection: Products/{productId}
{
  id: "product789",
  businessId: "business456",       // Referencia a Businesses
  name: "Arepa Reina Pepiada",
  description: "Arepa rellena de pollo desmechado con aguacate y mayonesa",
  category: "main-course",         // appetizer, main-course, dessert, beverage
  price: 800,                      // En centavos para evitar decimales (8.00 USD)
  currency: "USD",
  images: [
    {
      url: "https://firebase...",
      fileName: "product1.jpg",
      uploadedAt: "2024-01-15T12:00:00Z"
    }
  ],
  availability: {
    inStock: true,
    quantity: null,                // null = unlimited, number = limited stock
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  },
  customizations: [
    {
      name: "Nivel de picante",
      options: ["Suave", "Medio", "Picante"],
      required: false,
      multiSelect: false
    }
  ],
  tags: ["venezolana", "popular", "tradicional"],
  stats: {
    totalOrders: 0,
    averageRating: 0,
    totalReviews: 0
  },
  status: "active" | "inactive",
  createdAt: "2024-01-15T12:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z"
}
```

### Orders
```javascript
// Collection: Orders/{orderId}
{
  id: "order001",
  customerId: "user123",           // Referencia a Users
  businessId: "business456",       // Referencia a Businesses
  items: [
    {
      productId: "product789",     // Referencia a Products
      productName: "Arepa Reina Pepiada", // Snapshot para historial
      quantity: 2,
      unitPrice: 800,
      customizations: [
        {
          name: "Nivel de picante",
          selected: ["Medio"]
        }
      ],
      subtotal: 1600
    }
  ],
  pricing: {
    subtotal: 1600,                // 16.00 USD
    deliveryFee: 300,              // 3.00 USD
    tip: 200,                      // 2.00 USD
    tax: 0,                        // Para futuro uso
    total: 2100,                   // 21.00 USD
    currency: "USD"
  },
  delivery: {
    type: "delivery" | "pickup",
    address: {
      street: "Urb. Los Naranjos, Calle 5 con Av. Principal",
      city: "Maracay", 
      coordinates: {
        lat: 10.2353,
        lng: -67.5911
      }
    },
    estimatedTime: "45-60 min",
    actualTime: null,
    deliveryPerson: null           // Para futuro uso
  },
  payment: {
    method: "cash" | "card" | "digital",
    status: "pending" | "completed" | "failed",
    transactionId: null,           // Para futuro uso
    paidAt: null
  },
  status: "pending" | "confirmed" | "preparing" | "ready" | "on_way" | "delivered" | "cancelled",
  statusHistory: [
    {
      status: "pending",
      timestamp: "2024-01-15T13:00:00Z",
      note: "Orden recibida"
    },
    {
      status: "confirmed", 
      timestamp: "2024-01-15T13:02:00Z",
      note: "Orden confirmada por el restaurante"
    }
  ],
  specialInstructions: "Sin guasacaca adicional",
  createdAt: "2024-01-15T13:00:00Z",
  updatedAt: "2024-01-15T13:02:00Z"
}
```

## Reglas de Seguridad Firestore

### Usuarios
```javascript
// rules/users.rules
match /Users/{userId} {
  // Solo el propio usuario puede leer/escribir sus datos
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  // Información pública puede ser leída por usuarios autenticados
  allow read: if request.auth != null && 
    resource.data.keys().hasOnly(['firstName', 'lastName', 'profileImage']);
}
```

### Businesses
```javascript
// rules/businesses.rules
match /Businesses/{businessId} {
  // Cualquier usuario autenticado puede leer businesses públicos
  allow read: if request.auth != null && resource.data.status == 'active';
  
  // Solo el owner puede escribir
  allow write: if request.auth != null && 
    request.auth.uid == resource.data.ownerId;
}
```

### Products
```javascript
// rules/products.rules
match /Products/{productId} {
  // Productos activos pueden ser leídos por usuarios autenticados
  allow read: if request.auth != null && resource.data.status == 'active';
  
  // Solo el business owner puede escribir
  allow write: if request.auth != null && 
    isBusinessOwner(request.auth.uid, resource.data.businessId);
}
```

### Orders
```javascript
// rules/orders.rules
match /Orders/{orderId} {
  // Solo el customer o business owner pueden leer
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.customerId || 
     isBusinessOwner(request.auth.uid, resource.data.businessId));
  
  // Solo el customer puede crear órdenes
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.customerId;
  
  // Solo el business owner puede actualizar status
  allow update: if request.auth != null && 
    isBusinessOwner(request.auth.uid, resource.data.businessId) &&
    onlyStatusChanged();
}
```

## Patrones para Nuevas Features

### Agregar Nueva Colección
1. **Definir Schema**: Seguir patrones de naming y estructura
2. **Crear Service**: `shared/services/[feature]-service.js`
3. **Definir Query Keys**: `features/[feature]/queries/[feature]-query-keys.js`
4. **Crear Queries**: `features/[feature]/queries/use-[feature]-queries.js`
5. **Security Rules**: Definir reglas de acceso en Firestore
6. **Indexes**: Crear indexes necesarios para queries complejas

### Agregar Campo a Colección Existente
1. **Backward Compatibility**: Campo opcional o con valor default
2. **Migration Strategy**: Plan para poblar campo en datos existentes
3. **Query Updates**: Actualizar queries que filtren por nuevo campo
4. **Security Rules**: Actualizar reglas si afectan permisos

## Indexes Requeridos

### Composite Indexes
```javascript
// Businesses por categoría y location
{ collection: 'Businesses', fields: [
  { field: 'category', mode: 'ASCENDING' },
  { field: 'address.city', mode: 'ASCENDING' },
  { field: 'status', mode: 'ASCENDING' }
]}

// Products por business y availability
{ collection: 'Products', fields: [
  { field: 'businessId', mode: 'ASCENDING' },
  { field: 'availability.inStock', mode: 'ASCENDING' },
  { field: 'status', mode: 'ASCENDING' }
]}

// Orders por customer y status
{ collection: 'Orders', fields: [
  { field: 'customerId', mode: 'ASCENDING' },
  { field: 'status', mode: 'ASCENDING' },
  { field: 'createdAt', mode: 'DESCENDING' }
]}

// Orders por business y status
{ collection: 'Orders', fields: [
  { field: 'businessId', mode: 'ASCENDING' },
  { field: 'status', mode: 'ASCENDING' },
  { field: 'createdAt', mode: 'DESCENDING' }
]}
```

Esta estructura está diseñada para soportar la app unificada y escalar con nuevas features.

---

## 📖 Navegación

**Anterior:** [Stack Tecnológico](./02-stack-tecnologico.md) | **Siguiente:** [TanStack Query - Inicio](../03-tanstack-query/00-inicio.md)