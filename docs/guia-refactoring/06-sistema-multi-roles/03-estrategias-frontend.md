# Estrategias Frontend - Sistema Multi-Roles

## Desafíos del Frontend Multi-Role

### Problemas a Resolver
1. **UI Completamente Diferente**: Client mode vs Business mode tienen layouts totalmente distintos
2. **Navigation Dynamic**: Tabs y menús diferentes por rol activo
3. **State Management**: Estado global que mantenga contexto de rol/business/branch
4. **Component Reusability**: Mismos componentes pero comportamientos diferentes
5. **Route Management**: Rutas específicas por rol + protección de acceso
6. **Data Fetching**: Queries diferentes según rol activo
7. **Real-time Updates**: Sincronizar cambios de rol entre dispositivos

## Estrategias Frontend

### 1. Zustand-Based Role Management

#### A. Multi-Role Zustand Store
```javascript
// shared/stores/role-store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export const useRoleStore = create(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Current active context
        activeRole: null,              // "client" | "business" | "delivery"
        activeBusiness: null,          // businessId when in business mode
        activeBranch: null,            // branchId when in business mode

        // User's available options
        availableRoles: [],            // ["client", "business"] etc.
        userBusinesses: [],            // Businesses user can manage
        businessPermissions: {},       // Permissions by businessId

        // Current business branches (loaded when business selected)
        currentBusinessBranches: [],

        // UI state
        isRoleSwitching: false,
        isBusinessSwitching: false,
        layoutKey: 0,                  // Force re-render trigger

        // Actions
        setAvailableRoles: (roles) => set((state) => {
          state.availableRoles = roles;
        }),

        setUserBusinesses: (businesses) => set((state) => {
          state.userBusinesses = businesses;
        }),

        switchRole: async (newRole, options = {}) => {
          set((state) => {
            state.isRoleSwitching = true;
          });

          try {
            // Update backend
            await updateUserActiveRole({
              activeRole: newRole,
              activeBusiness: options.businessId,
              activeBranch: options.branchId
            });

            set((state) => {
              state.activeRole = newRole;
              state.activeBusiness = options.businessId || null;
              state.activeBranch = options.branchId || null;
              state.isRoleSwitching = false;
              state.layoutKey += 1;

              // Clear business-specific data when switching away from business
              if (newRole !== 'business') {
                state.currentBusinessBranches = [];
              }
            });

            // Reset navigation stack
            router.replace(getRoleHomePath(newRole));

          } catch (error) {
            set((state) => {
              state.isRoleSwitching = false;
            });
            throw error;
          }
        },

        switchBusiness: async (businessId, branchId = null) => {
          set((state) => {
            state.isBusinessSwitching = true;
          });

          try {
            // Load branches for this business
            const branches = await getBusinessBranches(businessId);
            const defaultBranchId = branchId || branches[0]?.id;

            // Update backend
            await updateUserActiveBusiness({
              businessId,
              branchId: defaultBranchId
            });

            set((state) => {
              state.activeBusiness = businessId;
              state.activeBranch = defaultBranchId;
              state.currentBusinessBranches = branches;
              state.isBusinessSwitching = false;
            });

          } catch (error) {
            set((state) => {
              state.isBusinessSwitching = false;
            });
            throw error;
          }
        },

        switchBranch: async (branchId) => {
          try {
            await updateUserActiveBranch({ branchId });

            set((state) => {
              state.activeBranch = branchId;
            });

          } catch (error) {
            console.error('Failed to switch branch:', error);
          }
        },

        // Computed selectors
        getCurrentBusiness: () => {
          const { activeBusiness, userBusinesses } = get();
          return userBusinesses.find(b => b.id === activeBusiness);
        },

        getCurrentBranch: () => {
          const { activeBranch, currentBusinessBranches } = get();
          return currentBusinessBranches.find(b => b.id === activeBranch);
        },

        getUserPermissions: () => {
          const { activeBusiness, businessPermissions } = get();
          return businessPermissions[activeBusiness] || [];
        },

        // Helper getters
        isClient: () => get().activeRole === 'client',
        isBusiness: () => get().activeRole === 'business',
        isDelivery: () => get().activeRole === 'delivery',

        hasRole: (role) => get().availableRoles.includes(role),
        canManageBusiness: (businessId) => {
          const { businessPermissions } = get();
          return businessPermissions[businessId]?.includes('manage_business');
        }
      })),
      {
        name: 'uno-role-store',
        partialize: (state) => ({
          // Only persist essential data
          activeRole: state.activeRole,
          activeBusiness: state.activeBusiness,
          activeBranch: state.activeBranch,
          availableRoles: state.availableRoles
        })
      }
    )
  )
);

// Custom hooks for convenience
export const useActiveRole = () => useRoleStore(state => state.activeRole);
export const useIsClient = () => useRoleStore(state => state.isClient());
export const useIsBusiness = () => useRoleStore(state => state.isBusiness());
export const useCurrentBusiness = () => useRoleStore(state => state.getCurrentBusiness());
export const useRoleSwitching = () => useRoleStore(state => state.isRoleSwitching);
```

