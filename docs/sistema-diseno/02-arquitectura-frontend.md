# Arquitectura Frontend - UNO Delivery

## Overview Tecnológico

La arquitectura frontend está diseñada para manejar la complejidad de múltiples roles con una experiencia de usuario fluida y performante.

### Core Technologies Stack

```javascript
┌─────────────────────────────────────────┐
│             FRONTEND STACK              │
├─────────────────────────────────────────┤
│  React Native + Expo SDK 51+           │
│  ├─ Cross-platform mobile development  │
│  ├─ Hot reload y fast refresh          │
│  └─ Native module access               │
│                                         │
│  Expo Router (File-based)              │
│  ├─ Dynamic routing por roles          │
│  ├─ Layout nesting                     │
│  └─ Type-safe navigation               │
│                                         │
│  NativeWind v4                         │
│  ├─ Utility-first styling             │
│  ├─ Theme system                       │
│  └─ Responsive design                  │
│                                         │
│  Zustand (State Management)            │
│  ├─ Role y context state              │
│  ├─ Persistence middleware            │
│  └─ Reactive subscriptions            │
│                                         │
│  TanStack Query v5                     │
│  ├─ Server state management           │
│  ├─ Context-aware caching             │
│  └─ Background sync                   │
└─────────────────────────────────────────┘
```

## State Management Architecture

### Zustand Multi-Store Strategy

```javascript
// shared/stores/role-store.js - Core role management
export const useRoleStore = create(
  persist(
    immer((set, get) => ({
      // Active context
      activeRole: null,              // "client" | "business" | "delivery"
      activeBusiness: null,          // businessId
      activeBranch: null,            // branchId

      // Available options
      availableRoles: [],
      userBusinesses: [],
      businessPermissions: {},

      // Actions
      switchRole: async (role, options) => {
        set(state => {
          state.activeRole = role;
          state.layoutKey += 1;  // Force UI re-render
        });
        router.replace(getRoleHomePath(role));
      },

      switchBusiness: async (businessId) => {
        const branches = await getBusinessBranches(businessId);
        set(state => {
          state.activeBusiness = businessId;
          state.activeBranch = branches[0]?.id;
          state.currentBusinessBranches = branches;
        });
      }
    })),
    { name: 'uno-role-store' }
  )
);

// shared/stores/auth-store.js - Authentication state
export const useAuthStore = create(
  persist((set, get) => ({
    user: null,
    session: null,
    isAuthenticated: false,

    signIn: async (credentials) => {
      const { user, session } = await authenticateUser(credentials);
      set({ user, session, isAuthenticated: true });
    },

    signOut: async () => {
      await signOutUser();
      set({ user: null, session: null, isAuthenticated: false });
      // Clear all stores on logout
      useRoleStore.getState().reset();
    }
  }))
);
```

### TanStack Query Integration

```javascript
// shared/hooks/use-role-query.js - Context-aware queries
export const useRoleQuery = (queryConfig) => {
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();

  return useQuery({
    ...queryConfig,
    queryKey: [
      ...queryConfig.queryKey,
      'context', activeRole, activeBusiness, activeBranch
    ].filter(Boolean),
    enabled: queryConfig.enabled !== false && Boolean(activeRole)
  });
};

// features/orders/hooks/use-orders.js - Role-specific data fetching
export const useOrders = () => {
  const { activeRole, activeBusiness } = useRoleStore();

  return useRoleQuery({
    queryKey: ['orders'],
    queryFn: () => {
      switch (activeRole) {
        case 'client':
          return getClientOrders();
        case 'business':
          return getBusinessOrders(activeBusiness);
        case 'delivery':
          return getDeliveryOrders();
        default:
          throw new Error(`Unknown role: ${activeRole}`);
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
```

## Dynamic UI System

### File-Based Routing Structure

