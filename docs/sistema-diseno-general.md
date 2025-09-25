# UNO Delivery - Diseño de Sistema General

## Visión Arquitectónica

UNO Delivery es una **plataforma unificada de delivery multi-roles** que permite a los usuarios alternar dinámicamente entre diferentes contextos (Cliente, Negocio, Delivery) desde una sola aplicación. El sistema está diseñado para **escalabilidad**, **flexibilidad de roles** y **experiencia de usuario premium**.

### Principios de Diseño
1. **Single App, Multiple Contexts**: Una app que se transforma según el rol activo
2. **Role-Based Everything**: UI, datos, permisos y navegación cambian por rol
3. **Multi-Business Management**: Usuarios pueden administrar múltiples negocios
4. **Context-Aware Data**: Información filtrada y presentada según contexto activo
5. **Real-time Operations**: Actualizaciones en tiempo real para órdenes y estados
6. **Extensible Architecture**: Fácil agregar nuevos roles sin refactoring mayor

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React Native + Expo)             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Client Mode │ │Business Mode│ │Delivery Mode│ │  Admin Mode │ │
│  │             │ │             │ │  (future)   │ │  (future)   │ │
│  │ • Shopping  │ │ • Dashboard │ │ • Available │ │ • Analytics │ │
│  │ • Orders    │ │ • Products  │ │ • Active    │ │ • Users     │ │
│  │ • Profile   │ │ • Analytics │ │ • Earnings  │ │ • Settings  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              ROLE MANAGEMENT LAYER                          │ │
│  │  • Zustand Store (Role State + Business Context)           │ │
│  │  • Dynamic UI Rendering                                    │ │
│  │  • Permission-Based Components                             │ │
│  │  • Context-Aware Data Fetching                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DATA LAYER                                │ │
│  │  • TanStack Query (Server State)                           │ │
│  │  • Context-Aware Caching                                   │ │
│  │  • Real-time Subscriptions                                 │ │
│  │  • Optimistic Updates                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                   │ HTTPS/WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  API GATEWAY LAYER                          │ │
│  │  • Authentication Middleware (Firebase Token Validation)   │ │
│  │  • Role-Based Access Control (RBAC)                        │ │
│  │  • Request Context (User, Role, Business, Branch)          │ │
│  │  • Rate Limiting & Security                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 BUSINESS LOGIC LAYER                        │ │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │ │
│  │  │  User Service │ │Business Service│ │ Order Service │     │ │
│  │  │               │ │               │ │               │     │ │
│  │  │ • Multi-Role  │ │ • Multi-Branch│ │ • Status Flow │     │ │
│  │  │ • Permissions │ │ • Staff Mgmt  │ │ • Real-time   │     │ │
│  │  │ • Context     │ │ • Analytics   │ │ • Payments    │     │ │
│  │  └───────────────┘ └───────────────┘ └───────────────┘     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DATA ACCESS LAYER                         │ │
│  │  • Repository Pattern                                      │ │
│  │  • Context-Aware Queries                                   │ │
│  │  • Data Validation & Sanitization                          │ │
│  │  • Caching Strategy                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                   │ NoSQL Queries
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Firebase Firestore)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │    Users    │ │ Businesses  │ │  Products   │ │   Orders    │ │
│  │             │ │             │ │             │ │             │ │
│  │ • Multi-    │ │ • Multi-    │ │ • Branch-   │ │ • Context   │ │
│  │   Role      │ │   Branch    │ │   Specific  │ │   Aware     │ │
│  │ • Address   │ │ • Staff     │ │ • Inventory │ │ • Status    │ │
│  │   Context   │ │   Roles     │ │ • Pricing   │ │   History   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Branches   │ │UserBusiness │ │  Analytics  │ │Notifications│ │
│  │             │ │    Roles    │ │             │ │             │ │
│  │ • Location  │ │ • Multi-    │ │ • Business  │ │ • Real-time │ │
│  │ • Staff     │ │   Business  │ │   Metrics   │ │ • Push      │ │
│  │ • Inventory │ │ • Perms     │ │ • Reports   │ │ • Context   │ │
│  │ • Hours     │ │ • Invites   │ │ • Insights  │ │   Based     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Core Technologies
- **React Native + Expo SDK 51+**: Cross-platform mobile development
- **Expo Router**: File-based routing con layouts dinámicos
- **NativeWind v4**: Utility-first styling con theme system
- **TanStack Query v5**: Server state management con caching inteligente
- **Zustand**: Client state management con persistence
- **TanStack Form + Zod**: Form management con validación

