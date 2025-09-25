import { BaseFirebaseService } from '../base-firebase-service';

/**
 * UserModes resource - handles user mode management
 * Specializes in mode switching and mode status management
 */
export class UserModesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'users'); // Uses same collection as users
    this.businessesService = new BaseFirebaseService(client, 'businesses');
    this.branchesService = new BaseFirebaseService(client, 'branches');
  }

  /**
   * Handle incoming requests
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action || 'index'}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in UserModesResource`);
    }

    return await this[handler](data, params);
  }

  // === MODE ENDPOINTS ===

  /**
   * GET /user-modes
   * Get user's available modes and current context
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    const user = await this.findById(userId);
    const modes = this.extractModesFromUser(user);

    // If user has business mode, load business contexts
    if (modes.availableModes.includes('business')) {
      modes.businessContexts = await this.getBusinessContexts(userId);
    }

    return modes;
  }

  /**
   * POST /user-modes
   * Add a new mode to user
   */
  async post_index(data, params) {
    const { userId } = params;
    const { mode, status = 'pending', modeData = {} } = data;

    if (!userId || !mode) {
      throw new Error('userId and mode are required');
    }

    const validModes = ['client', 'business', 'delivery'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
    }

    const user = await this.findById(userId);

    // Check if mode already exists
    if (user.modes && user.modes[mode]) {
      throw new Error(`User already has ${mode} mode with status: ${user.modes[mode].status}`);
    }

    const updatedModes = {
      ...user.modes,
      [mode]: {
        status,
        createdAt: new Date(),
        ...modeData
      }
    };

    await this.update(userId, { modes: updatedModes });

    return this.get_index(null, { userId });
  }

  /**
   * PATCH /user-modes/status
   * Update mode status
   */
  async patch_status(data, params) {
    const { userId } = params;
    const { mode, status } = data;

    if (!userId || !mode || !status) {
      throw new Error('userId, mode, and status are required');
    }

    const validStatuses = ['pending', 'active', 'suspended', 'disabled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
    }

    const user = await this.findById(userId);

    if (!user.modes || !user.modes[mode]) {
      throw new Error(`User does not have ${mode} mode`);
    }

    const updatedModes = {
      ...user.modes,
      [mode]: {
        ...user.modes[mode],
        status,
        updatedAt: new Date()
      }
    };

    await this.update(userId, { modes: updatedModes });

    return this.get_index(null, { userId });
  }

  /**
   * POST /user-modes/switch
   * Switch user's current mode
   */
  async post_switch(data, params) {
    const { userId } = params;
    const { mode, businessId, branchId } = data;

    if (!userId || !mode) {
      throw new Error('userId and mode are required');
    }

    // Verify user has this mode and it's active
    const user = await this.findById(userId);
    const userModes = this.extractModesFromUser(user);

    if (!userModes.availableModes.includes(mode)) {
      throw new Error(`User does not have access to ${mode} mode`);
    }

    // If switching to business mode, validate businessId
    if (mode === 'business') {
      if (!businessId) {
        throw new Error('businessId is required when switching to business mode');
      }

      // Verify user owns this business
      const business = await this.businessesService.findById(businessId);
      if (business.ownerId !== userId) {
        throw new Error('Access denied: You do not own this business');
      }

      // If branchId provided, verify it belongs to the business
      if (branchId) {
        const branch = await this.branchesService.findById(branchId);
        if (branch.businessId !== businessId) {
          throw new Error('Branch does not belong to the specified business');
        }
      }
    }

    // Update user's current context
    const updateData = {
      currentMode: mode,
      currentBusinessId: mode === 'business' ? businessId : null,
      currentBranchId: mode === 'business' ? branchId : null,
      lastModeSwitch: new Date()
    };

    await this.update(userId, updateData);

    return {
      success: true,
      currentMode: mode,
      currentContext: {
        businessId: mode === 'business' ? businessId : null,
        branchId: mode === 'business' ? branchId : null
      }
    };
  }

  // === UTILITY METHODS ===

  /**
   * Extract modes information from user document
   */
  extractModesFromUser(user) {
    const modes = [];

    // Process each mode
    Object.entries(user.modes || {}).forEach(([mode, config]) => {
      modes.push({ mode, ...config });
    });

    // If no modes exist, default to client
    if (modes.length === 0) {
      modes.push({
        mode: 'client',
        status: 'active',
        createdAt: user.createdAt || new Date()
      });
    }

    return {
      availableModes: modes.filter(m => m.status === 'active').map(m => m.mode),
      allModes: modes,
      currentMode: user.currentMode || 'client',
      currentContext: {
        businessId: user.currentBusinessId,
        branchId: user.currentBranchId
      },
      lastModeSwitch: user.lastModeSwitch
    };
  }

  /**
   * Get business contexts for mode switcher
   */
  async getBusinessContexts(userId) {
    const businesses = await this.businessesService.findAll({ ownerId: userId });
    const contexts = [];

    for (const business of businesses) {
      // Load branches for this business
      const branches = await this.branchesService.findAll({
        businessId: business.id
      }, { orderBy: 'createdAt', order: 'asc' });

      contexts.push({
        businessId: business.id,
        businessName: business.name,
        businessType: business.businessType,
        status: business.status,
        branches: branches.map(branch => ({
          id: branch.id,
          name: branch.name,
          isMain: branch.isMain,
          address: branch.address,
          status: branch.status
        }))
      });
    }

    return contexts;
  }

  /**
   * Initialize default modes for new user
   */
  async initializeUserModes(userId) {
    const user = await this.findById(userId);

    // If user already has modes, don't override
    if (user.modes && Object.keys(user.modes).length > 0) {
      return this.extractModesFromUser(user);
    }

    // Set up default client mode
    const defaultModes = {
      client: {
        status: 'active',
        createdAt: new Date()
      }
    };

    const updateData = {
      modes: defaultModes,
      currentMode: 'client',
      currentBusinessId: null,
      currentBranchId: null
    };

    await this.update(userId, updateData);

    const updatedUser = await this.findById(userId);
    return this.extractModesFromUser(updatedUser);
  }
}