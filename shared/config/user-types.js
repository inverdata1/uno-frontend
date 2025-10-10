import { theme } from './theme';

/**
 * User Types Configuration
 * Single source of truth for user type behavior
 */

export const USER_TYPES = {
  CLIENT: 'client',
  BUSINESS: 'business',
  DRIVER: 'driver'
};

// User type definitions
export const USER_TYPE_CONFIG = {
  client: {
    label: 'Cliente',
    subtitle: 'Compra productos',
    description: 'Explora tiendas, realiza pedidos y recibe entregas',
    icon: 'basket',
    benefits: ['Entregas rápidas', 'Miles de productos', 'Ofertas exclusivas'],
    primary: theme.colors.modes.client.primary,
    secondary: theme.colors.modes.client.secondary,
    light: theme.colors.modes.client.light,
    background: theme.colors.modes.client.background,
    homeRoute: '/client/stores',
  },

  business: {
    label: 'Negocio',
    subtitle: 'Vende productos',
    description: 'Gestiona tu tienda, productos e inventario',
    icon: 'briefcase',
    benefits: ['Dashboard completo', 'Gestión de ventas', 'Analytics avanzados'],
    primary: theme.colors.modes.business.primary,
    secondary: theme.colors.modes.business.secondary,
    light: theme.colors.modes.business.light,
    background: theme.colors.modes.business.background,
    homeRoute: '/business/dashboard',
  },

  driver: {
    label: 'Driver',
    subtitle: 'Entrega pedidos',
    description: 'Gana dinero entregando en tu tiempo libre',
    icon: 'bicycle',
    benefits: ['Horarios flexibles', 'Pagos inmediatos', 'Rutas optimizadas'],
    primary: theme.colors.modes.delivery.primary,
    secondary: theme.colors.modes.delivery.secondary,
    light: theme.colors.modes.delivery.light,
    background: theme.colors.modes.delivery.background,
    homeRoute: '/driver/deliveries',
  },
};

// Address behavior configurations
export const ADDRESS_BEHAVIORS = {
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
  driver: {
    type: 'coverage',
    label: 'Zona de cobertura',
    placeholder: 'Agregar zona de trabajo',
    icon: 'bicycle',
    description: 'Área donde puedes hacer entregas'
  }
};

// Helper functions
export const getUserTypeConfig = (userType) => {
  const config = USER_TYPE_CONFIG[userType] || USER_TYPE_CONFIG.client;
  return {
    ...config,
    gradient: [config.primary, config.secondary], // Add gradient array
  };
};

export const getUserTypeColors = (userType) => {
  const config = getUserTypeConfig(userType);
  return {
    primary: config.primary,
    secondary: config.secondary,
    light: config.light,
    background: config.background,
    gradient: [config.primary, config.secondary],
  };
};

export const getAddressBehavior = (userType) => {
  return ADDRESS_BEHAVIORS[userType] || ADDRESS_BEHAVIORS.client;
};

export const getUserTypeHomeRoute = (userType) => {
  return USER_TYPE_CONFIG[userType]?.homeRoute || '/client/stores';
};

export const getAllUserTypes = () => Object.keys(USER_TYPE_CONFIG);
export const isValidUserType = (userType) => userType in USER_TYPE_CONFIG;
export const getDefaultUserType = () => USER_TYPES.CLIENT;
