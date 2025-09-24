# Sistema de Roles y Permisos

## Visión General

El sistema de roles y permisos de UNO Delivery está diseñado para ser **flexible**, **extensible** y **seguro**. Permite que los usuarios tengan múltiples roles simultáneamente y define permisos granulares para cada contexto.

## Estructura de Roles

### 1. Roles Base del Sistema

```javascript
const SYSTEM_ROLES = {
  CLIENT: 'client',
  BUSINESS: 'business',
  DELIVERY: 'delivery',
  ADMIN: 'admin'          // Para futuro uso
};
```

#### A. Client Role
**Descripción**: Usuario que realiza pedidos y consume servicios

**Permisos Base**:
```javascript
const CLIENT_PERMISSIONS = [
  'client.create_orders',
  'client.view_orders',
  'client.cancel_orders',
  'client.manage_addresses',
  'client.manage_payment_methods',
  'client.rate_businesses',
  'client.view_business_catalog'
];
```

**Contexto de Datos**:
- Direcciones personales de entrega
- Métodos de pago personales
- Historial de pedidos como cliente
- Favoritos y preferencias

#### B. Business Role
**Descripción**: Usuario que administra uno o más negocios

**Permisos Base**:
```javascript
const BUSINESS_BASE_PERMISSIONS = [
  'business.view_orders',
  'business.update_order_status',
  'business.view_analytics',
  'business.manage_business_info'
];
```

**Permisos Específicos por Negocio**:
```javascript
const BUSINESS_SPECIFIC_PERMISSIONS = [
  // Product Management
  'products.create',
  'products.edit',
  'products.delete',
  'products.manage_inventory',

  // Order Management
  'orders.view_all',
  'orders.accept',
  'orders.reject',
  'orders.update_status',
  'orders.refund',

  // Staff Management
  'staff.invite',
  'staff.manage_roles',
  'staff.view_performance',

  // Analytics & Reports
  'analytics.view_sales',
  'analytics.view_customer_data',
  'analytics.export_reports',

  // Business Configuration
  'business.edit_profile',
  'business.manage_branches',
  'business.configure_settings'
];
```

#### C. Delivery Role (Futuro)
**Descripción**: Usuario que realiza entregas

**Permisos Base**:
```javascript
const DELIVERY_PERMISSIONS = [
  'delivery.view_available_orders',
  'delivery.accept_deliveries',
  'delivery.update_delivery_status',
  'delivery.manage_vehicle_info',
  'delivery.view_earnings',
  'delivery.manage_availability'
];
```

### 2. Roles Dentro de Business (Sub-Roles)

```javascript
const BUSINESS_SUB_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};
```

#### A. Owner (Propietario)
**Descripción**: Creador del negocio, control total
```javascript
const OWNER_PERMISSIONS = [
  ...BUSINESS_SPECIFIC_PERMISSIONS,  // Todos los permisos
  'business.delete',
  'business.transfer_ownership',
  'staff.remove_any',
  'finance.view_revenue',
  'finance.configure_payments'
];
```

#### B. Admin (Administrador)
**Descripción**: Administrador con casi todos los permisos
```javascript
const ADMIN_PERMISSIONS = [
  'products.create',
  'products.edit',
  'products.delete',
  'orders.view_all',
  'orders.accept',
  'orders.update_status',
  'staff.invite',
  'staff.manage_roles',
  'analytics.view_sales',
  'business.edit_profile'
  // No puede: delete business, transfer ownership, remove owner
];
```

#### C. Manager (Gerente)
**Descripción**: Gestión operativa diaria
```javascript
const MANAGER_PERMISSIONS = [
  'products.edit',
  'products.manage_inventory',
  'orders.view_all',
  'orders.accept',
  'orders.update_status',
  'staff.view_performance',
  'analytics.view_sales'
  // No puede: create/delete products, manage staff, edit business
];
```

#### D. Employee (Empleado)
**Descripción**: Operaciones básicas
```javascript
const EMPLOYEE_PERMISSIONS = [
  'products.view',
  'orders.view_assigned',
  'orders.update_status',
  'inventory.update_stock'
  // No puede: manage products, view analytics, manage staff
];
```

