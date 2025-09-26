import { BaseFirebaseService } from './base-firebase-service';
import { serverTimestamp } from 'firebase/firestore';

/**
 * Users resource - handles all user-related operations
 * Extends BaseFirebaseService for common CRUD operations
 */
export class UsersResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'users');
  }

  /**
   * Handle incoming requests and route to appropriate method
   * @param {string} method - HTTP method
   * @param {string} action - Action/endpoint path
   * @param {Object} data - Request data
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace('/', '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in UsersResource`);
    }

    return await this[handler](data, params);
  }

  // === USER CRUD ENDPOINTS ===

  /**
   * POST /users
   * Create a new user (used during registration)
   */
  async post_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    // Use the user ID from params as the document ID
    const userWithModes = {
      ...data,
      id: userId,
      modes: data.modes || {
        client: {
          status: 'active',
          createdAt: new Date()
        }
      },
      currentMode: data.currentMode || 'client',
      currentBusinessId: data.currentBusinessId || null,
      currentBranchId: data.currentBranchId || null
    };

    return await this.create(userWithModes, userId);
  }

  // === PROFILE ENDPOINTS ===

  /**
   * GET /users/profile
   * Get current user profile
   */
  async get_profile(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this.findById(userId);
  }

  /**
   * PUT /users/profile
   * Update current user profile
   */
  async put_profile(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    // Filter out sensitive fields that shouldn't be updated this way
    const { id, createdAt, ...updateData } = data;

    return await this.update(userId, updateData);
  }

  // === MODE MANAGEMENT ENDPOINTS ===

  /**
   * POST /users/switch-mode
   * Switch user's active mode
   */
  async post_switch_mode(data, params) {
    const { userId } = params;
    const { mode, businessId, branchId } = data;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    if (!mode) {
      throw new Error('mode is required');
    }

    // Validate mode
    const validModes = ['client', 'business', 'delivery'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
    }

    // Update user's current context
    const updateData = {
      currentMode: mode,
      currentBusinessId: businessId || null,
      currentBranchId: branchId || null,
      lastModeSwitch: serverTimestamp()
    };

    const updatedUser = await this.update(userId, updateData);

    return {
      success: true,
      currentMode: mode,
      currentBusinessId: businessId || null,
      currentBranchId: branchId || null,
      user: updatedUser
    };
  }

  /**
   * POST /users/enable-mode
   * Enable a new mode for user (e.g., upgrade to business)
   */
  async post_enable_mode(data, params) {
    const { userId } = params;
    const { mode, status = 'pending', modeData = {} } = data;

    if (!userId || !mode) {
      throw new Error('userId and mode are required');
    }

    const user = await this.findById(userId);

    // Update user modes
    const updatedModes = {
      ...user.modes,
      [mode]: {
        status,
        createdAt: new Date(),
        ...modeData
      }
    };

    return await this.update(userId, { modes: updatedModes });
  }

  /**
   * PATCH /users/mode-status
   * Update mode status (e.g., pending -> active)
   */
  async patch_mode_status(data, params) {
    const { userId } = params;
    const { mode, status } = data;

    if (!userId || !mode || !status) {
      throw new Error('userId, mode, and status are required');
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

    return await this.update(userId, { modes: updatedModes });
  }

  // === UTILITY METHODS ===

  /**
   * Get user's available modes
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User modes information
   */
  async getUserModes(userId) {
    const user = await this.findById(userId);

    const modes = [];
    if (user.modes?.client) modes.push({ mode: 'client', ...user.modes.client });
    if (user.modes?.business) modes.push({ mode: 'business', ...user.modes.business });
    if (user.modes?.delivery) modes.push({ mode: 'delivery', ...user.modes.delivery });

    return {
      availableModes: modes.filter(m => m.status === 'active').map(m => m.mode),
      allModes: modes,
      currentMode: user.currentMode || 'client',
      currentContext: {
        businessId: user.currentBusinessId,
        branchId: user.currentBranchId
      }
    };
  }

  /**
   * Initialize new user with default modes
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createWithDefaultModes(userData) {
    const userWithModes = {
      ...userData,
      modes: {
        client: {
          status: 'active',
          createdAt: new Date()
        }
      },
      currentMode: 'client',
      currentBusinessId: null,
      currentBranchId: null
    };

    return await this.create(userWithModes);
  }
}