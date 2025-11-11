import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME } from './collection';

/**
 * Branches Resource
 * Handles business branch/location operations
 *
 * Every business has at least one branch (default "Principal" branch).
 * Multi-location businesses can have multiple branches.
 */
export class BranchesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action || 'index'}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in BranchesResource`);
    }

    return await this[handler](data, params);
  }

  // === BRANCH CRUD ENDPOINTS ===

  /**
   * POST /branches
   * Create a new branch for a business
   */
  async post_index(data, params) {
    const { businessId, userId } = params;

    if (!businessId) {
      throw new Error('businessId is required to create a branch');
    }

    const now = new Date();

    const branchData = {
      ...data,
      businessId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isMain: data.isMain !== undefined ? data.isMain : false,
      createdAt: now,
      updatedAt: now,
    };

    console.log('🏢 Creating branch:', branchData);

    return await this.create(branchData);
  }

  /**
   * GET /branches
   * Get all branches for a business
   */
  async get_index(data, params) {
    const { businessId } = params;

    if (!businessId) {
      throw new Error('businessId is required to get branches');
    }

    const branches = await this.findAll(
      { businessId },
      { orderBy: 'createdAt', order: 'asc' }
    );

    return branches;
  }

  /**
   * GET /branches/:id
   * Get a specific branch by ID
   */
  async get_branch(data, params) {
    const { branchId } = params;

    if (!branchId) {
      throw new Error('branchId is required');
    }

    return await this.findById(branchId);
  }

  /**
   * PUT /branches/:id
   * Update a branch
   */
  async put_branch(data, params) {
    const { branchId } = params;

    if (!branchId) {
      throw new Error('branchId is required to update branch');
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await this.update(branchId, updateData);
    return await this.findById(branchId);
  }

  /**
   * DELETE /branches/:id
   * Soft delete a branch (set isActive to false)
   */
  async delete_branch(data, params) {
    const { branchId } = params;

    if (!branchId) {
      throw new Error('branchId is required to delete branch');
    }

    await this.update(branchId, {
      isActive: false,
      updatedAt: new Date(),
    });

    return { success: true };
  }
}
