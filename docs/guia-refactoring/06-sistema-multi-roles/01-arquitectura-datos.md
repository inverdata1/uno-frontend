# Arquitectura de Datos - Sistema Multi-Roles

## Schemas de Base de Datos Actualizados

### 1. Users Collection (Modificado)

```javascript
// Collection: Users/{userId}
{
  uid: "user123",
  email: "juan.perez@gmail.com",
  firstName: "Juan",
  lastName: "Pérez",
  phone: "+584121234567",

  // NUEVO: Sistema de roles múltiples
  roles: ["client", "business"],                    // Array de roles activos
  activeRole: "client",                             // Rol actualmente seleccionado

  // NUEVO: Configuración por rol
  roleConfig: {
    client: {
      defaultAddressId: "addr_client_001",
      preferences: {
        favoriteCategories: ["restaurant", "grocery"],
        notificationSettings: { orders: true, promotions: false }
      }
    },
    business: {
      defaultBusinessId: "business_001",             // Negocio por defecto al entrar
      activeBranchId: "branch_001",                  // Sucursal activa por defecto
      permissions: ["manage_products", "view_analytics"]
    },
    delivery: {                                      // Para futuro
      vehicleType: "motorcycle",
      activeZones: ["caracas_centro", "caracas_este"]
    }
  },

  profileImage: { ... },

  // NUEVO: Sistema de direcciones separado por contexto
  addresses: {
    client: [
      {
        id: "addr_client_001",
        label: "Casa",
        street: "Urb. Los Naranjos, Calle 5 #123",
        city: "Maracay",
        state: "Aragua",
        zipCode: "2103",
        coordinates: { lat: 10.2353, lng: -67.5911 },
        isDefault: true,
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "addr_client_002",
        label: "Oficina",
        street: "Av. Francisco de Miranda, Torre BOD, Piso 12",
        city: "Caracas",
        state: "Distrito Capital",
        zipCode: "1060",
        coordinates: { lat: 10.5019, lng: -66.9143 },
        isDefault: false,
        createdAt: "2024-01-16T09:15:00Z"
      }
    ],

    business: [
      // Las direcciones de business están en la collection Branches
      // Este array solo guarda referencias para quick access
      {
        businessId: "business_001",
        branchId: "branch_001",
        label: "Pizza Express - Centro"
      }
    ]
  },

  preferences: { ... },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### 2. UserBusinessRoles Collection (NUEVO)

```javascript
// Collection: UserBusinessRoles/{roleId}
{
  id: "role_001",
  userId: "user123",
  businessId: "business_001",
  role: "owner",                                    // "owner" | "admin" | "employee"
  permissions: [
    "manage_products",
    "manage_orders",
    "view_analytics",
    "manage_staff"                                  // Solo owners
  ],

  // Para empleados: restricciones adicionales
  restrictions: {
    branchIds: ["branch_001"],                      // Solo puede acceder a estas branches
    maxOrderValue: null,                            // null = sin límite
    canDeleteProducts: false
  },

  invitedBy: "user456",                            // Quien invitó (si no es owner)
  invitedAt: "2024-01-15T14:00:00Z",
  acceptedAt: "2024-01-15T14:30:00Z",
  status: "active",                                // "pending" | "active" | "inactive"
  createdAt: "2024-01-15T14:00:00Z"
}
```

### 3. Businesses Collection (Modificado)

```javascript
// Collection: Businesses/{businessId}
{
  id: "business_001",
  ownerId: "user123",
  businessName: "Pizza Express Maracay",
  slug: "pizza-express-maracay",                   // Para URLs amigables
  category: "restaurant",
  description: "Las mejores pizzas artesanales de Maracay",

  // NUEVO: Configuración multi-branch
  branchConfig: {
    allowMultipleBranches: true,
    defaultBranchId: "branch_001",                 // Branch principal
    totalBranches: 2
  },

  // Media assets
  logo: { ... },
  coverImage: { ... },
  gallery: [ ... ],

  // MOVIDO: Contact info general del negocio
  contact: {
    phone: "+584121234567",
    email: "info@pizzaexpress.ve",
    website: "https://pizzaexpress.ve",
    socialMedia: {
      instagram: "@pizzaexpressve",
      facebook: "PizzaExpressVenezuela"
    }
  },

  // NUEVO: Business settings
  settings: {
    acceptsOnlinePayments: true,
    minimumOrderAmount: 1500,                      // En centavos
    estimatedDeliveryTime: "30-45",                // minutos
    businessHours: {                               // Horario general (branches pueden override)
      monday: { open: "10:00", close: "22:00", closed: false },
      // ... resto de días
    },
    deliveryZones: [                               // Zonas de delivery permitidas
      {
        name: "Maracay Centro",
        coordinates: [ ... ],                      // Polígono de la zona
        deliveryFee: 200                           // Fee en centavos
      }
    ]
  },

  stats: {
    totalBranches: 2,
    totalProducts: 45,
    totalOrders: 1250,
    averageRating: 4.7,
    totalReviews: 89
  },

  status: "active",                                // "active" | "inactive" | "suspended" | "pending_approval"
  createdAt: "2024-01-15T11:00:00Z",
  updatedAt: "2024-01-15T11:00:00Z"
}
```

### 4. Branches Collection (NUEVO)

```javascript
// Collection: Branches/{branchId}
{
  id: "branch_001",
  businessId: "business_001",
  branchName: "Pizza Express - Centro",             // Nombre específico de la sucursal
  branchCode: "PXM-001",                           // Código interno

  // UBICACIÓN ESPECÍFICA de esta branch
  address: {
    street: "Av. Bolívar, C.C. Maracay Plaza, Local 105",
    city: "Maracay",
    state: "Aragua",
    zipCode: "2103",
    coordinates: { lat: 10.2353, lng: -67.5911 },
    landmark: "Frente al Metro de Maracay"
  },

  // CONTACTO ESPECÍFICO de esta branch
  contact: {
    phone: "+584121234567",
    whatsapp: "+584121234567",
    managerName: "Carlos Rodríguez",
    managerPhone: "+584126789012"
  },

  // HORARIOS específicos (pueden diferir del negocio principal)
  businessHours: {
    monday: { open: "09:00", close: "21:00", closed: false },
    // ... puede ser diferente al horario general del business
  },

  // STAFF de esta sucursal específica
  staff: [
    {
      userId: "user456",
      role: "manager",
      permissions: ["manage_orders", "manage_inventory"],
      schedule: {
        monday: { start: "08:00", end: "17:00" },
        // ...
      },
      addedAt: "2024-01-15T11:30:00Z"
    }
  ],

  // CONFIGURACIÓN específica de la branch
  settings: {
    acceptsDelivery: true,
    acceptsPickup: true,
    hasSeating: true,
    capacity: 40,                                  // Número de personas
    parkingAvailable: true,
    features: ["wifi", "air_conditioning", "card_payment"]
  },

  // ESTADÍSTICAS específicas de la branch
  stats: {
    totalOrders: 450,
    averageOrderValue: 2800,
    busyHours: ["12:00-14:00", "19:00-21:00"],
    topProducts: ["product_001", "product_002"]
  },

  status: "active",                                // "active" | "inactive" | "maintenance"
  createdAt: "2024-01-15T11:30:00Z",
  updatedAt: "2024-01-15T11:30:00Z"
}
```

### 5. Products Collection (Modificado para Branches)

```javascript
// Collection: Products/{productId}
{
  id: "product_001",
  businessId: "business_001",

  // NUEVO: Disponibilidad por branch
  availability: {
    global: true,                                  // Disponible en todas las branches por defecto
    branchSpecific: {
      "branch_001": {
        inStock: true,
        quantity: 25,                              // Stock específico de esta branch
        priceOverride: null,                       // Precio diferente (null = usa precio base)
        customizations: []                         // Personalizaciones específicas de branch
      },
      "branch_002": {
        inStock: false,                            // No disponible en esta branch
        quantity: 0,
        priceOverride: 850,                        // Precio diferente en esta branch
        customizations: []
      }
    }
  },

  name: "Pizza Margarita Personal",
  description: "Pizza individual con tomate, mozzarella y albahaca fresca",
  category: "pizza",

  // PRECIO BASE (branches pueden tener overrides)
  basePrice: 800,                                  // 8.00 USD en centavos
  currency: "USD",

  images: [ ... ],
  customizations: [ ... ],
  tags: [ ... ],

  // NUEVO: Analytics por branch
  stats: {
    global: {
      totalOrders: 150,
      averageRating: 4.5
    },
    byBranch: {
      "branch_001": { totalOrders: 90, averageRating: 4.6 },
      "branch_002": { totalOrders: 60, averageRating: 4.4 }
    }
  },

  status: "active",
  createdAt: "2024-01-15T12:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z"
}
```

### 6. Orders Collection (Modificado)

```javascript
// Collection: Orders/{orderId}
{
  id: "order_001",
  customerId: "user123",
  businessId: "business_001",
  branchId: "branch_001",                          // NUEVO: Sucursal específica

  items: [ ... ],
  pricing: { ... },

  // NUEVO: Delivery mejorado con branch context
  delivery: {
    type: "delivery",
    customerAddress: {                             // Dirección del cliente
      id: "addr_client_001",
      street: "Urb. Los Naranjos, Calle 5 #123",
      city: "Maracay",
      coordinates: { lat: 10.2353, lng: -67.5911 }
    },
    originBranch: {                                // Branch que prepara la orden
      id: "branch_001",
      name: "Pizza Express - Centro",
      address: { ... },
      coordinates: { lat: 10.2400, lng: -67.5950 }
    },
    distance: 2.5,                                 // km entre branch y cliente
    estimatedTime: "25-30 min",
    deliveryFee: 200
  },

  // NUEVO: Assignment a branch staff
  assignedTo: {
    userId: "user456",
    role: "manager",
    assignedAt: "2024-01-15T13:05:00Z"
  },

  status: "confirmed",
  statusHistory: [ ... ],
  createdAt: "2024-01-15T13:00:00Z"
}
```

## Queries y Relationships Clave

### 1. User Roles Query
```javascript
// Obtener todos los roles de un usuario
const getUserRoles = (userId) => `
  SELECT ubr.*, b.businessName, b.logo
  FROM UserBusinessRoles ubr
  JOIN Businesses b ON ubr.businessId = b.id
  WHERE ubr.userId = '${userId}' AND ubr.status = 'active'
`;

