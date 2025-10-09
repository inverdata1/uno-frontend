import { BaseFirebaseService } from '../base/firebase-service';

/**
 * User Types Resource
 * Handles user types CRUD operations
 */
export class UserTypesResource extends BaseFirebaseService {
  constructor() {
    super('user_types');
  }

  /**
   * GET /user-types
   * Get all active user types
   */
  async get_index() {
    return await this.findWhere([
      ['isActive', '==', true]
    ]);
  }

  /**
   * GET /user-types/{id}
   * Get specific user type by ID
   */
  async get_id(data, params) {
    const { id } = params;
    return await this.findById(id);
  }

  /**
   * GET /user-types/{userType}/permissions
   * Get permissions for specific user type
   */
  async get_id_permissions(data, params) {
    const { id: userType } = params;
    const userTypeDoc = await this.findById(userType);

    if (!userTypeDoc) {
      throw new Error(`User type ${userType} not found`);
    }

    return userTypeDoc.permissions || [];
  }
}