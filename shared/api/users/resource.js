import { BaseFirebaseService } from '../base-firebase-service';
import { BranchesResource } from '../branches/resource';
import { serverTimestamp } from 'firebase/firestore';
import { COLLECTION_NAME } from './collection';

/**
 * Users resource - handles all user-related operations
 * Extends BaseFirebaseService for common CRUD operations
 */
export class UsersResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
    this.businessesService = new BaseFirebaseService(client, 'businesses');
    this.branchesService = new BranchesResource(client);
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
    // Replace hyphens with underscores for method names
    const normalizedAction = (action || 'index').replace(/-/g, '_');
    const handler = `${method.toLowerCase()}_${normalizedAction}`;

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
    const userWithUserTypes = {
      ...data,
      id: userId,
      userTypes: data.userTypes || {
        client: {
          status: 'active',
          createdAt: new Date()
        }
      },
      currentUserType: data.currentUserType || 'client',
      currentBusinessId: data.currentBusinessId || null,
      currentBranchId: data.currentBranchId || null
    };

    return await this.create(userWithUserTypes, userId);
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

    try {
      return await this.findById(userId);
    } catch (error) {
      // If user document doesn't exist, return null for now
      // This allows the app to function with safe defaults
      console.warn(`User document not found for ${userId}, this user needs to be properly registered`);
      return null;
    }
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

  // === USER TYPE MANAGEMENT ENDPOINTS ===

  /**
   * POST /users/switch-user-type
   * Switch user's active userType
   */
  async post_switch_user_type(data, params) {
    const { userId } = params;
    const { userType, businessId, branchId } = data;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    if (!userType) {
      throw new Error('userType is required');
    }

    // Validate userType
    const validUserTypes = ['client', 'business', 'delivery'];
    if (!validUserTypes.includes(userType)) {
      throw new Error(`Invalid userType: ${userType}. Valid userTypes: ${validUserTypes.join(', ')}`);
    }

    // Update user's current context
    const updateData = {
      currentUserType: userType,
      currentBusinessId: businessId || null,
      currentBranchId: branchId || null,
      lastUserTypeSwitch: serverTimestamp()
    };

    const updatedUser = await this.update(userId, updateData);

    return {
      success: true,
      currentUserType: userType,
      currentBusinessId: businessId || null,
      currentBranchId: branchId || null,
      user: updatedUser
    };
  }

  /**
   * POST /users/enable-user-type
   * Enable a new userType for user (e.g., upgrade to business)
   */
  async post_enable_user_type(data, params) {
    const { userId } = params;
    const { userType, status = 'pending', userTypeData = {} } = data;

    if (!userId || !userType) {
      throw new Error('userId and userType are required');
    }

    const user = await this.findById(userId);

    // Update user types
    const updatedUserTypes = {
      ...user.userTypes,
      [userType]: {
        status,
        createdAt: new Date(),
        ...userTypeData
      }
    };

    return await this.update(userId, { userTypes: updatedUserTypes });
  }

  /**
   * PATCH /users/user-type-status
   * Update userType status (e.g., pending -> active)
   */
  async patch_user_type_status(data, params) {
    const { userId } = params;
    const { userType, status } = data;

    if (!userId || !userType || !status) {
      throw new Error('userId, userType, and status are required');
    }

    const user = await this.findById(userId);

    if (!user.userTypes || !user.userTypes[userType]) {
      throw new Error(`User does not have ${userType} userType`);
    }

    const updatedUserTypes = {
      ...user.userTypes,
      [userType]: {
        ...user.userTypes[userType],
        status,
        updatedAt: new Date()
      }
    };

    return await this.update(userId, { userTypes: updatedUserTypes });
  }

  /**
   * GET /users/user-types
   * Get user's available userTypes and current context
   */
  async get_user_types(_data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    try {
      console.log(`🔍 Attempting to find user document: ${userId}`);
      console.log(`📁 Collection: ${this.collectionName}`);

      const user = await this.findById(userId);

      console.log(`✅ User document found:`, {
        id: user.id,
        hasUserTypes: !!user.userTypes,
        currentUserType: user.currentUserType,
        fields: Object.keys(user)
      });

      const userTypesData = this.extractUserTypesFromUser(user);

      // If user has business userType, load business contexts
      if (userTypesData.availableUserTypes.includes('business')) {
        userTypesData.businessContexts = await this.getBusinessContexts(userId);
      }

      return userTypesData;
    } catch (error) {
      console.error(`❌ ERROR in get_user_types for ${userId}:`, error.message);
      console.error('Full error:', error);
      return null;
    }
  }

  // === UTILITY METHODS ===

  /**
   * Extract userTypes information from user document
   */
  extractUserTypesFromUser(user) {
    const userTypesList = [];

    // Process each userType
    Object.entries(user.userTypes || {}).forEach(([userType, config]) => {
      userTypesList.push({ userType, ...config });
    });

    // If no userTypes exist, default to client
    if (userTypesList.length === 0) {
      userTypesList.push({
        userType: 'client',
        status: 'active',
        createdAt: user.createdAt || new Date()
      });
    }

    return {
      availableUserTypes: userTypesList.filter(ut => ut.status === 'active').map(ut => ut.userType),
      allUserTypes: userTypesList,
      currentUserType: user.currentUserType || 'client',
      currentContext: {
        businessId: user.currentBusinessId,
        branchId: user.currentBranchId
      },
      lastUserTypeSwitch: user.lastUserTypeSwitch
    };
  }

  /**
   * Get business contexts for userType switcher
   */
  async getBusinessContexts(userId) {
    try {
      const businesses = await this.businessesService.findAll({ ownerId: userId });
      const contexts = [];

      for (const business of businesses) {
        try {
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
        } catch (branchError) {
          // If branch query fails (e.g., missing index), still include business without branches
          console.warn(`⚠️ Could not load branches for business ${business.id}:`, branchError.message);
          contexts.push({
            businessId: business.id,
            businessName: business.name,
            businessType: business.businessType,
            status: business.status,
            branches: []
          });
        }
      }

      return contexts;
    } catch (error) {
      console.error('❌ Error loading business contexts:', error.message);
      return [];
    }
  }
}