## Permission System Architecture

### 1. Backend Permission Validation

```javascript
// shared/services/permission-service.js
export class PermissionService {

  static async getUserPermissions(userId, context = {}) {
    const { businessId, branchId } = context;

    // Get user's system roles
    const user = await getUser(userId);
    const systemPermissions = this.getSystemPermissions(user.roles);

    // Get business-specific permissions if in business context
    let businessPermissions = [];
    if (businessId) {
      const userBusinessRole = await getUserBusinessRole(userId, businessId);
      businessPermissions = this.getBusinessPermissions(
        userBusinessRole.role,
        userBusinessRole.permissions
      );
    }

    return {
      system: systemPermissions,
      business: businessPermissions,
      combined: [...systemPermissions, ...businessPermissions]
    };
  }

  static async checkPermission(userId, permission, context = {}) {
    const permissions = await this.getUserPermissions(userId, context);
    return permissions.combined.includes(permission);
  }

  static async requirePermission(userId, permission, context = {}) {
    const hasPermission = await this.checkPermission(userId, permission, context);
    if (!hasPermission) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  }
}

// Usage in API endpoints
export const updateProduct = async (req, res) => {
  const { userId, businessId } = req.user;
  const { productId } = req.params;

  // Check permission in business context
  await PermissionService.requirePermission(
    userId,
    'products.edit',
    { businessId }
  );

  // Continue with product update...
};
```

### 2. Frontend Permission Hooks

```javascript
// shared/hooks/use-permissions.js
import { useRoleStore } from '../stores/role-store';

export const usePermissions = () => {
  const {
    activeRole,
    activeBusiness,
    getUserPermissions,
    businessPermissions
  } = useRoleStore();

  const checkPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  const requirePermission = (permission) => {
    if (!checkPermission(permission)) {
      throw new Error(`Access denied: Missing ${permission}`);
    }
  };

  return {
    checkPermission,
    requirePermission,
    hasSystemRole: (role) => activeRole === role,
    hasBusinessPermission: (permission) =>
      businessPermissions[activeBusiness]?.includes(permission),
    isOwner: () => checkPermission('business.delete'),
    isAdmin: () => checkPermission('staff.manage_roles'),
    isManager: () => checkPermission('orders.accept')
  };
};

// Permission-based component rendering
export const PermissionGuard = ({
  permission,
  fallback = null,
  children
}) => {
  const { checkPermission } = usePermissions();

  if (!checkPermission(permission)) {
    return fallback;
  }

  return children;
};

// Usage in components
export const ProductManagement = () => {
  return (
    <View>
      <PermissionGuard permission="products.view">
        <ProductList />
      </PermissionGuard>

      <PermissionGuard
        permission="products.create"
        fallback={<Text>No tienes permisos para crear productos</Text>}
      >
        <CreateProductButton />
      </PermissionGuard>
    </View>
  );
};
```

### 3. Role-Based UI Components

```javascript
// shared/components/ui/role-conditional.jsx
export const RoleConditional = ({
  roles = [],
  permissions = [],
  business,
  client,
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
    const hasRequiredPermission = permissions.some(p => checkPermission(p));
    if (!hasRequiredPermission) {
      return fallback;
    }
  }

  // Render role-specific component
  const componentMap = { business, client, delivery };
  return componentMap[activeRole] || fallback;
};

// Usage
<RoleConditional
  roles={['business']}
  permissions={['products.create']}
  business={<CreateProductForm />}
  fallback={<Text>Acceso denegado</Text>}
/>
```

## Gestión de Invitaciones a Negocios

### 1. Business Staff Invitation System

```javascript
// features/business/api/staff-invitations.js
export const inviteStaffMember = async ({
  businessId,
  email,
  role,
  permissions = [],
  branchIds = []
}) => {
  return apiClient.post(`/businesses/${businessId}/invite`, {
    email,
    role,
    permissions,
    branchIds,
    invitationCode: generateInvitationCode()
  });
};

export const acceptBusinessInvitation = async (invitationCode) => {
  return apiClient.post('/invitations/accept', {
    code: invitationCode
  });
};
```

