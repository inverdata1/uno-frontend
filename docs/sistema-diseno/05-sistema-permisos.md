# Sistema de Permisos - UNO Delivery

## Overview del Sistema RBAC

El sistema de permisos utiliza **Role-Based Access Control (RBAC)** con capacidades extendidas para manejar múltiples roles por usuario, contextos de negocio y permisos granulares.

### Arquitectura de Permisos

```javascript
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSION SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    ROLES    │ │ PERMISSIONS │ │  CONTEXTS   │           │
│  │             │ │             │ │             │           │
│  │ • client    │ │ • granular  │ │ • business  │           │
│  │ • business  │ │ • dynamic   │ │ • branch    │           │
│  │ • delivery  │ │ • inherited │ │ • global    │           │
│  │ • admin     │ │ • temp      │ │ • personal  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                             │                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           PERMISSION EVALUATION ENGINE                 │ │
│  │                                                         │ │
│  │  User Role + Context + Resource + Action = Decision    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Definición de Roles y Permisos

### Base Role System

```javascript
// shared/config/permissions.js
export const ROLES = {
  // Client role - Basic user permissions
  CLIENT: 'client',

  // Business roles - Hierarchical business permissions
  BUSINESS_OWNER: 'business_owner',
  BUSINESS_ADMIN: 'business_admin',
  BUSINESS_MANAGER: 'business_manager',
  BUSINESS_STAFF: 'business_staff',

  // Delivery roles
  DELIVERY_DRIVER: 'delivery_driver',
  DELIVERY_SUPERVISOR: 'delivery_supervisor',

  // System roles
  SYSTEM_ADMIN: 'system_admin',
  SUPPORT_AGENT: 'support_agent'
};

export const PERMISSIONS = {
  // Client permissions
  CLIENT: {
    BROWSE_RESTAURANTS: 'client.browse_restaurants',
    CREATE_ORDER: 'client.create_order',
    VIEW_OWN_ORDERS: 'client.view_own_orders',
    RATE_ORDER: 'client.rate_order',
    MANAGE_ADDRESSES: 'client.manage_addresses',
    VIEW_FAVORITES: 'client.view_favorites'
  },

  // Business permissions
  BUSINESS: {
    // Basic business operations
    VIEW_DASHBOARD: 'business.view_dashboard',
    MANAGE_PRODUCTS: 'business.manage_products',
    VIEW_ORDERS: 'business.view_orders',
    UPDATE_ORDER_STATUS: 'business.update_order_status',

    // Advanced business operations
    VIEW_ANALYTICS: 'business.view_analytics',
    EXPORT_REPORTS: 'business.export_reports',
    MANAGE_INVENTORY: 'business.manage_inventory',
    CONFIGURE_PRICING: 'business.configure_pricing',

    // Staff management
    INVITE_STAFF: 'business.invite_staff',
    MANAGE_STAFF: 'business.manage_staff',
    ASSIGN_ROLES: 'business.assign_roles',
    VIEW_STAFF_PERFORMANCE: 'business.view_staff_performance',

    // Branch management
    CREATE_BRANCH: 'business.create_branch',
    MANAGE_BRANCHES: 'business.manage_branches',
    CONFIGURE_DELIVERY_ZONES: 'business.configure_delivery_zones',

    // Financial operations
    VIEW_FINANCIAL_REPORTS: 'business.view_financial_reports',
    MANAGE_PAYOUTS: 'business.manage_payouts',
    CONFIGURE_PAYMENT_METHODS: 'business.configure_payment_methods'
  },

  // Delivery permissions
  DELIVERY: {
    VIEW_AVAILABLE_ORDERS: 'delivery.view_available_orders',
    ACCEPT_ORDERS: 'delivery.accept_orders',
    UPDATE_DELIVERY_STATUS: 'delivery.update_delivery_status',
    VIEW_EARNINGS: 'delivery.view_earnings',
    MANAGE_SCHEDULE: 'delivery.manage_schedule'
  }
};

