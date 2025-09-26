import { theme } from './theme';

// Centralized mode configuration
// All mode-related UI, colors, and configuration in one place

// Mode color definitions
const modeColors = {
  client: {
    primary: theme.colors.modes.client.primary,
    secondary: theme.colors.modes.client.secondary,
    light: theme.colors.modes.client.light,
    background: theme.colors.modes.client.background,
  },
  business: {
    primary: theme.colors.modes.business.primary,
    secondary: theme.colors.modes.business.secondary,
    light: theme.colors.modes.business.light,
    background: theme.colors.modes.business.background,
  },
  delivery: {
    primary: theme.colors.modes.delivery.primary,
    secondary: theme.colors.modes.delivery.secondary,
    light: theme.colors.modes.delivery.light,
    background: theme.colors.modes.delivery.background,
  },
};

// Mode UI configuration
const modeDefinitions = {
  client: {
    title: 'Cliente',
    subtitle: 'Compra productos',
    description: 'Explora tiendas, realiza pedidos y recibe entregas',
    icon: 'basket',
    benefits: ['Entregas rápidas', 'Miles de productos', 'Ofertas exclusivas'],
  },
  business: {
    title: 'Negocio',
    subtitle: 'Vende productos',
    description: 'Gestiona tu tienda, productos e inventario',
    icon: 'briefcase',
    benefits: ['Dashboard completo', 'Gestión de ventas', 'Analytics avanzados'],
  },
  delivery: {
    title: 'Delivery',
    subtitle: 'Entrega pedidos',
    description: 'Gana dinero entregando en tu tiempo libre',
    icon: 'bicycle',
    benefits: ['Horarios flexibles', 'Pagos inmediatos', 'Rutas optimizadas'],
  },
};

// Utilities

/**
 * Get colors for a specific mode
 */
export const getModeColors = (mode) => {
  const colors = modeColors[mode] || modeColors.client;
  return {
    ...colors,
    gradient: [colors.primary, colors.secondary],
  };
};

/**
 * Get complete configuration for a mode (UI + colors)
 */
export const getModeConfig = (mode) => {
  const definition = modeDefinitions[mode] || modeDefinitions.client;
  const colors = getModeColors(mode);

  return {
    ...definition,
    ...colors,
  };
};

/**
 * Get all available modes
 */
export const getAllModes = () => Object.keys(modeDefinitions);

/**
 * Check if a mode is valid
 */
export const isValidMode = (mode) => mode in modeDefinitions;

/**
 * Get mode color by mode key (for Tailwind classes)
 */
export const getModeColorForTailwind = (mode) => {
  const colors = getModeColors(mode);
  return colors.primary;
};

// Export constants
export const MODES = {
  CLIENT: 'client',
  BUSINESS: 'business',
  DELIVERY: 'delivery',
};

export const DEFAULT_MODE = MODES.CLIENT;