### State Management Strategy

#### 1. Client State (Zustand)
```javascript
┌─────────────────────────────────────────┐
│              ZUSTAND STORES             │
├─────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐       │
│  │ Role Store  │ │ Auth Store  │       │
│  │             │ │             │       │
│  │• activeRole │ │• user       │       │
│  │• business   │ │• session    │       │
│  │• branch     │ │• tokens     │       │
│  │• permissions│ │• status     │       │
│  └─────────────┘ └─────────────┘       │
│                                         │
│  ┌─────────────┐ ┌─────────────┐       │
│  │  UI Store   │ │ Cart Store  │       │
│  │             │ │             │       │
│  │• theme      │ │• items      │       │
│  │• navigation │ │• totals     │       │
│  │• modals     │ │• context    │       │
│  │• layout     │ │• checkout   │       │
│  └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────┘
```

#### 2. Server State (TanStack Query)
```javascript
┌─────────────────────────────────────────┐
│           TANSTACK QUERY LAYER          │
├─────────────────────────────────────────┤
│  Context-Aware Query Keys:              │
│  ['orders', role, businessId, branchId] │
│  ['products', businessId, branchId]     │
│  ['analytics', businessId, timeRange]   │
│                                         │
│  Features:                              │
│  • Role-based caching                   │
│  • Automatic invalidation on role switch│
│  • Optimistic updates                   │
│  • Background refetching                │
│  • Error boundaries                     │
└─────────────────────────────────────────┘
```

### Dynamic UI System

#### 1. Role-Based Routing
```
app/
├── (auth)/                    # Authentication flow
├── (onboarding)/             # Initial user onboarding
├── (main)/                   # Main app container
│   ├── (client)/            # Client mode screens
│   │   ├── home.jsx
│   │   ├── search.jsx
│   │   ├── orders/
│   │   └── profile.jsx
│   ├── (business)/          # Business mode screens
│   │   ├── dashboard.jsx
│   │   ├── orders/
│   │   ├── products/
│   │   ├── analytics.jsx
│   │   └── staff/
│   └── (delivery)/          # Delivery mode screens (future)
│       ├── available.jsx
│       ├── active.jsx
│       └── earnings.jsx
└── role-switcher.jsx        # Global role switching modal
```

#### 2. Adaptive Component System
```javascript
// Component adapts based on active role
<OrderCard
  order={order}
  variant="auto"    // Automatically chooses client/business/delivery variant
  context={context} // Additional context for business (branch, permissions)
/>

// Permission-based rendering
<PermissionGuard permission="products.create">
  <CreateProductButton />
</PermissionGuard>

// Role-conditional components
<RoleConditional
  client={<ClientOrderView />}
  business={<BusinessOrderView />}
  delivery={<DeliveryOrderView />}
/>
```

### Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Component  │───▶│  Zustand Store  │───▶│ TanStack Query  │
│                 │    │                 │    │                 │
│ • User Action   │    │ • Role Context  │    │ • Context-Aware │
│ • Role Switch   │    │ • UI State      │    │   Queries       │
│ • Form Submit   │    │ • Permissions   │    │ • Caching       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        │                        │
         │                        ▼                        ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │ State Updates   │    │   API Calls     │
         │              │                 │    │                 │
         │              │ • Role Changes  │    │ • HTTP Requests │
         └──────────────┤ • UI Updates    │    │ • WebSocket     │
                        │ • Invalidations │    │ • Mutations     │
                        └─────────────────┘    └─────────────────┘
```

---

## Backend Architecture

### Core Technologies
- **FastAPI**: Modern, high-performance Python web framework
- **Firebase Admin SDK**: User authentication y Firestore access
- **Pydantic**: Data validation y serialization
- **Redis**: Caching y session management
- **WebSocket**: Real-time communications
- **Celery**: Background task processing

### API Design Principles

#### 1. RESTful with Context Awareness
```javascript
// Context-aware endpoints
GET /api/v1/orders                    # Returns orders based on user's active role
GET /api/v1/orders?context=business   # Force business context
GET /api/v1/orders?business_id=123    # Specific business context
GET /api/v1/orders?branch_id=456      # Specific branch context

