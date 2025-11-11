import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME } from './collection';

/**
 * Address Types resource - handles address type catalog operations
 * Extends BaseFirebaseService for common CRUD operations
 */
export class AddressTypesResource extends BaseFirebaseService {
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
      throw new Error(`Handler ${handler} not found in AddressTypesResource`);
    }

    return await this[handler](data, params);
  }

  // === ADDRESS TYPE ENDPOINTS ===

  /**
   * GET /address-types
   * Get all address types (optionally filtered by user type)
   */
  async get_index(data, params) {
    const { userType } = params;

    if (userType) {
      // Filter by user type using array-contains query
      return await this.findWhere([
        ['allowedForUserTypes', 'array-contains', userType]
      ]);
    }

    // Return all types if no filter
    return await this.findAll();
  }

  /**
   * GET /address-types/for-user-type/{userType}
   * Get address types allowed for specific user type
   */
  async get_for_user_type_userType(data, params) {
    const { userType } = params;

    if (!userType) {
      throw new Error('userType parameter is required');
    }

    return await this.findWhere([
      ['allowedForUserTypes', 'array-contains', userType]
    ]);
  }

  /**
   * GET /address-types/{id}
   * Get specific address type by ID
   */
  async get_id(data, params) {
    const { id } = params;

    if (!id) {
      throw new Error('id parameter is required');
    }

    return await this.findById(id);
  }

  /**
   * POST /address-types
   * Create new address type (for seeding)
   */
  async post_index(data, params) {
    const { id } = params;

    if (id) {
      // Create with specific ID
      return await this.create(data, id);
    }

    // Create with auto-generated ID
    return await this.create(data);
  }
}