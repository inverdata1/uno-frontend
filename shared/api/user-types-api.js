import { BaseFirebaseService } from './base-firebase-service';

/**
 * UserTypes resource - handles user type management
 * Specializes in userType switching and userType status management
 */
export class UserTypesApiResource extends BaseFirebaseService {
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
      throw new Error(`Handler ${handler} not found in UserTypesApiResource`);
    }

    return await this[handler](data, params);
  }

  // === USER TYPE ENDPOINTS ===

  /**
   * GET /user-types
   * Get user's available userTypes and current context
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId parameter is required');
    }

    try {
      const user = await this.findById(userId);
      const userTypesData = this.extractUserTypesFromUser(user);

      // If user has business userType, load business contexts
      if (userTypesData.availableUserTypes.includes('business')) {
        userTypesData.businessContexts = await this.getBusinessContexts(userId);
      }

      return userTypesData;
    } catch (error) {
      // If user document doesn't exist, return null for now
      // The useUserType hook will provide safe defaults
      console.warn(`User document not found for ${userId}, this user needs to be properly registered`);
      return null;
    }
  }

  /**
   * POST /user-types
   * Add a new userType to user
   */
  async post_index(data, params) {
    const { userId } = params;
    const { userType, status = 'pending', userTypeData = {} } = data;

    if (!userId || !userType) {
      throw new Error('userId and userType are required');
    }

    const validUserTypes = ['client', 'business', 'delivery'];
    if (!validUserTypes.includes(userType)) {
      throw new Error(`Invalid userType: ${userType}. Valid userTypes: ${validUserTypes.join(', ')}`);
    }

    const user = await this.findById(userId);

    // Check if userType already exists
    if (user.userTypes && user.userTypes[userType]) {
      throw new Error(`User already has ${userType} userType with status: ${user.userTypes[userType].status}`);
    }

    const updatedUserTypes = {
      ...user.userTypes,
      [userType]: {
        status,
        createdAt: new Date(),
        ...userTypeData
      }
    };

    await this.update(userId, { userTypes: updatedUserTypes });

    return this.get_index(null, { userId });
  }

  /**
   * PATCH /user-types/status
   * Update userType status
   */
  async patch_status(data, params) {
    const { userId } = params;
    const { userType, status } = data;

    if (!userId || !userType || !status) {
      throw new Error('userId, userType, and status are required');
    }

    const validStatuses = ['pending', 'active', 'suspended', 'disabled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
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

    await this.update(userId, { userTypes: updatedUserTypes });

    return this.get_index(null, { userId });
  }

  /**
   * POST /user-types/switch
   * Switch user's current userType
   */
  async post_switch(data, params) {
    const { userId } = params;
    const { userType, businessId, branchId } = data;

    if (!userId || !userType) {
      throw new Error('userId and userType are required');
    }

    // Verify user has this userType and it's active
    const user = await this.findById(userId);
    const userTypesData = this.extractUserTypesFromUser(user);

    if (!userTypesData.availableUserTypes.includes(userType)) {
      throw new Error(`User does not have access to ${userType} userType`);
    }

    // If switching to business userType, validate businessId
    if (userType === 'business') {
      if (!businessId) {
        throw new Error('businessId is required when switching to business userType');
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
      currentUserType: userType,
      currentBusinessId: userType === 'business' ? businessId : null,
      currentBranchId: userType === 'business' ? branchId : null,
      lastUserTypeSwitch: new Date()
    };

    await this.update(userId, updateData);

    return {
      success: true,
      currentUserType: userType,
      currentContext: {
        businessId: userType === 'business' ? businessId : null,
        branchId: userType === 'business' ? branchId : null
      }
    };
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
   * Initialize default userTypes for new user
   */
  async initializeUserTypes(userId) {
    const user = await this.findById(userId);

    // If user already has userTypes, don't override
    if (user.userTypes && Object.keys(user.userTypes).length > 0) {
      return this.extractUserTypesFromUser(user);
    }

    // Set up default client userType
    const defaultUserTypes = {
      client: {
        status: 'active',
        createdAt: new Date()
      }
    };

    const updateData = {
      userTypes: defaultUserTypes,
      currentUserType: 'client',
      currentBusinessId: null,
      currentBranchId: null
    };

    await this.update(userId, updateData);

    const updatedUser = await this.findById(userId);
    return this.extractUserTypesFromUser(updatedUser);
  }
}