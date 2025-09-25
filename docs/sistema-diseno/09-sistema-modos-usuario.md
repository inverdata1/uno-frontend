# 09 - Sistema de Modos de Usuario

## Visión General

El sistema de modos de usuario permite que una sola aplicación soporte múltiples contextos de uso (cliente, negocio, delivery) con una experiencia unificada pero contextualmente apropiada. Cada usuario puede tener acceso a múltiples modos y cambiar entre ellos dinámicamente.

## 9.1 Arquitectura de Modos

### 9.1.1 Principios de Diseño

```javascript
// Principios fundamentales
const PRINCIPIOS_SISTEMA = {
  SINGLE_USER_MULTIPLE_CONTEXTS: 'Un usuario, múltiples contextos',
  ROLE_BASED_SIMPLE: 'Sistema basado en roles (MVP, sin permisos granulares)',
  PERSISTENT_CONTEXT: 'Contexto persistente entre sesiones',
  EXTENSIBLE_ARCHITECTURE: 'Arquitectura extensible para nuevos modos'
}
```

### 9.1.2 Definición de Modos

```javascript
const USER_MODES = {
  CLIENT: {
    id: 'client',
    nombre: 'Cliente',
    icono: 'shopping-bag',
    descripcion: 'Realizar pedidos y gestionar órdenes',
    camposRequeridos: ['phone'],
    navegacion: ['pedidos', 'favoritos', 'perfil'],
    permisos: ['realizar_pedido', 'calificar_negocio']
  },

  BUSINESS: {
    id: 'business',
    nombre: 'Negocio',
    icono: 'store',
    descripcion: 'Gestionar restaurante y recibir pedidos',
    camposRequeridos: ['businessName', 'address', 'businessType'],
    navegacion: ['dashboard', 'pedidos', 'menu', 'sucursales'],
    permisos: ['gestionar_menu', 'ver_analytics', 'gestionar_sucursales'],
    tieneSubContexto: true // Puede tener múltiples negocios + sucursales
  },

  DELIVERY: {
    id: 'delivery',
    nombre: 'Delivery',
    icono: 'truck',
    descripcion: 'Entregar pedidos y generar ingresos',
    camposRequeridos: ['vehicleType', 'licenseNumber'],
    navegacion: ['pedidos_disponibles', 'entrega_activa', 'ganancias'],
    permisos: ['aceptar_entrega', 'actualizar_estado']
  }
}
```

## 9.2 Arquitectura de Base de Datos

### 9.2.1 Tablas Principales

#### `users` - Información Base del Usuario
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  emailVerified BOOLEAN DEFAULT false,
  phoneVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `user_modes` - Control de Acceso a Modos
```sql
CREATE TABLE user_modes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  mode ENUM('client', 'business', 'delivery') NOT NULL,
  status ENUM('active', 'suspended', 'disabled', 'pending') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_mode (userId, mode)
);
```

**Estados de Modo:**
- `active`: Modo completamente funcional
- `suspended`: Deshabilitado temporalmente por admin/sistema
- `disabled`: Usuario eligió deshabilitar (soft delete)
- `pending`: Esperando verificación/aprobación

### 9.2.2 Modo Negocio - Soporte Multi-Sucursal

#### `businesses` - Entidades de Negocio
```sql
CREATE TABLE businesses (
  id VARCHAR(255) PRIMARY KEY,
  ownerId VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  businessType ENUM('restaurant', 'grocery', 'pharmacy', 'retail') NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  taxId VARCHAR(50),
  status ENUM('active', 'suspended', 'closed') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (ownerId),
  INDEX idx_status (status)
);
```

#### `business_branches` - Gestión de Sucursales
```sql
CREATE TABLE business_branches (
  id VARCHAR(255) PRIMARY KEY,
  businessId VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  isMain BOOLEAN DEFAULT false,
  operatingHours JSON, -- {"monday": {"open": "08:00", "close": "22:00"}, ...}
  status ENUM('active', 'suspended', 'closed') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_business (businessId),
  INDEX idx_location (latitude, longitude),
  INDEX idx_status (status)
);
```

#### `user_businesses` - Soporte Multi-Negocio
```sql
CREATE TABLE user_businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  businessId VARCHAR(255) NOT NULL,
  role ENUM('owner', 'manager', 'employee') DEFAULT 'owner',
  permissions JSON, -- Futuro: permisos granulares si se necesita
  status ENUM('active', 'suspended') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_business (userId, businessId),
  INDEX idx_user (userId),
  INDEX idx_business (businessId)
);
```