// Role-specific endpoints
GET /api/v1/client/orders             # Client-specific orders
GET /api/v1/business/orders           # Business-specific orders
GET /api/v1/business/analytics        # Business analytics
```

#### 2. Request Context Middleware
```python
# Every request includes context
class RequestContext:
    user_id: str
    active_role: str
    business_id: Optional[str]
    branch_id: Optional[str]
    permissions: List[str]

# Middleware extracts context from JWT token
@app.middleware("http")
async def context_middleware(request: Request, call_next):
    # Extract Firebase token
    token = extract_token(request)
    user = await verify_firebase_token(token)

    # Build request context
    context = await build_request_context(user)
    request.state.context = context

    return await call_next(request)
```

### Service Layer Architecture

#### 1. Domain-Driven Services
```python
┌─────────────────────────────────────────┐
│             SERVICE LAYER               │
├─────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐   │
│  │  UserService  │ │BusinessService│   │
│  │               │ │               │   │
│  │• role_mgmt()  │ │• multi_branch │   │
│  │• permissions()│ │• staff_mgmt() │   │
│  │• context()    │ │• analytics()  │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │
│  │ OrderService  │ │ProductService │   │
│  │               │ │               │   │
│  │• status_flow()│ │• inventory()  │   │
│  │• real_time()  │ │• pricing()    │   │
│  │• payments()   │ │• categories() │   │
│  └───────────────┘ └───────────────┘   │
└─────────────────────────────────────────┘
```

#### 2. Permission System
```python
class PermissionService:
    @staticmethod
    async def check_permission(
        user_id: str,
        permission: str,
        context: RequestContext
    ) -> bool:
        # Get user's system roles
        user = await UserRepository.get_by_id(user_id)
        system_perms = get_system_permissions(user.roles)

        # Get business-specific permissions
        business_perms = []
        if context.business_id:
            role = await UserBusinessRoleRepository.get_user_role(
                user_id, context.business_id
            )
            business_perms = get_business_permissions(role)

        all_permissions = system_perms + business_perms
        return permission in all_permissions

# Usage in endpoints
@router.post("/products")
async def create_product(
    product: ProductCreateSchema,
    context: RequestContext = Depends(get_context)
):
    # Check permission
    if not await PermissionService.check_permission(
        context.user_id, "products.create", context
    ):
        raise HTTPException(403, "Insufficient permissions")

    # Business logic
    return await ProductService.create(product, context)