// Obtener businesses que puede administrar un usuario
const getUserBusinesses = (userId) => `
  SELECT DISTINCT b.*
  FROM Businesses b
  JOIN UserBusinessRoles ubr ON b.id = ubr.businessId
  WHERE ubr.userId = '${userId}' AND ubr.status = 'active'
`;
```

### 2. Branch Management Queries
```javascript
// Obtener branches de un business específico
const getBusinessBranches = (businessId) => `
  SELECT * FROM Branches
  WHERE businessId = '${businessId}' AND status = 'active'
  ORDER BY branchName
`;

// Obtener productos disponibles en una branch específica
const getBranchProducts = (branchId) => `
  SELECT p.*, p.availability.branchSpecific['${branchId}'] as branchAvailability
  FROM Products p
  WHERE p.businessId IN (
    SELECT businessId FROM Branches WHERE id = '${branchId}'
  ) AND (
    p.availability.global = true OR
    p.availability.branchSpecific['${branchId}'].inStock = true
  )
`;
```

### 3. Address Context Queries
```javascript
// Obtener direcciones de cliente
const getClientAddresses = (userId) => `
  SELECT addresses.client
  FROM Users
  WHERE uid = '${userId}'
`;

// Obtener direcciones de business (via branches)
const getBusinessAddresses = (userId) => `
  SELECT b.address, br.branchName
  FROM Branches br
  JOIN Businesses b ON br.businessId = b.id
  JOIN UserBusinessRoles ubr ON b.id = ubr.businessId
  WHERE ubr.userId = '${userId}' AND ubr.status = 'active'
`;
```

## Escenarios de Migración desde Sistema Actual

### 1. Usuarios Existentes
```javascript
// Migration script para usuarios existentes
const migrateExistingUsers = async () => {
  const users = await getUsers({ userRole: { in: ['client', 'business'] } });

  for (const user of users) {
    const updatedUser = {
      ...user,
      roles: [user.userRole],                     // Convert single role to array
      activeRole: user.userRole,
      roleConfig: {
        [user.userRole]: {
          // Migrate existing config based on role
          ...(user.userRole === 'client' && {
            defaultAddressId: user.address?.id,
            preferences: user.preferences
          }),
          ...(user.userRole === 'business' && {
            defaultBusinessId: user.businessProfile?.businessId
          })
        }
      },
      addresses: {
        client: user.userRole === 'client' ? [user.address] : [],
        business: []
      }
    };

    await updateUser(user.uid, updatedUser);
  }
};
```

### 2. Businesses Existentes
```javascript
// Create default branch for existing businesses
const migrateBusinessesToBranches = async () => {
  const businesses = await getAllBusinesses();

  for (const business of businesses) {
    // Create default branch
    const defaultBranch = {
      id: `${business.id}_main`,
      businessId: business.id,
      branchName: `${business.businessName} - Principal`,
      branchCode: "MAIN-001",
      address: business.address,
      contact: business.contact,
      businessHours: business.businessHours,
      staff: [],
      settings: {
        acceptsDelivery: true,
        acceptsPickup: true,
        // ... default settings
      },
      status: "active"
    };

    await createBranch(defaultBranch);

    // Update business with branch config
    await updateBusiness(business.id, {
      branchConfig: {
        allowMultipleBranches: true,
        defaultBranchId: defaultBranch.id,
        totalBranches: 1
      }
    });
  }
};
```

Esta arquitectura resuelve todos los problemas planteados:

1. ✅ **Multi-role**: Users pueden tener múltiples roles simultáneamente
2. ✅ **Role switching**: Sistema de activeRole para cambiar contexto
3. ✅ **Multi-business**: UserBusinessRoles permite gestionar múltiples negocios
4. ✅ **Branch system**: Branches collection con gestión completa por sucursal
5. ✅ **Address separation**: Direcciones separadas por contexto (client/business)
6. ✅ **Extensible**: Fácil agregar nuevos roles (delivery) sin breaking changes