// Permission hierarchies - inherited permissions
export const ROLE_HIERARCHIES = {
  [ROLES.BUSINESS_OWNER]: [
    ...Object.values(PERMISSIONS.BUSINESS),
    ...Object.values(PERMISSIONS.CLIENT)
  ],

  [ROLES.BUSINESS_ADMIN]: [
    PERMISSIONS.BUSINESS.VIEW_DASHBOARD,
    PERMISSIONS.BUSINESS.MANAGE_PRODUCTS,
    PERMISSIONS.BUSINESS.VIEW_ORDERS,
    PERMISSIONS.BUSINESS.UPDATE_ORDER_STATUS,
    PERMISSIONS.BUSINESS.VIEW_ANALYTICS,
    PERMISSIONS.BUSINESS.MANAGE_STAFF,
    PERMISSIONS.BUSINESS.MANAGE_BRANCHES
  ],

  [ROLES.BUSINESS_MANAGER]: [
    PERMISSIONS.BUSINESS.VIEW_DASHBOARD,
    PERMISSIONS.BUSINESS.MANAGE_PRODUCTS,
    PERMISSIONS.BUSINESS.VIEW_ORDERS,
    PERMISSIONS.BUSINESS.UPDATE_ORDER_STATUS,
    PERMISSIONS.BUSINESS.MANAGE_INVENTORY
  ],

  [ROLES.BUSINESS_STAFF]: [
    PERMISSIONS.BUSINESS.VIEW_ORDERS,
    PERMISSIONS.BUSINESS.UPDATE_ORDER_STATUS
  ],

  [ROLES.CLIENT]: Object.values(PERMISSIONS.CLIENT),
  [ROLES.DELIVERY_DRIVER]: Object.values(PERMISSIONS.DELIVERY)
};
```

### Context-Aware Permissions

```javascript
// shared/stores/permissions-store.js
export const usePermissionsStore = create(
  persist((set, get) => ({
    // User's role-based permissions
    userPermissions: {},

    // Context-specific permissions (business, branch)
    contextPermissions: {},

    // Temporary permissions (time-limited access)
    temporaryPermissions: {},

    // Actions
    setUserPermissions: (permissions) => set({ userPermissions: permissions }),

    setContextPermissions: (context, permissions) => set(state => ({
      contextPermissions: {
        ...state.contextPermissions,
        [context]: permissions
      }
    })),

    grantTemporaryPermission: (permission, expiresAt) => set(state => ({
      temporaryPermissions: {
        ...state.temporaryPermissions,
        [permission]: { granted: true, expiresAt }
      }
    })),

    // Permission evaluation
    hasPermission: (permission, context = null) => {
      const { userPermissions, contextPermissions, temporaryPermissions } = get();

      // Check temporary permissions first
      const tempPerm = temporaryPermissions[permission];
      if (tempPerm && tempPerm.granted && new Date() < new Date(tempPerm.expiresAt)) {
        return true;
      }

      // Check context-specific permissions
      if (context && contextPermissions[context]) {
        if (contextPermissions[context].includes(permission)) {
          return true;
        }
      }

      // Check user's base permissions
      return userPermissions[permission] || false;
    },

    hasAnyPermission: (permissions, context = null) => {
      return permissions.some(permission => get().hasPermission(permission, context));
    },

    hasAllPermissions: (permissions, context = null) => {
      return permissions.every(permission => get().hasPermission(permission, context));
    }
  }))
);
```

### Permission Hooks

```javascript
// shared/hooks/use-permissions.js
export const usePermissions = () => {
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
    contextPermissions
  } = usePermissionsStore();

  const getActiveContext = () => {
    if (activeRole === 'business' && activeBusiness) {
      return activeBranch ? `business:${activeBusiness}:${activeBranch}`
                         : `business:${activeBusiness}`;
    }
    return activeRole;
  };

  const checkPermission = (permission) => {
    const context = getActiveContext();
    return hasPermission(permission, context);
  };

  const checkAnyPermission = (permissions) => {
    const context = getActiveContext();
    return hasAnyPermission(permissions, context);
  };

  const checkAllPermissions = (permissions) => {
    const context = getActiveContext();
    return hasAllPermissions(permissions, context);
  };

  // Role-based permission shortcuts
  const canManageProducts = () => checkPermission(PERMISSIONS.BUSINESS.MANAGE_PRODUCTS);
  const canViewAnalytics = () => checkPermission(PERMISSIONS.BUSINESS.VIEW_ANALYTICS);
  const canManageStaff = () => checkPermission(PERMISSIONS.BUSINESS.MANAGE_STAFF);
  const canCreateOrders = () => checkPermission(PERMISSIONS.CLIENT.CREATE_ORDER);

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    canManageProducts,
    canViewAnalytics,
    canManageStaff,
    canCreateOrders,
    activeContext: getActiveContext(),
    userPermissions,
    contextPermissions
  };
};

