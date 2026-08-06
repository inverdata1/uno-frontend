import { BaseApiService } from '../base-api-service';

import { COLLECTION_NAME } from './collection';

/**
 * Addresses resource - handles all address-related operations
 *
 * The NestJS backend takes `userId` (and `id`, where relevant) as query string
 * parameters rather than in the body or the path, so these handlers build the
 * request URLs explicitly instead of relying on the generic CRUD helpers.
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
   * GET /addresses?userId=
   * Get all addresses for current user
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this._request(`?userId=${encodeURIComponent(userId)}`);
  }

  /**
   * POST /addresses?userId=
   * Create new address
   */
  async post_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this._request(`?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT /addresses/id?id=&userId=
   * Update existing address
   */
  async put_id(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    return await this._request(
      `/id?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`,
      { method: 'PUT', body: JSON.stringify(data) },
    );
  }

  /**
   * DELETE /addresses/id?id=&userId=
   * Delete address
   */
  async delete_id(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    return await this._request(
      `/id?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' },
    );
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /addresses/default?userId=
   * Get user's default address
   */
  async get_default(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    return await this._request(`/default?userId=${encodeURIComponent(userId)}`);
  }

  /**
   * POST /addresses/id/set_default?id=&userId=
   * Set address as default
   */
  async post_id_set_default(data, params) {
    const { userId, id } = params;

    if (!userId || !id) {
      throw new Error('userId and id parameters are required');
    }

    return await this._request(
      `/id/set_default?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`,
      { method: 'POST' },
    );
  }
}