#### B. Store Initialization Hook
```javascript
// shared/hooks/use-role-initialization.js
export const useRoleInitialization = () => {
  const { user } = useAuthStore();
  const {
    setAvailableRoles,
    setUserBusinesses,
    switchRole,
    activeRole
  } = useRoleStore();

  // Initialize role data when user loads
  useEffect(() => {
    if (!user) return;

    const initializeRoleData = async () => {
      try {
        // Load user's available roles and businesses
        const [roles, businesses] = await Promise.all([
          getUserAvailableRoles(user.uid),
          getUserBusinesses(user.uid)
        ]);

        setAvailableRoles(roles);
        setUserBusinesses(businesses);

        // Set initial role if not already set
        if (!activeRole && roles.length > 0) {
          const initialRole = roles.includes('client') ? 'client' : roles[0];
          await switchRole(initialRole);
        }

      } catch (error) {
        console.error('Failed to initialize role data:', error);
      }
    };

    initializeRoleData();
  }, [user?.uid]);
};
```

#### C. Layout Strategy - Zustand-Powered Rendering
```javascript
// app/(main)/_layout.jsx
import { useRoleStore } from '../../shared/stores/role-store';
import { ClientLayout } from '../../features/client/components/client-layout';
import { BusinessLayout } from '../../features/business/components/business-layout';
import { DeliveryLayout } from '../../features/delivery/components/delivery-layout';

export default function MainLayout() {
  const { activeRole, isRoleSwitching, layoutKey } = useRoleStore();

  // Show loading during role switch to prevent glitches
  if (isRoleSwitching) {
    return <RoleSwitchingLoader />;
  }

  // Key prop forces complete re-render on role change
  return (
    <View key={layoutKey} className="flex-1">
      {activeRole === 'client' && <ClientLayout />}
      {activeRole === 'business' && <BusinessLayout />}
      {activeRole === 'delivery' && <DeliveryLayout />}
    </View>
  );
}
```

### 2. Role-Specific Navigation

#### A. Navigation Configuration
```javascript
// shared/config/navigation-config.js
export const navigationConfig = {
  client: [
    { name: 'Home', icon: 'home', path: '/(client)/home' },
    { name: 'Search', icon: 'search', path: '/(client)/search' },
    { name: 'Orders', icon: 'list', path: '/(client)/orders' },
    { name: 'Profile', icon: 'user', path: '/(client)/profile' }
  ],

  business: [
    { name: 'Dashboard', icon: 'bar-chart', path: '/(business)/dashboard' },
    { name: 'Orders', icon: 'shopping-bag', path: '/(business)/orders' },
    { name: 'Products', icon: 'package', path: '/(business)/products' },
    { name: 'Analytics', icon: 'trending-up', path: '/(business)/analytics' }
  ],

  delivery: [
    { name: 'Available', icon: 'map', path: '/(delivery)/available' },
    { name: 'Active', icon: 'truck', path: '/(delivery)/active' },
    { name: 'History', icon: 'clock', path: '/(delivery)/history' },
    { name: 'Earnings', icon: 'dollar-sign', path: '/(delivery)/earnings' }
  ]
};
```

#### B. Dynamic Tab Bar
```javascript
// shared/components/navigation/role-tab-bar.jsx
import { useActiveRole } from '../../stores/role-store';

export const RoleTabBar = () => {
  const activeRole = useActiveRole();
  const tabs = navigationConfig[activeRole] || [];

  return (
    <View className="flex-row bg-white border-t border-gray-200">
      {tabs.map((tab) => (
        <TabItem key={tab.name} {...tab} />
      ))}
    </View>
  );
};
```

### 3. Route Structure Strategy

