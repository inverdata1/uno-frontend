import {
  getModeConfig,
  getModeColors,
  getTabConfig,
  getPermissions,
  getAddressBehavior,
  getModeSettings,
  getAllModes,
  isValidMode,
  getDefaultMode
} from './mode-config';

/**
 * Central mode management system
 * Handles mode-specific logic and component resolution
 */
export const ModeManager = {
  /**
   * Get the home content component for a specific mode
   * Uses lazy loading to avoid circular dependencies
   */
  async getHomeContent(mode) {
    switch (mode) {
      case 'client':
        const { ClientModeContent } = await import('../client/components');
        return ClientModeContent;
      case 'business':
        const { BusinessModeContent } = await import('../business/components');
        return BusinessModeContent;
      case 'delivery':
        const { DeliveryModeContent } = await import('../delivery/components');
        return DeliveryModeContent;
      default:
        const { ClientModeContent: DefaultContent } = await import('../client/components');
        return DefaultContent;
    }
  },

  // Delegate to config functions
  getTabConfig,
  getPermissions,
  getAddressBehavior,
  getModeSettings,
  getModeColors,
  getModeConfig,
  getAllModes,
  isValidMode,
  getDefaultMode,

  /**
   * Check if a mode has permission for an action
   */
  hasPermission(mode, action) {
    const permissions = getPermissions(mode);
    return permissions.includes(action);
  }
};