```
app/
├── (auth)/                    # Authentication flow
│   ├── login.jsx
│   ├── register.jsx
│   └── forgot-password.jsx
├── (onboarding)/             # User onboarding
│   ├── welcome.jsx
│   ├── role-selection.jsx
│   └── setup.jsx
├── (main)/                   # Main app with role switching
│   ├── _layout.jsx          # Role-aware layout wrapper
│   ├── (client)/            # Client mode screens
│   │   ├── _layout.jsx      # Client-specific layout
│   │   ├── home.jsx
│   │   ├── search.jsx
│   │   ├── orders/
│   │   │   ├── index.jsx
│   │   │   └── [id].jsx
│   │   └── profile.jsx
│   ├── (business)/          # Business mode screens
│   │   ├── _layout.jsx      # Business-specific layout
│   │   ├── dashboard.jsx
│   │   ├── orders/
│   │   ├── products/
│   │   ├── analytics.jsx
│   │   └── staff/
│   └── (delivery)/          # Future delivery screens
│       ├── available.jsx
│       ├── active.jsx
│       └── earnings.jsx
└── role-switcher.jsx        # Global role switching modal
```

### Role-Aware Layout System

```javascript
// app/(main)/_layout.jsx - Master layout with role detection
export default function MainLayout() {
  const { activeRole, isRoleSwitching, layoutKey } = useRoleStore();
  const { initializeRoleData } = useRoleInitialization();

  useEffect(() => {
    initializeRoleData();
  }, []);

  if (isRoleSwitching) {
    return <RoleSwitchingLoader />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View key={layoutKey} className="flex-1">
        <Slot /> {/* Renders role-specific layouts */}
      </View>
      <RoleSwitcherModal />
    </SafeAreaProvider>
  );
}

// app/(main)/(client)/_layout.jsx - Client-specific layout
export default function ClientLayout() {
  return (
    <View className="flex-1 bg-gray-50">
      <ClientHeader />
      <View className="flex-1">
        <Slot />
      </View>
      <ClientTabBar />
    </View>
  );
}

// app/(main)/(business)/_layout.jsx - Business-specific layout
export default function BusinessLayout() {
  const { activeBusiness } = useRoleStore();

  if (!activeBusiness) {
    return <BusinessSelector />;
  }

  return (
    <View className="flex-1 bg-white">
      <BusinessHeader />
      <BusinessContextBar /> {/* Shows active business/branch */}
      <View className="flex-1">
        <Slot />
      </View>
      <BusinessTabBar />
    </View>
  );
}
```

### Adaptive Component System

```javascript
// shared/components/ui/adaptive-button.jsx
export const AdaptiveButton = ({
  variant = "auto",
  role = null,
  ...props
}) => {
  const { activeRole } = useRoleStore();
  const contextRole = role || activeRole;

  const variantMap = {
    auto: {
      client: "primary",
      business: "business",
      delivery: "delivery"
    }
  };

  const finalVariant = variant === "auto"
    ? variantMap.auto[contextRole]
    : variant;

  return <Button variant={finalVariant} {...props} />;
};

// shared/components/ui/role-conditional.jsx
export const RoleConditional = ({
  roles = [],
  permissions = [],
  client,
  business,
  delivery,
  fallback = null
}) => {
  const { activeRole } = useRoleStore();
  const { checkPermission } = usePermissions();

  // Check role requirements
  if (roles.length > 0 && !roles.includes(activeRole)) {
    return fallback;
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasPermission = permissions.some(p => checkPermission(p));
    if (!hasPermission) return fallback;
  }

  // Render role-specific component
  const componentMap = { client, business, delivery };
  return componentMap[activeRole] || fallback;
};
```

### Navigation Configuration

```javascript
// shared/config/navigation.js
export const navigationConfig = {
  client: [
    {
      name: 'Inicio',
      icon: 'home',
      path: '/(client)/home',
      badge: null
    },
    {
      name: 'Buscar',
      icon: 'search',
      path: '/(client)/search',
      badge: null
    },
    {
      name: 'Pedidos',
      icon: 'shopping-bag',
      path: '/(client)/orders',
      badge: 'orders'  // Dynamic badge
    },
    {
      name: 'Perfil',
      icon: 'user',
      path: '/(client)/profile',
      badge: null
    }
  ],

  business: [
    {
      name: 'Dashboard',
      icon: 'bar-chart-2',
      path: '/(business)/dashboard',
      badge: null
    },
    {
      name: 'Pedidos',
      icon: 'shopping-bag',
      path: '/(business)/orders',
      badge: 'pending-orders'
    },
    {
      name: 'Productos',
      icon: 'package',
      path: '/(business)/products',
      badge: null
    },
    {
      name: 'Análisis',
      icon: 'trending-up',
      path: '/(business)/analytics',
      badge: null
    }
  ]
};

// Dynamic tab bar with badges
export const RoleTabBar = () => {
  const { activeRole } = useRoleStore();
  const tabs = navigationConfig[activeRole] || [];

  return (
    <View className="flex-row bg-white border-t border-gray-200 safe-area-bottom">
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.name}
          {...tab}
          badge={getBadgeCount(tab.badge)}
        />
      ))}
    </View>
  );
};
```