### 2. Invitation Flow UI

```javascript
// features/business/components/staff-invitation-modal.jsx
export const StaffInvitationModal = ({ businessId, visible, onClose }) => {
  const [invitationData, setInvitationData] = useState({
    email: '',
    role: 'employee',
    permissions: [],
    branchIds: []
  });

  const { mutate: sendInvitation, isLoading } = useMutation({
    mutationFn: inviteStaffMember,
    onSuccess: () => {
      showSuccessMessage('Invitación enviada correctamente');
      onClose();
    }
  });

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">Invitar Empleado</Text>

        <Input
          placeholder="Email del empleado"
          value={invitationData.email}
          onChangeText={(email) => setInvitationData(prev => ({ ...prev, email }))}
        />

        <RoleSelector
          selectedRole={invitationData.role}
          onRoleSelect={(role) => setInvitationData(prev => ({ ...prev, role }))}
        />

        <PermissionSelector
          selectedPermissions={invitationData.permissions}
          onPermissionsChange={(permissions) =>
            setInvitationData(prev => ({ ...prev, permissions }))
          }
        />

        <Button
          onPress={() => sendInvitation({ businessId, ...invitationData })}
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar Invitación'}
        </Button>
      </View>
    </Modal>
  );
};
```

## Casos de Uso del Sistema de Permisos

### Caso 1: Cliente se convierte en Business Owner
```javascript
// User workflow
1. Usuario tiene rol "client"
2. Solicita upgrade a business → POST /users/business-upgrade
3. Sistema crea nuevo business y UserBusinessRole con role="owner"
4. Usuario ahora tiene roles: ["client", "business"]
5. Puede alternar entre client mode y business mode
6. Como owner, tiene todos los permisos del negocio
```

### Caso 2: Business Owner invita Manager
```javascript
// Owner workflow
1. Owner envía invitación con role="manager" → POST /businesses/{id}/invite
2. Sistema envía email al invitado con código
3. Invitado acepta → POST /invitations/accept
4. Sistema crea UserBusinessRole para el invitado
5. Invitado ahora puede acceder al business con permisos de manager
6. Business aparece en su lista de availableBusinesses
```

### Caso 3: Manager asigna Employee a Branch específica
```javascript
// Manager workflow
1. Manager invita employee con branchIds: ["branch_001"]
2. Employee solo puede ver/gestionar esa branch específica
3. Permisos restringidos por branch en el frontend y backend
4. Queries automáticamente filtran por branches permitidas
```

## Seguridad y Validación

### 1. Backend Permission Middleware
```javascript
// middleware/permission-middleware.js
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.user;
      const context = {
        businessId: req.params.businessId,
        branchId: req.params.branchId
      };

      await PermissionService.requirePermission(userId, permission, context);
      next();
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
  };
};

// Usage in routes
router.post(
  '/businesses/:businessId/products',
  requireAuth,
  requirePermission('products.create'),
  createProduct
);
```

### 2. Frontend Permission Validation
```javascript
// Validate permissions before API calls
export const useCreateProduct = () => {
  const { requirePermission } = usePermissions();

  return useMutation({
    mutationFn: async (productData) => {
      // Client-side permission check (UX)
      requirePermission('products.create');

      // API call (backend validates again)
      return createProduct(productData);
    }
  });
};
```

## Extensibilidad del Sistema

### Adding New Roles
```javascript
// 1. Add new role to system
const SYSTEM_ROLES = {
  // ... existing roles
  SUPPORT: 'support',
  MODERATOR: 'moderator'
};

// 2. Define role permissions
const SUPPORT_PERMISSIONS = [
  'support.view_tickets',
  'support.respond_tickets',
  'support.escalate_issues'
];

// 3. Add role-specific UI
const roleNavigation = {
  // ... existing navigation
  support: [
    { name: 'Tickets', path: '/(support)/tickets' },
    { name: 'Users', path: '/(support)/users' }
  ]
};
```

Este sistema de roles y permisos proporciona la flexibilidad necesaria para el crecimiento futuro mientras mantiene la seguridad y usabilidad.