// Hook para inicialización de permisos
export const usePermissionInitializer = () => {
  const { user } = useAuthStore();
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();
  const { setUserPermissions, setContextPermissions } = usePermissionsStore();

  const initializePermissions = useCallback(async () => {
    if (!user) return;

    try {
      // Load base role permissions
      const userRoles = await getUserRoles(user.id);
      const basePermissions = userRoles.reduce((acc, role) => {
        const rolePermissions = ROLE_HIERARCHIES[role] || [];
        rolePermissions.forEach(permission => {
          acc[permission] = true;
        });
        return acc;
      }, {});

      setUserPermissions(basePermissions);

      // Load context-specific permissions
      if (activeRole === 'business' && activeBusiness) {
        const businessPermissions = await getBusinessPermissions(
          user.id,
          activeBusiness,
          activeBranch
        );

        const contextKey = activeBranch
          ? `business:${activeBusiness}:${activeBranch}`
          : `business:${activeBusiness}`;

        setContextPermissions(contextKey, businessPermissions);
      }
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
    }
  }, [user, activeRole, activeBusiness, activeBranch]);

  useEffect(() => {
    initializePermissions();
  }, [initializePermissions]);

  return { initializePermissions };
};
```

## Permission Guards y Middleware

### Component-Level Guards

```javascript
// shared/components/guards/permission-guard.jsx
export const PermissionGuard = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { checkPermission, checkAnyPermission, checkAllPermissions } = usePermissions();

  const hasAccess = useMemo(() => {
    if (permission) {
      return checkPermission(permission);
    }

    if (permissions && permissions.length > 0) {
      return requireAll
        ? checkAllPermissions(permissions)
        : checkAnyPermission(permissions);
    }

    return false;
  }, [permission, permissions, requireAll, checkPermission, checkAnyPermission, checkAllPermissions]);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

// Role-specific guard
export const RoleGuard = ({ roles, children, fallback = null }) => {
  const { activeRole } = useRoleStore();

  if (!roles.includes(activeRole)) {
    return fallback;
  }

  return children;
};

// Combined guard
export const AccessGuard = ({
  roles = [],
  permissions = [],
  requireAllPermissions = false,
  children,
  fallback = <UnauthorizedMessage />
}) => (
  <RoleGuard roles={roles} fallback={fallback}>
    <PermissionGuard
      permissions={permissions}
      requireAll={requireAllPermissions}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  </RoleGuard>
);
```

### Route-Level Protection

```javascript
// shared/components/guards/protected-route.jsx
export const ProtectedRoute = ({
  component: Component,
  roles = [],
  permissions = [],
  requireAllPermissions = false,
  redirectTo = '/(auth)/login',
  ...props
}) => {
  const { isAuthenticated } = useAuthStore();
  const { activeRole } = useRoleStore();
  const { checkAnyPermission, checkAllPermissions } = usePermissions();

  if (!isAuthenticated) {
    return <Redirect href={redirectTo} />;
  }

  if (roles.length > 0 && !roles.includes(activeRole)) {
    return <UnauthorizedScreen />;
  }

  if (permissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);

    if (!hasPermission) {
      return <UnauthorizedScreen />;
    }
  }

  return <Component {...props} />;
};

// Usage in app routing
// app/(main)/(business)/analytics.jsx
export default function AnalyticsScreen() {
  return (
    <ProtectedRoute
      roles={['business_owner', 'business_admin']}
      permissions={[PERMISSIONS.BUSINESS.VIEW_ANALYTICS]}
      component={AnalyticsContent}
    />
  );
}
```

## Dynamic Permission Loading

### Business Context Permissions

```javascript
// services/permissions-service.js
export class PermissionsService {
  static async getUserRoles(userId) {
    const userDoc = await firestore.collection('users').doc(userId).get();
    return userDoc.data()?.roles || ['client'];
  }

  static async getBusinessPermissions(userId, businessId, branchId = null) {
    const query = firestore
      .collection('user_business_roles')
      .where('userId', '==', userId)
      .where('businessId', '==', businessId);

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) return [];