#### A. File-Based Routing por Role
```
app/
├── (auth)/                     # Authentication screens
├── (onboarding)/              # Onboarding flow
├── (main)/                    # Main app wrapper
│   ├── (client)/             # Client-specific screens
│   │   ├── home.jsx
│   │   ├── search.jsx
│   │   ├── orders/
│   │   └── profile.jsx
│   ├── (business)/           # Business-specific screens
│   │   ├── dashboard.jsx
│   │   ├── orders/
│   │   ├── products/
│   │   └── analytics.jsx
│   └── (delivery)/           # Delivery-specific screens (future)
│       ├── available.jsx
│       ├── active.jsx
│       └── earnings.jsx
└── role-switcher.jsx         # Modal for switching roles
```

#### B. Route Protection by Role
```javascript
// shared/components/navigation/role-guard.jsx
import { useActiveRole } from '../../stores/role-store';

export const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const activeRole = useActiveRole();

  if (!allowedRoles.includes(activeRole)) {
    return fallback || <AccessDenied />;
  }

  return children;
};

// Usage in screens
export default function BusinessDashboard() {
  return (
    <RoleGuard allowedRoles={['business']}>
      <BusinessDashboardContent />
    </RoleGuard>
  );
}
```

### 4. Zustand Store Integration

#### A. Role-Aware TanStack Query
```javascript
// shared/api/hooks/use-role-query.js
import { useRoleStore } from '../../stores/role-store';

export const useRoleQuery = (queryConfig) => {
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();

  // Include role context in query key for proper caching
  const contextualQueryConfig = {
    ...queryConfig,
    queryKey: [
      ...queryConfig.queryKey,
      'role', activeRole,
      'business', activeBusiness,
      'branch', activeBranch
    ].filter(Boolean),

    enabled: queryConfig.enabled !== false && Boolean(activeRole)
  };

  return useQuery(contextualQueryConfig);
};

// Usage example
const useOrders = () => {
  const { activeRole, activeBusiness } = useRoleStore();

  return useRoleQuery({
    queryKey: ['orders'],
    queryFn: () => {
      // Different endpoint based on role
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
    }
  });
};
```

#### B. Store Subscriptions for UI Updates
```javascript
// shared/hooks/use-role-effects.js
import { useRoleStore } from '../stores/role-store';
import { useQueryClient } from '@tanstack/react-query';

export const useRoleEffects = () => {
  const queryClient = useQueryClient();

  // Subscribe to role changes and invalidate relevant queries
  useRoleStore.subscribe(
    (state) => ({
      activeRole: state.activeRole,
      activeBusiness: state.activeBusiness,
      activeBranch: state.activeBranch
    }),
    (current, previous) => {
      // Role changed - invalidate all queries
      if (current.activeRole !== previous.activeRole) {
        queryClient.invalidateQueries();

        // Remove role-specific cached data
        const keysToRemove = current.activeRole === 'client'
          ? ['business', 'branches', 'business-orders']
          : ['client-orders', 'favorites'];

        keysToRemove.forEach(key => {
          queryClient.removeQueries({ queryKey: [key] });
        });
      }

      // Business changed - invalidate business-specific queries
      if (current.activeBusiness !== previous.activeBusiness) {
        queryClient.invalidateQueries({ queryKey: ['business'] });
        queryClient.invalidateQueries({ queryKey: ['branches'] });
        queryClient.invalidateQueries({ queryKey: ['business-orders'] });
      }

      // Branch changed - invalidate branch-specific queries
      if (current.activeBranch !== previous.activeBranch) {
        queryClient.invalidateQueries({ queryKey: ['branch-orders'] });
        queryClient.invalidateQueries({ queryKey: ['branch-inventory'] });
      }
    }
  );
};
```

### 5. Component Strategy - Adaptive Components

#### A. Role-Aware Base Components
```javascript
// shared/components/ui/adaptive-button.jsx
export const AdaptiveButton = ({ variant = "auto", ...props }) => {
  const { activeRole } = useRole();

  // Auto-adapt styling based on role
  const roleVariant = variant === "auto" ? {
    client: "primary",
    business: "business",
    delivery: "delivery"
  }[activeRole] : variant;

  return <Button variant={roleVariant} {...props} />;
};
```