### 9.2.3 Modo Delivery - Perfiles de Entrega

#### `delivery_profiles` - Información de Repartidores
```sql
CREATE TABLE delivery_profiles (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  vehicleType ENUM('car', 'motorcycle', 'bicycle', 'walking') NOT NULL,
  licenseNumber VARCHAR(50),
  licensePlate VARCHAR(20),
  serviceZones JSON, -- ["centro", "norte", "sur"]
  maxDeliveryDistance INT DEFAULT 10, -- kilómetros
  status ENUM('active', 'suspended', 'offline') DEFAULT 'active',
  documentsVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_delivery (userId),
  INDEX idx_zones (serviceZones),
  INDEX idx_status (status)
);
```

### 9.2.4 Tabla de Relaciones - Pedidos

#### `orders` - Seguimiento de Contexto de Pedidos
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  clientId VARCHAR(255) NOT NULL,
  businessId VARCHAR(255) NOT NULL,
  branchId VARCHAR(255), -- NULL si el negocio no tiene sucursales
  deliveryId VARCHAR(255), -- NULL si no está asignado aún

  -- Detalles del pedido...
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled') NOT NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (clientId) REFERENCES users(id),
  FOREIGN KEY (businessId) REFERENCES businesses(id),
  FOREIGN KEY (branchId) REFERENCES business_branches(id),
  FOREIGN KEY (deliveryId) REFERENCES users(id),

  INDEX idx_client (clientId),
  INDEX idx_business (businessId),
  INDEX idx_branch (branchId),
  INDEX idx_delivery (deliveryId),
  INDEX idx_status (status)
);
```

## 9.3 Estado de Aplicación (Store Persistente)

### 9.3.1 Estructura del Store Zustand

```javascript
const useUserModeStore = create(
  persist(
    (set, get) => ({
      // Contexto de sesión actual
      currentMode: 'client', // 'client' | 'business' | 'delivery'
      currentBusinessId: null, // Si está en modo negocio
      currentBranchId: null, // Si el negocio tiene sucursales

      // Contextos disponibles (cargados desde DB)
      availableModes: [], // Solo modos 'active'

      // Opciones de contexto por modo
      availableContexts: {
        business: [
          {
            businessId: 'biz123',
            businessName: 'Pizza Mario',
            branches: [
              { id: 'branch456', name: 'Sucursal Centro', isMain: true },
              { id: 'branch789', name: 'Sucursal Norte', isMain: false }
            ]
          },
          {
            businessId: 'biz999',
            businessName: 'Burger King',
            branches: []
          }
        ]
      },

      // Acciones
      switchMode: (mode, businessId = null, branchId = null) =>
        set({
          currentMode: mode,
          currentBusinessId: businessId,
          currentBranchId: branchId
        }),

      loadUserModes: async (userId) => {
        // Cargar modos disponibles desde la base de datos
        const modes = await fetchUserModes(userId);
        set({ availableModes: modes });
      },

      loadBusinessContexts: async (userId) => {
        // Cargar negocios y sucursales del usuario
        const contexts = await fetchBusinessContexts(userId);
        set({ availableContexts: { ...get().availableContexts, business: contexts } });
      }
    }),
    {
      name: 'user-mode-storage',
      // Solo persistir datos esenciales
      partialize: (state) => ({
        currentMode: state.currentMode,
        currentBusinessId: state.currentBusinessId,
        currentBranchId: state.currentBranchId
      })
    }
  )
)
```

## 9.4 UX de Cambio de Modo

### 9.4.1 Componente Switcher de Modos

```javascript
const ModeSwitcher = () => {
  const { currentMode, availableContexts, switchMode } = useUserModeStore();

  return (
    <View className="flex-row bg-card border-b border-border">
      {/* Cliente */}
      <ModeButton
        mode="client"
        icon="👤"
        label="Cliente"
        isActive={currentMode === 'client'}
        onPress={() => switchMode('client')}
      />

      {/* Negocios */}
      {availableContexts.business?.map((business) => (
        <BusinessModeButton
          key={business.businessId}
          business={business}
          isActive={currentMode === 'business' && currentBusinessId === business.businessId}
          onPress={(branchId) => switchMode('business', business.businessId, branchId)}
        />
      ))}

      {/* Delivery */}
      {availableModes.includes('delivery') && (
        <ModeButton
          mode="delivery"
          icon="🚚"
          label="Delivery"
          isActive={currentMode === 'delivery'}
          onPress={() => switchMode('delivery')}
        />
      )}
    </View>
  );
};
```

### 9.4.2 Gestión de Sucursales

```javascript
const BusinessModeButton = ({ business, isActive, onPress }) => {
  const [showBranches, setShowBranches] = useState(false);

  const handlePress = () => {
    if (business.branches.length === 0) {
      // No tiene sucursales, activar directamente
      onPress(null);
    } else if (business.branches.length === 1) {
      // Una sucursal, activar directamente
      onPress(business.branches[0].id);
    } else {
      // Múltiples sucursales, mostrar selector
      setShowBranches(true);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} className={cn(
        "px-4 py-2 border-r border-border",
        isActive && "bg-primary-50 border-primary-200"
      )}>
        <Text className="font-medium">🏪 {business.businessName}</Text>
        {business.branches.length > 1 && <Text className="text-xs text-muted-foreground">▼</Text>}
      </TouchableOpacity>

      {/* Selector de Sucursales */}
      <BranchSelector
        visible={showBranches}
        branches={business.branches}
        onSelect={(branchId) => {
          onPress(branchId);
          setShowBranches(false);
        }}
        onClose={() => setShowBranches(false)}
      />
    </>
  );
};
```

## 9.5 Flujo de Registro

### 9.5.1 Registro con Selección de Modo

```javascript
const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState('client');
  const [userData, setUserData] = useState({});

  const steps = {
    1: <BasicInfoStep onNext={(data) => { setUserData(data); setStep(2); }} />,
    2: <ModeSelectionStep
         selectedMode={selectedMode}
         onSelect={setSelectedMode}
         onNext={() => setStep(3)}
       />,
    3: <ModeSpecificStep
         mode={selectedMode}
         userData={userData}
         onComplete={handleRegistration}
       />
  };

  const handleRegistration = async (modeData) => {
    try {
      // 1. Crear usuario
      const user = await createUser(userData);

      // 2. Activar modo cliente por defecto
      await createUserMode(user.id, 'client', 'active');

      // 3. Crear modo específico seleccionado
      if (selectedMode !== 'client') {
        const status = selectedMode === 'delivery' ? 'pending' : 'active';
        await createUserMode(user.id, selectedMode, status);

        // 4. Crear entidades específicas del modo
        if (selectedMode === 'business') {
          await createBusiness(user.id, modeData);
        } else if (selectedMode === 'delivery') {
          await createDeliveryProfile(user.id, modeData);
        }
      }

      // 5. Configurar contexto inicial
      switchMode(selectedMode);

    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  return steps[step];
};
```

### 9.5.2 Componentes de Registro Específico por Modo

```javascript
const ModeSpecificStep = ({ mode, userData, onComplete }) => {
  switch (mode) {
    case 'client':
      return <ClientRegistration userData={userData} onComplete={onComplete} />;

    case 'business':
      return <BusinessRegistration userData={userData} onComplete={onComplete} />;

    case 'delivery':
      return <DeliveryRegistration userData={userData} onComplete={onComplete} />;

    default:
      return null;
  }
};

const BusinessRegistration = ({ userData, onComplete }) => {
  const form = useForm({
    defaultValues: {
      businessName: '',
      businessType: 'restaurant',
      address: '',
      phone: '',
      description: ''
    }
  });

  return (
    <View>
      <Text variant="heading">Información del Negocio</Text>

      <Input
        placeholder="Nombre del negocio"
        {...form.register('businessName')}
      />

      <Select
        placeholder="Tipo de negocio"
        options={BUSINESS_TYPES}
        {...form.register('businessType')}
      />

      <Input
        placeholder="Dirección"
        {...form.register('address')}
      />

      <Button onPress={form.handleSubmit(onComplete)}>
        Completar Registro
      </Button>
    </View>
  );
};
```

## 9.6 Consultas de Base de Datos

### 9.6.1 Cargar Modos Disponibles

```sql
-- Obtener modos activos de un usuario
SELECT mode, status, createdAt
FROM user_modes
WHERE userId = ? AND status = 'active'
ORDER BY createdAt ASC;
```

### 9.6.2 Cargar Contextos de Negocio

```sql
-- Cargar todos los contextos de negocio para el switcher de modos
SELECT
  b.id as businessId,
  b.name as businessName,
  b.businessType,
  ub.role as userRole,
  COUNT(bb.id) as branchCount,
  JSON_ARRAYAGG(
    CASE WHEN bb.id IS NOT NULL THEN
      JSON_OBJECT(
        'id', bb.id,
        'name', bb.name,
        'isMain', bb.isMain,
        'address', bb.address
      )
    END
  ) as branches
FROM businesses b
JOIN user_businesses ub ON b.id = ub.businessId
LEFT JOIN business_branches bb ON b.id = bb.businessId AND bb.status = 'active'
WHERE ub.userId = ?
  AND ub.status = 'active'
  AND b.status = 'active'
GROUP BY b.id, b.name, b.businessType, ub.role
ORDER BY b.createdAt ASC;
```

### 9.6.3 Cambio de Contexto

```sql
-- Verificar que el usuario puede acceder al modo/contexto solicitado
SELECT
  um.mode,
  um.status,
  CASE
    WHEN um.mode = 'business' THEN (
      SELECT COUNT(*) FROM user_businesses ub
      WHERE ub.userId = ? AND ub.businessId = ? AND ub.status = 'active'
    )
    ELSE 1
  END as hasAccess
FROM user_modes um
WHERE um.userId = ? AND um.mode = ? AND um.status = 'active';
```

## 9.7 Migración desde Sistema Actual

### 9.7.1 Pasos de Migración

1. **Crear nuevas tablas**
   ```sql
   -- Ejecutar DDL de todas las tablas nuevas
   CREATE TABLE user_modes (...);
   CREATE TABLE businesses (...);
   -- etc.
   ```

2. **Migrar datos existentes**
   ```sql
   -- Migrar activeRole a user_modes
   INSERT INTO user_modes (userId, mode, status)
   SELECT id, activeRole, 'active'
   FROM users
   WHERE activeRole IS NOT NULL;

   -- Todos los usuarios obtienen modo cliente
   INSERT INTO user_modes (userId, mode, status)
   SELECT id, 'client', 'active'
   FROM users;
   ```

3. **Actualizar código de aplicación**
   - Reemplazar referencias a `activeRole` con store persistente
   - Actualizar todas las consultas basadas en roles

4. **Eliminar campos obsoletos**
   ```sql
   -- Después de verificar que todo funciona
   ALTER TABLE users DROP COLUMN activeRole;
   ```

## 9.8 Consideraciones de Performance

### 9.8.1 Indexing Strategy

```sql
-- Índices críticos para performance
CREATE INDEX idx_user_modes_lookup ON user_modes (userId, status);
CREATE INDEX idx_business_owner ON businesses (ownerId, status);
CREATE INDEX idx_branch_business ON business_branches (businessId, status);
CREATE INDEX idx_orders_context ON orders (businessId, branchId, status);
```

### 9.8.2 Caching Strategy

```javascript
// Cache de contextos de usuario en memoria
const useUserContextCache = () => {
  const queryClient = useQueryClient();

  const cacheUserContexts = useCallback((userId, contexts) => {
    queryClient.setQueryData(['userContexts', userId], contexts, {
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  }, [queryClient]);

  return { cacheUserContexts };
};
```

## 9.9 Extensibilidad Futura

### 9.9.1 Nuevos Modos

Para agregar un nuevo modo (ej: `admin`):

1. **Actualizar enum en DB**
   ```sql
   ALTER TABLE user_modes
   MODIFY mode ENUM('client', 'business', 'delivery', 'admin');
   ```

2. **Agregar configuración de modo**
   ```javascript
   const USER_MODES = {
     ...existing,
     ADMIN: {
       id: 'admin',
       nombre: 'Administrador',
       icono: 'settings',
       // ...
     }
   }
   ```

3. **Crear tablas específicas si es necesario**
4. **Actualizar UI y navegación**

### 9.9.2 Permisos Granulares (Futuro)

```sql
-- Tabla de permisos para implementación futura
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100), -- 'orders', 'menu', 'users'
  action VARCHAR(100)    -- 'create', 'read', 'update', 'delete'
);

CREATE TABLE user_mode_permissions (
  userId VARCHAR(255),
  mode ENUM('client', 'business', 'delivery'),
  permissionId INT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (permissionId) REFERENCES permissions(id),
  PRIMARY KEY (userId, mode, permissionId)
);
```

---

**Última actualización:** ${new Date().toLocaleDateString('es-VE')}
**Versión:** 1.0
**Estado:** ✅ Diseño Completado - Listo para Implementación