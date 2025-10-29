import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME } from './collection';

/**
 * Businesses Resource
 * Handles business profile and operations
 */
export class BusinessesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in BusinessesResource`);
    }

    return await this[handler](data, params);
  }

  // === BUSINESS CRUD ENDPOINTS ===

  /**
   * POST /businesses
   * Create a new business profile
   */
  async post_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required to create a business');
    }

    const now = new Date();

    const businessData = {
      ...data,
      ownerId: userId,
      isActive: true,
      isVerified: false,
      followersCount: 0,
      rating: 0,
      reviewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    console.log('📊 Creating business:', businessData);

    const createdBusiness = await this.create(businessData);

    return createdBusiness;
  }

  /**
   * GET /businesses/profile
   * Get business profile by ID or owner ID
   */
  async get_profile(data, params) {
    const { businessId, userId } = params;

    if (businessId) {
      return await this.findById(businessId);
    }

    if (userId) {
      const businesses = await this.findWhere([['ownerId', '==', userId]]);
      return businesses[0] || null;
    }

    throw new Error('businessId or userId is required');
  }

  /**
   * GET /businesses/index
   * Get all businesses (with optional filters)
   */
  async get_index(data, params) {
    const { category, featured, limit = 50 } = params;

    const filters = [['isActive', '==', true]];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (featured === 'true') {
      filters.push(['isFeatured', '==', true]);
    }

    const businesses = await this.findWhere(filters);

    // Limit results
    return businesses.slice(0, parseInt(limit));
  }

  /**
   * PUT /businesses/profile
   * Update business profile
   */
  async put_profile(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId is required to update business');
    }

    // Verify ownership
    const business = await this.findById(businessId);
    if (business.ownerId !== userId) {
      throw new Error('Unauthorized: You do not own this business');
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await this.update(businessId, updateData);
    return await this.findById(businessId);
  }

  /**
   * DELETE /businesses/profile
   * Soft delete a business (set isActive to false)
   */
  async delete_profile(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId is required to delete business');
    }

    // Verify ownership
    const business = await this.findById(businessId);
    if (business.ownerId !== userId) {
      throw new Error('Unauthorized: You do not own this business');
    }

    await this.update(businessId, {
      isActive: false,
      updatedAt: new Date(),
    });

    return { success: true };
  }
}