#### B. Conditional Component Rendering
```javascript
// shared/components/ui/role-conditional.jsx
export const RoleConditional = ({
  role,
  business,
  delivery,
  client,
  fallback = null
}) => {
  const { activeRole } = useRole();

  const componentMap = {
    client: client,
    business: business,
    delivery: delivery
  };

  return componentMap[activeRole] || fallback;
};

// Usage
<RoleConditional
  client={<ClientOrderCard order={order} />}
  business={<BusinessOrderCard order={order} />}
  delivery={<DeliveryOrderCard order={order} />}
/>
```

### 6. Role Switching UI Strategy

#### A. Role Switcher Component
```javascript
// features/role-switcher/role-switcher-modal.jsx
export const RoleSwitcherModal = ({ visible, onClose }) => {
  const {
    activeRole,
    availableRoles,
    availableBusinesses,
    switchRole,
    switchBusiness
  } = useRole();

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="p-6">
          <Text className="text-2xl font-bold mb-6">Cambiar Modo</Text>

          {/* Role Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Selecciona tu rol:</Text>
            {availableRoles.map((role) => (
              <RoleSelectorCard
                key={role}
                role={role}
                active={role === activeRole}
                onSelect={() => switchRole(role)}
              />
            ))}
          </View>

          {/* Business Selection (if business role) */}
          {activeRole === 'business' && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Selecciona negocio:</Text>
              {availableBusinesses.map((business) => (
                <BusinessSelectorCard
                  key={business.id}
                  business={business}
                  onSelect={() => switchBusiness(business.id)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
```

#### B. Quick Role Toggle
```javascript
// shared/components/navigation/role-toggle.jsx
export const RoleToggle = () => {
  const { activeRole, availableRoles, switchRole } = useRole();

  // Quick toggle between 2 roles
  if (availableRoles.length === 2) {
    const otherRole = availableRoles.find(role => role !== activeRole);

    return (
      <TouchableOpacity
        onPress={() => switchRole(otherRole)}
        className="flex-row items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full"
      >
        <RoleIcon role={activeRole} size={16} />
        <Feather name="repeat" size={14} color="#666" />
        <RoleIcon role={otherRole} size={16} />
      </TouchableOpacity>
    );
  }

  // Multiple roles - show modal
  return (
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <RoleIcon role={activeRole} size={24} />
    </TouchableOpacity>
  );
};
```

### 7. Performance Optimizations

#### A. Lazy Loading by Role
```javascript
// Lazy load role-specific screens
const ClientHome = lazy(() => import('../features/client/screens/home'));
const BusinessDashboard = lazy(() => import('../features/business/screens/dashboard'));

export const RoleScreenLoader = ({ role, screen }) => {
  const ComponentMap = {
    client: {
      home: ClientHome,
    },
    business: {
      dashboard: BusinessDashboard,
    }
  };

  const Component = ComponentMap[role]?.[screen];

  return Component ? (
    <Suspense fallback={<ScreenLoader />}>
      <Component />
    </Suspense>
  ) : null;
};
```

#### B. Query Invalidation on Role Switch
```javascript
// shared/api/hooks/use-role-switch-effect.js
export const useRoleSwitchEffect = () => {
  const { activeRole, activeBusiness } = useRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate all queries when role changes
    queryClient.invalidateQueries();

    // Clear irrelevant cached data
    const keysToRemove = activeRole === 'client'
      ? ['business', 'products', 'business-orders']
      : ['client-orders', 'favorites'];

    keysToRemove.forEach(key => {
      queryClient.removeQueries({ queryKey: [key] });
    });
  }, [activeRole, activeBusiness]);
};
```

## Implementación por Fases

### Fase 1: Core Infrastructure (2 semanas)
1. ✅ Role Context Provider
2. ✅ Basic role switching logic
3. ✅ Route structure setup
4. ✅ Role Guards

### Fase 2: UI Foundation (2 semanas)
1. ✅ Dynamic navigation
2. ✅ Role-specific layouts
3. ✅ Adaptive components
4. ✅ Role switcher modal

### Fase 3: Business Logic (3 semanas)
1. ✅ Multi-business selection
2. ✅ Branch management UI
3. ✅ Role-aware data fetching
4. ✅ Permissions system

### Fase 4: Polish & Optimization (1 semana)
1. ✅ Performance optimizations
2. ✅ Error handling
3. ✅ Loading states
4. ✅ Animation transitions

Esta estrategia frontend permite un sistema completamente dinámico y extensible, donde agregar nuevos roles requiere mínimos cambios en el código existente.