## Performance Optimizations

### Selective Subscriptions

```javascript
// Only re-render when specific state changes
const activeRole = useRoleStore(state => state.activeRole);
const isClient = useRoleStore(state => state.activeRole === 'client');
const currentBusiness = useRoleStore(state =>
  state.userBusinesses.find(b => b.id === state.activeBusiness)
);
```

### Query Invalidation Strategy

```javascript
// shared/hooks/use-role-effects.js
export const useRoleEffects = () => {
  const queryClient = useQueryClient();

  // Subscribe to role changes and manage cache
  useRoleStore.subscribe(
    (state) => ({
      activeRole: state.activeRole,
      activeBusiness: state.activeBusiness
    }),
    (current, previous) => {
      // Role changed - invalidate all queries
      if (current.activeRole !== previous.activeRole) {
        queryClient.invalidateQueries();

        // Remove role-specific cached data
        const keysToRemove = current.activeRole === 'client'
          ? ['business-orders', 'business-analytics']
          : ['client-orders', 'client-favorites'];

        keysToRemove.forEach(key => {
          queryClient.removeQueries({ queryKey: [key] });
        });
      }

      // Business changed - invalidate business queries
      if (current.activeBusiness !== previous.activeBusiness) {
        queryClient.invalidateQueries({ queryKey: ['business'] });
        queryClient.invalidateQueries({ queryKey: ['branches'] });
      }
    }
  );
};
```

### Lazy Loading Strategy

```javascript
// Lazy load role-specific screens
const ClientScreens = lazy(() => import('../features/client/screens'));
const BusinessScreens = lazy(() => import('../features/business/screens'));

export const RoleScreenLoader = ({ role, screen }) => {
  const ScreenMap = {
    client: ClientScreens,
    business: BusinessScreens
  };

  const Component = ScreenMap[role];

  return Component ? (
    <Suspense fallback={<ScreenLoadingSpinner />}>
      <Component screen={screen} />
    </Suspense>
  ) : null;
};
```

## Form Management

### Role-Aware Form Validation

```javascript
// shared/schemas/validation-schemas.js
export const createProductSchema = (userRole, businessPermissions) => {
  return z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    price: z.number().min(0, 'Precio debe ser positivo'),
    category: z.string(),

    // Conditional validation based on permissions
    ...(businessPermissions.includes('advanced_pricing') && {
      dynamicPricing: z.object({
        enabled: z.boolean(),
        rules: z.array(z.object({
          condition: z.string(),
          adjustment: z.number()
        }))
      }).optional()
    })
  });
};

// features/business/components/product-form.jsx
export const ProductForm = () => {
  const { getUserPermissions } = usePermissions();
  const permissions = getUserPermissions();

  const schema = createProductSchema('business', permissions);

  const form = useForm({
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: schema
    }
  });

  return (
    <Form form={form}>
      <Input name="name" placeholder="Nombre del producto" />
      <Input name="price" placeholder="Precio" keyboardType="numeric" />

      <PermissionGuard permission="advanced_pricing">
        <DynamicPricingSection />
      </PermissionGuard>
    </Form>
  );
};
```

## Real-time Integration

### WebSocket Connection Management

```javascript
// shared/hooks/use-websocket.js
export const useWebSocket = () => {
  const { activeRole, activeBusiness } = useRoleStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?role=${activeRole}&business=${activeBusiness}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'ORDER_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          break;
        case 'NEW_ORDER':
          if (activeRole === 'business') {
            showOrderNotification(data.order);
          }
          break;
        case 'ROLE_PERMISSIONS_CHANGED':
          // Reload permissions and invalidate queries
          queryClient.invalidateQueries({ queryKey: ['user', 'permissions'] });
          break;
      }
    };

    return () => ws.close();
  }, [activeRole, activeBusiness]);
};
```

Esta arquitectura frontend proporciona una base sólida para el sistema multi-roles, con performance optimizada y experiencia de usuario fluida.