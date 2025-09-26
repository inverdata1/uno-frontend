import { theme } from '../../shared/config/theme';

/**
 * Pure mode configuration data
 * No circular dependencies - just data and utilities
 */

// Mode definitions with UI and behavior config
export const modeDefinitions = {
  client: {
    title: 'Cliente',
    subtitle: 'Compra productos',
    description: 'Explora tiendas, realiza pedidos y recibe entregas',
    icon: 'basket',
    benefits: ['Entregas rápidas', 'Miles de productos', 'Ofertas exclusivas'],
    primary: theme.colors.modes.client.primary,
    secondary: theme.colors.modes.client.secondary,
    light: theme.colors.modes.client.light,
    background: theme.colors.modes.client.background,
  },
  business: {
    title: 'Negocio',
    subtitle: 'Vende productos',
    description: 'Gestiona tu tienda, productos e inventario',
    icon: 'briefcase',
    benefits: ['Dashboard completo', 'Gestión de ventas', 'Analytics avanzados'],
    primary: theme.colors.modes.business.primary,
    secondary: theme.colors.modes.business.secondary,
    light: theme.colors.modes.business.light,
    background: theme.colors.modes.business.background,
  },
  delivery: {
    title: 'Delivery',
    subtitle: 'Entrega pedidos',
    description: 'Gana dinero entregando en tu tiempo libre',
    icon: 'bicycle',
    benefits: ['Horarios flexibles', 'Pagos inmediatos', 'Rutas optimizadas'],
    primary: theme.colors.modes.delivery.primary,
    secondary: theme.colors.modes.delivery.secondary,
    light: theme.colors.modes.delivery.light,
    background: theme.colors.modes.delivery.background,
  },
};

// Tab configurations
export const tabConfigs = {
  client: [
    { name: 'index', title: 'Inicio', icon: 'home' },
    { name: 'client/restaurants', title: 'Productos', icon: 'basket' },
    { name: 'client/orders', title: 'Pedidos', icon: 'receipt' },
    { name: 'profile', title: 'Perfil', icon: 'person' }
  ],
  business: [
    { name: 'index', title: 'Inicio', icon: 'home' },
    { name: 'business/dashboard', title: 'Dashboard', icon: 'analytics' },
    { name: 'business/products', title: 'Productos', icon: 'storefront' },
    { name: 'profile', title: 'Perfil', icon: 'person' }
  ],
  delivery: [
    { name: 'index', title: 'Inicio', icon: 'home' },
    { name: 'delivery/dashboard', title: 'Entregas', icon: 'bicycle' },
    { name: 'profile', title: 'Perfil', icon: 'person' }
  ]
};

// Permission configurations
export const permissionConfigs = {
  client: [
    'orders.create',
    'orders.view',
    'products.browse',
    'addresses.manage',
    'payments.use'
  ],
  business: [
    'orders.receive',
    'orders.fulfill',
    'products.manage',
    'business.manage',
    'analytics.view'
  ],
  delivery: [
    'orders.deliver',
    'orders.track',
    'routes.optimize',
    'earnings.view',
    'availability.manage'
  ]
};

// Address behavior configurations
export const addressBehaviors = {
  client: {
    type: 'delivery',
    label: 'Entregar en',
    placeholder: 'Agregar dirección de entrega',
    icon: 'home',
    description: 'Donde recibirás tus pedidos'
  },
  business: {
    type: 'business',
    label: 'Ubicación del negocio',
    placeholder: 'Agregar dirección del negocio',
    icon: 'storefront',
    description: 'Donde opera tu negocio'
  },
  delivery: {
    type: 'coverage',
    label: 'Zona de cobertura',
    placeholder: 'Agregar zona de trabajo',
    icon: 'bicycle',
    description: 'Área donde puedes hacer entregas'
  }
};

// Pure utility functions (no imports from components)
export const getModeConfig = (mode) => {
  const definition = modeDefinitions[mode] || modeDefinitions.client;
  return {
    title: definition.title,
    subtitle: definition.subtitle,
    description: definition.description,
    icon: definition.icon,
    benefits: definition.benefits,
    primary: definition.primary,
    secondary: definition.secondary,
    light: definition.light,
    background: definition.background,
    gradient: [definition.primary, definition.secondary],
  };
};

export const getModeColors = (mode) => {
  const definition = modeDefinitions[mode] || modeDefinitions.client;
  return {
    primary: definition.primary,
    secondary: definition.secondary,
    light: definition.light,
    background: definition.background,
    gradient: [definition.primary, definition.secondary],
  };
};

export const getTabConfig = (mode) => {
  return tabConfigs[mode] || tabConfigs.client;
};

export const getPermissions = (mode) => {
  return permissionConfigs[mode] || [];
};

export const getAddressBehavior = (mode) => {
  return addressBehaviors[mode] || addressBehaviors.client;
};

export const getModeSettings = (mode) => {
  return {
    ...getModeConfig(mode),
    ...getAddressBehavior(mode),
    permissions: getPermissions(mode),
    tabs: getTabConfig(mode)
  };
};

// Utility methods
export const getAllModes = () => Object.keys(modeDefinitions);
export const isValidMode = (mode) => mode in modeDefinitions;
export const getDefaultMode = () => 'client';