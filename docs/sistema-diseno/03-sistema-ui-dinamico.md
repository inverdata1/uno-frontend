# Sistema UI Dinámico - UNO Delivery

## Overview del Sistema UI

El sistema UI dinámico permite que una sola aplicación se transforme completamente según el rol activo del usuario, proporcionando experiencias nativas y optimizadas para cada contexto.

### Principios de Diseño UI

```javascript
┌─────────────────────────────────────────────────────────────┐
│                 ADAPTIVE UI SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Client Mode │ │Business Mode│ │Delivery Mode│           │
│  │             │ │             │ │  (Future)   │           │
│  │ 🛍️ Shopping │ │ 📊 Dashboard│ │ 🚚 Routes   │           │
│  │ 📋 Orders   │ │ 📦 Products │ │ 💰 Earnings │           │
│  │ 👤 Profile  │ │ 📈 Analytics│ │ ⭐ Ratings  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Theme System por Rol

### Paleta de Colores Contextual

```javascript
// shared/theme/colors.js
export const colors = {
  client: {
    primary: '#FF6B35',      // Orange vibrante para energía
    secondary: '#F7931E',    // Orange complementario
    accent: '#FFD23F',       // Amarillo para ofertas
    background: '#F8F9FA',   // Gris claro
    surface: '#FFFFFF',
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280'
    }
  },

  business: {
    primary: '#2563EB',      // Azul profesional
    secondary: '#1E40AF',    // Azul más oscuro
    accent: '#10B981',       // Verde para éxito/ganancias
    background: '#F1F5F9',   // Gris azulado
    surface: '#FFFFFF',
    text: {
      primary: '#0F172A',
      secondary: '#475569'
    }
  },

  delivery: {
    primary: '#7C3AED',      // Morado distintivo
    secondary: '#5B21B6',    // Morado oscuro
    accent: '#F59E0B',       // Amarillo para alertas
    background: '#FAF7FF',   // Morado muy claro
    surface: '#FFFFFF',
    text: {
      primary: '#1E1B31',
      secondary: '#6B7280'
    }
  }
};

