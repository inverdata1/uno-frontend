import { BaseApiService } from '../base-api-service';

import { COLLECTION_NAME } from './collection';

/**
 * Addresses resource - handles all address-related operations
 * Extends BaseFirebaseService for common CRUD operations
 */
export class AddressesResource extends BaseApiService {
  constructor(client) {
    super(client, COLLECTION_NAME);
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
      throw new Error(`Handler ${handler} not found in AddressesResource`);
    }

    return await this[handler](data, params);
  }

  // === ADDRESS CRUD ENDPOINTS ===

  /**
   * GET /addresses
   * Get all addresses for current user
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this.findAll({ userId, isActive: true });
  }

  /**
   * POST /addresses
   * Create new address
   */
  async post_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    // If this is set as default, unset other defaults first
    if (data.isDefault) {
      await this.unsetOtherDefaults(userId);
    }

    const addressData = {
      ...data,
      userId,
      isActive: true
    };

    const newAddress = await this.create(addressData);
    console.log('Address added successfully for mode:', data.mode || 'unknown');
    return newAddress;
  }

  /**
   * PUT /addresses/{id}
   * Update existing address
   */
  async put_id(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    // Verify ownership
    const currentAddress = await this.findById(id);
    if (currentAddress.userId !== userId) {
      throw new Error('Address not found or access denied');
    }

    // Handle default address logic
    if (data.isDefault) {
      await this.unsetOtherDefaults(userId);
    }

    return await this.update(id, data);
  }

  /**
   * DELETE /addresses/{id}
   * Soft delete address (mark as inactive)
   */
  async delete_id(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    // Verify ownership
    const currentAddress = await this.findById(id);
    if (currentAddress.userId !== userId) {
      throw new Error('Address not found or access denied');
    }

    return await this.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /addresses/default
   * Get user's default address
   */
  async get_default(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    const defaultAddress = await this.findOne([
      ['userId', '==', userId],
      ['isDefault', '==', true],
      ['isActive', '==', true]
    ]);

    return defaultAddress;
  }

  /**
   * POST /addresses/{id}/set-default
   * Set address as default
   */
  async post_id_set_default(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    // Verify ownership
    const address = await this.findById(id);
    if (address.userId !== userId) {
      throw new Error('Address not found or access denied');
    }

    // Unset other defaults first
    await this.unsetOtherDefaults(userId);

    // Set this one as default
    return await this.update(id, {
      isDefault: true,
      updatedAt: new Date().toISOString()
    });
  }

  // === UTILITY METHODS ===

  /**
   * Unset other default addresses for user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async unsetOtherDefaults(userId) {
    const currentDefaults = await this.findWhere([
      ['userId', '==', userId],
      ['isDefault', '==', true]
    ]);

    const updates = currentDefaults.map(address =>
      this.update(address.id, {
        isDefault: false,
        updatedAt: new Date().toISOString()
      })
    );

    await Promise.all(updates);
  }
}