    const roleData = snapshot.docs[0].data();
    return ROLE_HIERARCHIES[roleData.role] || [];
  }

  static async grantBusinessRole(userId, businessId, role, branchId = null, grantedBy) {
    const roleData = {
      userId,
      businessId,
      role,
      branchId,
      grantedBy,
      grantedAt: new Date(),
      isActive: true
    };

    await firestore.collection('user_business_roles').add(roleData);

    // Log permission change
    await this.logPermissionChange({
      action: 'GRANT_ROLE',
      targetUserId: userId,
      grantedBy,
      context: { businessId, branchId, role }
    });
  }

  static async revokeBusinessRole(userId, businessId, branchId = null, revokedBy) {
    const query = firestore
      .collection('user_business_roles')
      .where('userId', '==', userId)
      .where('businessId', '==', businessId);

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const snapshot = await query.get();

    for (const doc of snapshot.docs) {
      await doc.ref.update({
        isActive: false,
        revokedBy,
        revokedAt: new Date()
      });
    }

    // Log permission change
    await this.logPermissionChange({
      action: 'REVOKE_ROLE',
      targetUserId: userId,
      revokedBy,
      context: { businessId, branchId }
    });
  }

  static async grantTemporaryPermission(userId, permission, expiresAt, grantedBy) {
    const tempPermissionData = {
      userId,
      permission,
      expiresAt,
      grantedBy,
      grantedAt: new Date(),
      isActive: true
    };

    await firestore.collection('temporary_permissions').add(tempPermissionData);
  }

  static async logPermissionChange(changeData) {
    await firestore.collection('permission_audit_log').add({
      ...changeData,
      timestamp: new Date()
    });
  }
}
```

### Permission Synchronization

```javascript
// shared/hooks/use-permission-sync.js
export const usePermissionSync = () => {
  const { user } = useAuthStore();
  const { activeRole, activeBusiness, activeBranch } = useRoleStore();
  const { setUserPermissions, setContextPermissions } = usePermissionsStore();
  const queryClient = useQueryClient();

  // Real-time permission updates via WebSocket
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${WS_URL}/permissions?userId=${user.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'PERMISSIONS_UPDATED':
          // Invalidate permission queries to refetch
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
          break;

        case 'ROLE_GRANTED':
          if (data.userId === user.id) {
            // Refresh permissions for this user
            queryClient.invalidateQueries({
              queryKey: ['permissions', user.id]
            });
          }
          break;

        case 'ROLE_REVOKED':
          if (data.userId === user.id) {
            // Clear cached permissions and refetch
            queryClient.removeQueries({
              queryKey: ['permissions', user.id]
            });
            queryClient.invalidateQueries({
              queryKey: ['permissions', user.id]
            });
          }
          break;

        case 'BUSINESS_PERMISSIONS_CHANGED':
          if (data.businessId === activeBusiness) {
            const contextKey = activeBranch
              ? `business:${activeBusiness}:${activeBranch}`
              : `business:${activeBusiness}`;
            setContextPermissions(contextKey, data.permissions);
          }
          break;
      }
    };

    return () => ws.close();
  }, [user, activeBusiness, activeBranch]);
};
```

## Permission-Based UI Examples

### Business Dashboard with Permissions

```javascript
// features/business/screens/business-dashboard.jsx
export const BusinessDashboard = () => {
  const { checkPermission } = usePermissions();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Always visible - basic dashboard */}
      <OrdersSummary />

      {/* Analytics section - permission required */}
      <PermissionGuard permission={PERMISSIONS.BUSINESS.VIEW_ANALYTICS}>
        <AnalyticsOverview />
      </PermissionGuard>

      {/* Staff management - permission required */}
      <PermissionGuard permission={PERMISSIONS.BUSINESS.MANAGE_STAFF}>
        <StaffQuickActions />
      </PermissionGuard>

      {/* Financial reports - multiple permissions */}
      <PermissionGuard
        permissions={[
          PERMISSIONS.BUSINESS.VIEW_FINANCIAL_REPORTS,
          PERMISSIONS.BUSINESS.VIEW_ANALYTICS
        ]}
        requireAll={false}
      >
        <FinancialOverview />
      </PermissionGuard>

      {/* Advanced features - business owner only */}
      <AccessGuard
        roles={['business_owner', 'business_admin']}
        permissions={[PERMISSIONS.BUSINESS.CONFIGURE_PRICING]}
      >
        <PricingConfiguration />
      </AccessGuard>
    </ScrollView>
  );
};
```

Este sistema de permisos proporciona control granular y seguro sobre todas las funcionalidades de la aplicación, permitiendo roles flexibles y contextos dinámicos.