// Hook para tema dinámico
export const useTheme = () => {
  const { activeRole } = useRoleStore();
  return colors[activeRole] || colors.client;
};
```

### Sistema de Componentes Adaptativos

```javascript
// shared/components/ui/themed-button.jsx
export const ThemedButton = ({
  variant = 'primary',
  role = null,
  children,
  ...props
}) => {
  const { activeRole } = useRoleStore();
  const contextRole = role || activeRole;
  const theme = colors[contextRole];

  const variants = {
    primary: `bg-[${theme.primary}] border-[${theme.primary}]`,
    secondary: `bg-[${theme.secondary}] border-[${theme.secondary}]`,
    outline: `bg-transparent border-[${theme.primary}] text-[${theme.primary}]`,
    accent: `bg-[${theme.accent}] border-[${theme.accent}]`
  };

  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-lg border-2 ${variants[variant]}`}
      {...props}
    >
      <Text className={`text-center font-medium ${
        variant === 'outline' ? `text-[${theme.primary}]` : 'text-white'
      }`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// shared/components/ui/role-header.jsx
export const RoleHeader = ({ title, subtitle }) => {
  const { activeRole, activeBusiness } = useRoleStore();
  const theme = useTheme();

  const headerConfig = {
    client: {
      greeting: '¡Hola!',
      icon: '🛍️',
      actions: [
        { icon: 'search', action: () => router.push('/search') },
        { icon: 'shopping-cart', action: () => router.push('/cart'), badge: true }
      ]
    },
    business: {
      greeting: 'Dashboard',
      icon: '📊',
      actions: [
        { icon: 'bell', action: () => router.push('/notifications'), badge: true },
        { icon: 'settings', action: () => router.push('/business/settings') }
      ]
    },
    delivery: {
      greeting: 'En Ruta',
      icon: '🚚',
      actions: [
        { icon: 'map-pin', action: () => router.push('/delivery/map') },
        { icon: 'clock', action: () => router.push('/delivery/schedule') }
      ]
    }
  };

  const config = headerConfig[activeRole];

  return (
    <View className={`px-4 py-6 bg-[${theme.primary}] safe-area-top`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-3xl mr-2">{config.icon}</Text>
          <View>
            <Text className="text-white text-lg font-medium">
              {title || config.greeting}
            </Text>
            {subtitle && (
              <Text className="text-white/80 text-sm">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row space-x-3">
          {config.actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.action}
              className="relative p-2"
            >
              <Feather name={action.icon} size={20} color="white" />
              {action.badge && (
                <BadgeIndicator position="top-right" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Business Context Bar */}
      {activeRole === 'business' && activeBusiness && (
        <BusinessContextIndicator />
      )}
    </View>
  );
};
```

## Navigation System Dinámico

### Tab Bar Contextual

```javascript
// shared/components/navigation/adaptive-tab-bar.jsx
export const AdaptiveTabBar = () => {
  const { activeRole } = useRoleStore();
  const theme = useTheme();

  const tabConfigurations = {
    client: [
      { name: 'Inicio', icon: 'home', route: '/(client)/home' },
      { name: 'Explorar', icon: 'compass', route: '/(client)/search' },
      { name: 'Pedidos', icon: 'shopping-bag', route: '/(client)/orders', badge: 'orders' },
      { name: 'Perfil', icon: 'user', route: '/(client)/profile' }
    ],

    business: [
      { name: 'Dashboard', icon: 'bar-chart-2', route: '/(business)/dashboard' },
      { name: 'Pedidos', icon: 'shopping-bag', route: '/(business)/orders', badge: 'pending' },
      { name: 'Productos', icon: 'package', route: '/(business)/products' },
      { name: 'Análisis', icon: 'trending-up', route: '/(business)/analytics' },
      { name: 'Más', icon: 'more-horizontal', route: '/(business)/more' }
    ],

    delivery: [
      { name: 'Disponible', icon: 'check-circle', route: '/(delivery)/available' },
      { name: 'Activos', icon: 'clock', route: '/(delivery)/active', badge: 'active' },
      { name: 'Historial', icon: 'list', route: '/(delivery)/history' },
      { name: 'Ganancias', icon: 'dollar-sign', route: '/(delivery)/earnings' }
    ]
  };

  const tabs = tabConfigurations[activeRole] || tabConfigurations.client;

  return (
    <View className={`flex-row bg-white border-t border-gray-200 safe-area-bottom`}>
      {tabs.map((tab, index) => (
        <TabBarItem
          key={tab.name}
          {...tab}
          theme={theme}
          isActive={/* current route logic */}
        />
      ))}
    </View>
  );
};

const TabBarItem = ({ name, icon, route, badge, theme, isActive }) => {
  const badgeCount = useBadgeCount(badge);

  return (
    <TouchableOpacity
      className={`flex-1 items-center justify-center py-3 relative`}
      onPress={() => router.push(route)}
    >
      <View className="relative">
        <Feather
          name={icon}
          size={20}
          color={isActive ? theme.primary : '#6B7280'}
        />
        {badgeCount > 0 && (
          <View className={`absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 justify-center items-center`}>
            <Text className="text-white text-xs font-medium">
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </View>
      <Text
        className={`text-xs mt-1 font-medium ${
          isActive ? `text-[${theme.primary}]` : 'text-gray-500'
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};
```

### Role Switcher Modal

```javascript
// shared/components/role-switcher/role-switcher-modal.jsx
export const RoleSwitcherModal = () => {
  const {
    activeRole,
    availableRoles,
    userBusinesses,
    showRoleSwitcher,
    setShowRoleSwitcher,
    switchRole
  } = useRoleStore();

  const roleConfigs = {
    client: {
      title: 'Modo Cliente',
      subtitle: 'Explora y haz pedidos',
      icon: '🛍️',
      color: colors.client.primary,
      features: ['Explorar restaurantes', 'Hacer pedidos', 'Seguir entregas']
    },
    business: {
      title: 'Modo Negocio',
      subtitle: 'Administra tu restaurante',
      icon: '🏪',
      color: colors.business.primary,
      features: ['Gestionar productos', 'Ver pedidos', 'Analizar ventas']
    },
    delivery: {
      title: 'Modo Delivery',
      subtitle: 'Entrega y gana dinero',
      icon: '🚚',
      color: colors.delivery.primary,
      features: ['Rutas optimizadas', 'Ganancias en tiempo real', 'Historial detallado']
    }
  };

  const handleRoleSwitch = async (role, options = {}) => {
    setShowRoleSwitcher(false);
    await switchRole(role, options);
  };

  return (
    <Modal
      visible={showRoleSwitcher}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">
              Cambiar Modo
            </Text>
            <TouchableOpacity onPress={() => setShowRoleSwitcher(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {availableRoles.map((role) => {
            const config = roleConfigs[role];
            const isActive = role === activeRole;

            return (
              <TouchableOpacity
                key={role}
                onPress={() => !isActive && handleRoleSwitch(role)}
                className={`p-4 rounded-xl border-2 mb-4 ${
                  isActive
                    ? `border-[${config.color}] bg-[${config.color}]/5`
                    : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-center mb-3">
                  <Text className="text-3xl mr-3">{config.icon}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`text-lg font-semibold ${
                        isActive ? `text-[${config.color}]` : 'text-gray-900'
                      }`}>
                        {config.title}
                      </Text>
                      {isActive && (
                        <View className={`ml-2 px-2 py-1 rounded-full bg-[${config.color}]`}>
                          <Text className="text-white text-xs font-medium">Activo</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-600 text-sm">
                      {config.subtitle}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2">
                  {config.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Feather
                        name="check"
                        size={14}
                        color={isActive ? config.color : '#10B981'}
                      />
                      <Text className={`ml-2 text-sm ${
                        isActive ? `text-[${config.color}]` : 'text-gray-600'
                      }`}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Business Selection for Business Role */}
                {role === 'business' && userBusinesses.length > 1 && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Negocio:
                    </Text>
                    <BusinessSelector
                      businesses={userBusinesses}
                      onSelect={(businessId) =>
                        handleRoleSwitch('business', { businessId })
                      }
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Role Actions */}
        <View className="p-4 border-t border-gray-200 bg-gray-50">
          <Text className="text-center text-sm text-gray-600 mb-3">
            Accesos Rápidos
          </Text>
          <View className="flex-row justify-around">
            <TouchableOpacity
              onPress={() => router.push('/settings/roles')}
              className="items-center"
            >
              <Feather name="settings" size={20} color="#6B7280" />
              <Text className="text-xs text-gray-600 mt-1">Configurar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/help/roles')}
              className="items-center"
            >
              <Feather name="help-circle" size={20} color="#6B7280" />
              <Text className="text-xs text-gray-600 mt-1">Ayuda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/business/register')}
              className="items-center"
            >
              <Feather name="plus-circle" size={20} color="#6B7280" />
              <Text className="text-xs text-gray-600 mt-1">Nuevo Negocio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
```

## Componentes Condicionales por Rol

### Permission-Based Rendering

```javascript
// shared/components/ui/role-conditional.jsx
export const RoleConditional = ({
  roles = [],
  permissions = [],
  children,
  fallback = null
}) => {
  const { activeRole } = useRoleStore();
  const { hasPermission } = usePermissions();

  // Check role access
  if (roles.length > 0 && !roles.includes(activeRole)) {
    return fallback;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasRequiredPermission = permissions.some(permission =>
      hasPermission(permission)
    );
    if (!hasRequiredPermission) return fallback;
  }

  return children;
};

// Ejemplos de uso
export const OrdersScreen = () => (
  <View className="flex-1">
    <RoleConditional roles={['client']}>
      <ClientOrdersList />
    </RoleConditional>

    <RoleConditional roles={['business']}>
      <BusinessOrdersManager />
    </RoleConditional>

    <RoleConditional roles={['delivery']}>
      <DeliveryOrdersQueue />
    </RoleConditional>
  </View>
);

export const BusinessDashboard = () => (
  <ScrollView>
    {/* Always visible */}
    <OrdersOverview />

    {/* Permission-based */}
    <RoleConditional permissions={['view_analytics']}>
      <AnalyticsDashboard />
    </RoleConditional>

    <RoleConditional permissions={['manage_staff']}>
      <StaffManagement />
    </RoleConditional>

    <RoleConditional permissions={['financial_reports']}>
      <FinancialReports />
    </RoleConditional>
  </ScrollView>
);
```

### Dynamic Form Fields

```javascript
// shared/components/forms/adaptive-product-form.jsx
export const AdaptiveProductForm = ({ product, onSubmit }) => {
  const { activeRole } = useRoleStore();
  const { hasPermission } = usePermissions();
  const theme = useTheme();

  const form = useForm({
    defaultValues: product || {},
    validatorAdapter: zodValidator(),
  });

  return (
    <Form form={form} onSubmit={onSubmit}>
      {/* Basic fields - always visible */}
      <Input name="name" placeholder="Nombre del producto" />
      <Input name="description" placeholder="Descripción" multiline />
      <Input name="price" placeholder="Precio" keyboardType="numeric" />

      {/* Business role specific */}
      <RoleConditional roles={['business']}>
        <Input name="category" placeholder="Categoría" />
        <Input name="preparationTime" placeholder="Tiempo de preparación (min)" />
      </RoleConditional>

      {/* Advanced permissions */}
      <RoleConditional permissions={['manage_inventory']}>
        <Input name="stock" placeholder="Stock disponible" keyboardType="numeric" />
        <Input name="lowStockAlert" placeholder="Alerta stock bajo" />
      </RoleConditional>

      <RoleConditional permissions={['advanced_pricing']}>
        <View className="mt-4">
          <Text className="text-gray-700 font-medium mb-2">Precios Dinámicos</Text>
          <DynamicPricingFields />
        </View>
      </RoleConditional>

      <ThemedButton variant="primary" onPress={form.handleSubmit}>
        {product ? 'Actualizar Producto' : 'Crear Producto'}
      </ThemedButton>
    </Form>
  );
};
```

## Responsive Layout System

### Screen Size Adaptations

```javascript
// shared/hooks/use-responsive.js
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return {
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
    isTablet: width >= 768,
    orientation: width > height ? 'landscape' : 'portrait',

    // Role-specific breakpoints
    getColumnsCount: (role) => {
      const columnMap = {
        client: { small: 1, medium: 2, large: 2, tablet: 3 },
        business: { small: 1, medium: 1, large: 2, tablet: 3 },
        delivery: { small: 1, medium: 1, large: 1, tablet: 2 }
      };

      const config = columnMap[role] || columnMap.client;
      if (width >= 768) return config.tablet;
      if (width >= 414) return config.large;
      if (width >= 375) return config.medium;
      return config.small;
    }
  };
};

// shared/components/ui/responsive-grid.jsx
export const ResponsiveGrid = ({ role, children, ...props }) => {
  const { getColumnsCount } = useResponsive();
  const columns = getColumnsCount(role);

  return (
    <View
      className={`flex-row flex-wrap justify-between`}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={{ width: `${(100 / columns) - 1}%` }}
          className="mb-4"
        >
          {child}
        </View>
      ))}
    </View>
  );
};
```

Este sistema UI dinámico permite que la aplicación se sienta como aplicaciones nativas separadas para cada rol, mientras mantiene una arquitectura unificada y consistente.