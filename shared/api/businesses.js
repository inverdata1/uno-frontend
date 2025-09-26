import { BaseFirebaseService } from './base-firebase-service';
import { serverTimestamp } from 'firebase/firestore';

/**
 * Businesses resource - handles all business-related operations
 * Supports multi-business ownership and branch management
 */
export class BusinessesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, 'businesses');
    // Create service for branches
    this.branchesService = new BaseFirebaseService(client, 'branches');
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    // Handle parameterized routes like businesses/{id}
    if (action.match(/^[a-zA-Z0-9-_]+$/)) {
      // Single ID - treat as businesses/{id}
      const handler = `${method.toLowerCase()}_by_id`;
      return await this[handler](data, { ...params, businessId: action });
    }

    const handler = `${method.toLowerCase()}_${action.replace('/', '_') || 'index'}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in BusinessesResource`);
    }

    return await this[handler](data, params);
  }

  // === BUSINESS CRUD ENDPOINTS ===

  /**
   * GET /businesses
   * Get all businesses for a user
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    // Get businesses owned by user
    const businesses = await this.findAll({ ownerId: userId });

    // Enrich with branches for each business
    for (const business of businesses) {
      business.branches = await this.branchesService.findAll({
        businessId: business.id
      }, { orderBy: 'createdAt', order: 'asc' });
    }

    return businesses;
  }

  /**
   * POST /businesses
   * Create a new business
   */
  async post_index(data, params) {
    const { userId } = params;
    const { name, businessType, description, address, phone, email } = data;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    if (!name || !businessType) {
      throw new Error('name and businessType are required');
    }

    const businessData = {
      ownerId: userId,
      name,
      businessType,
      description: description || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      status: 'active'
    };

    const business = await this.create(businessData);

    return {
      ...business,
      branches: []
    };
  }

  /**
   * GET /businesses/{id}
   * Get specific business by ID
   */
  async get_by_id(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId parameter is required');
    }

    const business = await this.findById(businessId);

    // Security check - ensure user owns this business
    if (userId && business.ownerId !== userId) {
      throw new Error('Access denied: You do not own this business');
    }

    // Load branches
    business.branches = await this.branchesService.findAll({
      businessId: business.id
    }, { orderBy: 'createdAt', order: 'asc' });

    return business;
  }

  /**
   * PUT /businesses/{id}
   * Update business
   */
  async put_by_id(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId parameter is required');
    }

    // Security check
    const existing = await this.findById(businessId);
    if (userId && existing.ownerId !== userId) {
      throw new Error('Access denied: You do not own this business');
    }

    // Filter out fields that shouldn't be updated
    const { id, ownerId, createdAt, ...updateData } = data;

    return await this.update(businessId, updateData);
  }

  /**
   * DELETE /businesses/{id}
   * Delete business (soft delete by setting status to 'closed')
   */
  async delete_by_id(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId parameter is required');
    }

    // Security check
    const existing = await this.findById(businessId);
    if (userId && existing.ownerId !== userId) {
      throw new Error('Access denied: You do not own this business');
    }

    // Soft delete
    await this.update(businessId, { status: 'closed' });

    return { id: businessId, deleted: true };
  }

  // === BRANCH ENDPOINTS ===

  /**
   * GET /businesses/{id}/branches
   * Get branches for a business
   */
  async get_branches(data, params) {
    const { businessId, userId } = params;

    // Extract businessId from action if needed
    const actualBusinessId = businessId || params.action;

    if (!actualBusinessId) {
      throw new Error('businessId parameter is required');
    }

    // Security check
    const business = await this.findById(actualBusinessId);
    if (userId && business.ownerId !== userId) {
      throw new Error('Access denied: You do not own this business');
    }

    return await this.branchesService.findAll({
      businessId: actualBusinessId
    }, { orderBy: 'createdAt', order: 'asc' });
  }

  /**
   * POST /businesses/{id}/branches
   * Create a branch for a business
   */
  async post_branches(data, params) {
    const { businessId, userId } = params;
    const { name, address, phone, isMain = false } = data;

    const actualBusinessId = businessId || params.action;

    if (!actualBusinessId || !name || !address) {
      throw new Error('businessId, name, and address are required');
    }

    // Security check
    const business = await this.findById(actualBusinessId);
    if (userId && business.ownerId !== userId) {
      throw new Error('Access denied: You do not own this business');
    }

    const branchData = {
      businessId: actualBusinessId,
      name,
      address,
      phone: phone || '',
      isMain,
      status: 'active'
    };

    return await this.branchesService.create(branchData);
  }

  // === UTILITY METHODS ===

  /**
   * Create business with default main branch
   */
  async createWithMainBranch(businessData, branchData, userId) {
    // Create business
    const business = await this.post_index(businessData, { userId });

    // Create main branch
    const mainBranchData = {
      ...branchData,
      isMain: true
    };

    const branch = await this.post_branches(mainBranchData, {
      businessId: business.id,
      userId
    });

    return {
      ...business,
      branches: [branch]
    };
  }

  /**
   * Get business context for user mode switching
   */
  async getBusinessContexts(userId) {
    const businesses = await this.get_index(null, { userId });

    return businesses.map(business => ({
      businessId: business.id,
      businessName: business.name,
      businessType: business.businessType,
      branchCount: business.branches.length,
      branches: business.branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        isMain: branch.isMain,
        address: branch.address
      }))
    }));
  }
}