```

### Real-time System

#### 1. WebSocket Architecture
```python
┌─────────────────────────────────────────┐
│           WEBSOCKET LAYER               │
├─────────────────────────────────────────┤
│  Connection Manager:                    │
│  • User-specific connections            │
│  • Role-based message routing           │
│  • Business/branch subscriptions        │
│                                         │
│  Event Types:                           │
│  • ORDER_STATUS_CHANGED                 │
│  • NEW_ORDER (business)                 │
│  • INVENTORY_UPDATED                    │
│  • ROLE_SWITCHED                        │
│  • BUSINESS_NOTIFICATION                │
└─────────────────────────────────────────┘

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, List[str]] = {}

    async def subscribe_to_business(self, user_id: str, business_id: str):
        """Subscribe user to business-specific events"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = []
        self.user_subscriptions[user_id].append(f"business:{business_id}")

    async def broadcast_to_business(self, business_id: str, message: dict):
        """Send message to all users subscribed to business"""
        for user_id, subscriptions in self.user_subscriptions.items():
            if f"business:{business_id}" in subscriptions:
                await self.send_to_user(user_id, message)
```

---

## Database Architecture

### Firestore Collection Design

#### 1. Core Collections with Multi-Role Support

```javascript
Users: {
  uid: string,                          // Firebase Auth UID
  email: string,
  profile: { firstName, lastName, phone, avatar },

  // Multi-role system
  roles: ["client", "business"],        // Array of active roles
  activeRole: "client",                 // Currently selected role

  // Role-specific configuration
  roleConfig: {
    client: {
      defaultAddressId: string,
      preferences: object
    },
    business: {
      defaultBusinessId: string,
      activeBranchId: string
    }
  },

  // Context-separated addresses
  addresses: {
    client: [AddressSchema],            // Personal delivery addresses
    business: [BusinessAddressRef]      // References to business branches
  }
}

UserBusinessRoles: {
  id: string,
  userId: string,                       // Reference to Users
  businessId: string,                   // Reference to Businesses
  role: "owner" | "admin" | "manager" | "employee",
  permissions: [string],                // Granular permissions
  restrictions: {
    branchIds: [string],                // Restricted to specific branches
    maxOrderValue: number
  },
  invitedBy: string,                    // Who invited this user
  status: "pending" | "active"
}

Businesses: {
  id: string,
  ownerId: string,                      // Primary owner
  businessName: string,
  category: string,

  // Multi-branch configuration
  branchConfig: {
    allowMultipleBranches: boolean,
    defaultBranchId: string,
    totalBranches: number
  },

  // Business-level settings
  settings: {
    deliveryZones: [ZoneSchema],
    businessHours: HoursSchema,
    minimumOrderAmount: number
  }
}

Branches: {
  id: string,
  businessId: string,                   // Parent business
  branchName: string,
  branchCode: string,                   // Internal identifier

  // Branch-specific data
  address: AddressSchema,
  contact: ContactSchema,
  businessHours: HoursSchema,           // Can override business hours

  // Branch staff and settings
  staff: [StaffMemberSchema],
  settings: {
    acceptsDelivery: boolean,
    acceptsPickup: boolean,
    capacity: number,
    features: [string]
  }
}

Products: {
  id: string,
  businessId: string,

  // Branch-specific availability
  availability: {
    global: boolean,                    // Available in all branches
    branchSpecific: {
      [branchId]: {
        inStock: boolean,
        quantity: number,
        priceOverride: number
      }
    }
  },

  // Product data
  name: string,
  basePrice: number,
  images: [ImageSchema],
  customizations: [CustomizationSchema]
}

Orders: {
  id: string,
  customerId: string,
  businessId: string,
  branchId: string,                     // Specific branch handling order

  // Context-aware delivery
  delivery: {
    customerAddress: AddressSchema,     // Where to deliver
    originBranch: {                     // Where it's prepared
      id: string,
      address: AddressSchema,
      coordinates: GeoPoint
    },
    distance: number,
    estimatedTime: string
  },

  // Branch assignment
  assignedTo: {
    userId: string,
    role: string,
    assignedAt: timestamp
  }
}
```

#### 2. Indexes for Performance

```javascript
// Multi-dimensional queries require composite indexes
Composite Indexes: [
  // User business access
  { collection: 'UserBusinessRoles', fields: [
    { field: 'userId', mode: 'ASCENDING' },
    { field: 'status', mode: 'ASCENDING' }
  ]},

  // Business branch queries
  { collection: 'Branches', fields: [
    { field: 'businessId', mode: 'ASCENDING' },
    { field: 'status', mode: 'ASCENDING' }
  ]},

  // Product availability by branch
  { collection: 'Products', fields: [
    { field: 'businessId', mode: 'ASCENDING' },
    { field: 'availability.global', mode: 'ASCENDING' },
    { field: 'status', mode: 'ASCENDING' }
  ]},

  // Orders by context
  { collection: 'Orders', fields: [
    { field: 'businessId', mode: 'ASCENDING' },
    { field: 'branchId', mode: 'ASCENDING' },
    { field: 'status', mode: 'ASCENDING' },
    { field: 'createdAt', mode: 'DESCENDING' }
  ]}
]
```

### Data Consistency Patterns

#### 1. Multi-Document Transactions
```python
# When user switches business context, update multiple docs atomically
@db.transaction
async def switch_user_business_context(
    transaction,
    user_id: str,
    business_id: str,
    branch_id: str
):
    # Update user's active business
    user_ref = db.collection('Users').document(user_id)
    transaction.update(user_ref, {
        'roleConfig.business.defaultBusinessId': business_id,
        'roleConfig.business.activeBranchId': branch_id
    })

    # Log the context switch for analytics
    activity_ref = db.collection('UserActivity').document()
    transaction.set(activity_ref, {
        'userId': user_id,
        'action': 'business_context_switch',
        'businessId': business_id,
        'timestamp': firestore.SERVER_TIMESTAMP
    })
```

#### 2. Eventual Consistency for Analytics
```python
# Aggregate data is eventually consistent
class BusinessAnalytics:
    def __init__(self, business_id: str):
        self.business_id = business_id

    async def update_order_metrics(self, order: Order):
        """Update business metrics when order status changes"""
        # Immediate: Update order document
        await OrderRepository.update_status(order.id, order.status)

        # Eventual: Queue analytics update
        await analytics_queue.enqueue(
            'update_business_metrics',
            business_id=self.business_id,
            branch_id=order.branch_id,
            order_value=order.total,
            timestamp=order.updated_at
        )
```

---

## System Integration & Data Flow

### 1. User Role Switch Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │  Database   │    │ Real-time   │
│             │    │             │    │             │    │  Updates    │
│ Role Switch │───▶│ Validate    │───▶│ Update User │───▶│ Notify      │
│ Request     │    │ Permissions │    │ Context     │    │ Devices     │
│             │    │             │    │             │    │             │
│ Update UI   │◀───│ Return New  │◀───│ Fetch Role  │    │ Sync State  │
│ & State     │    │ Context     │    │ Data        │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Order Processing Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Business   │    │  Delivery   │    │   System    │
│             │    │             │    │             │    │             │
│ Create      │───▶│ Receive     │───▶│ Assign      │───▶│ Analytics   │
│ Order       │    │ Notification│    │ Driver      │    │ Update      │
│             │    │             │    │             │    │             │
│ Track       │◀───│ Update      │◀───│ Update      │◀───│ Real-time   │
│ Status      │    │ Status      │    │ Location    │    │ Sync        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 3. Multi-Business Management Flow
```
Business Owner switches between businesses:

1. Frontend: User selects "Pizza Express" from business list
2. Zustand: Updates activeBusiness, triggers branch loading
3. TanStack Query: Invalidates old business data, fetches new
4. Backend: Validates user has permissions for selected business
5. Database: Queries branch-specific data, products, orders
6. UI: Re-renders dashboard with Pizza Express context
7. Real-time: Subscribes to Pizza Express notifications
```

---

## Performance & Scalability

### Frontend Optimizations
- **Selective Subscriptions**: Zustand granular state subscriptions
- **Query Optimization**: Context-aware caching strategies
- **Lazy Loading**: Role-specific screens loaded on demand
- **Image Optimization**: WebP format with multiple resolutions
- **Bundle Splitting**: Separate bundles per role for faster loading

### Backend Optimizations
- **Redis Caching**: Frequently accessed data cached by context
- **Connection Pooling**: Database connection optimization
- **Background Jobs**: Heavy operations processed asynchronously
- **Rate Limiting**: Role-based API rate limits
- **CDN Integration**: Static assets served from edge locations

### Database Optimizations
- **Composite Indexes**: Multi-field queries optimized
- **Sharding Strategy**: Large collections partitioned by business
- **Read Replicas**: Analytics queries served from read replicas
- **Data Archival**: Old orders archived to separate collections
- **Denormalization**: Critical data duplicated for performance

---

## Security Architecture

### Authentication & Authorization
- **Firebase Auth**: Secure user authentication with JWT tokens
- **Role-Based Access Control**: Granular permissions per business context
- **API Gateway Security**: Request validation and rate limiting
- **Data Encryption**: Sensitive data encrypted at rest and in transit

### Data Privacy
- **Context Isolation**: Users only see data for their active context
- **Permission Validation**: Every API call validates user permissions
- **Audit Logging**: All sensitive operations logged for compliance
- **GDPR Compliance**: Data deletion and export capabilities

---

## Monitoring & Operations

### System Monitoring
- **Application Metrics**: Performance tracking per role/context
- **Error Tracking**: Context-aware error reporting
- **User Analytics**: Role switching patterns and engagement
- **Business Intelligence**: Cross-business performance insights

### DevOps Strategy
- **CI/CD Pipeline**: Automated testing and deployment
- **Feature Flags**: Gradual rollout of new role features
- **A/B Testing**: UI/UX experiments per role context
- **Health Checks**: Multi-service health monitoring

---

## Future Extensibility

### New Role Integration
Adding delivery role requires:
1. **Database**: New delivery-specific schemas
2. **Backend**: Delivery service layer and APIs
3. **Frontend**: Delivery UI components and navigation
4. **Permissions**: Delivery-specific permission system

### Scaling Considerations
- **Microservices Migration**: Service decomposition as system grows
- **Multi-Region**: Geographic distribution for better performance
- **Event-Driven Architecture**: Async communication between services
- **Machine Learning**: Predictive analytics and recommendations

Este diseño de sistema proporciona una base sólida y extensible para el crecimiento futuro de UNO Delivery mientras mantiene la flexibilidad y performance necesarias para una excelente experiencia de usuario.