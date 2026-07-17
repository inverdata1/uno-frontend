import { BaseApiService } from '../base-api-service';
import { COLLECTION_NAME } from './collection';

/**
 * Venezuelan States resource - handles state catalog operations
 * Extends BaseFirebaseService for common CRUD operations
 */
export class VenezuelanStatesResource extends BaseApiService {
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
      throw new Error(`Handler ${handler} not found in VenezuelanStatesResource`);
    }

    return await this[handler](data, params);
  }

  // === VENEZUELAN STATES ENDPOINTS ===

  /**
   * GET /venezuelan-states
   * Get all Venezuelan states
   */
  async get_index(data, params) {
    return await this.findAll({}, { orderBy: 'name', order: 'asc' });
  }

  /**
   * GET /venezuelan-states/{id}
   * Get specific state by ID
   */
  async get_id(data, params) {
    const { id } = params;

    if (!id) {
      throw new Error('id parameter is required');
    }

    return await this.findById(id);
  }

  /**
   * GET /venezuelan-states/by-code/{code}
   * Get state by code (e.g., "ZUL" for Zulia)
   */
  async get_by_code_code(data, params) {
    const { code } = params;

    if (!code) {
      throw new Error('code parameter is required');
    }

    const state = await this.findOne([
      ['code', '==', code.toUpperCase()]
    ]);

    if (!state) {
      throw new Error(`State with code ${code} not found`);
    }

    return state;
  }

  /**
   * POST /venezuelan-states
   * Create new Venezuelan state (for seeding)
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