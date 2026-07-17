import { BaseApiService } from '../base-api-service';
import { COLLECTION_NAME, FOLLOWING_TYPES } from './collection';

/**
 * Follows Resource
 * Handles user following relationships
 */
export class FollowsResource extends BaseApiService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in FollowsResource`);
    }

    return await this[handler](data, params);
  }

  // === FOLLOWS CRUD ENDPOINTS ===

  /**
   * GET /follows
   * Get all follows for a user (who they're following)
   */
  async get_index(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    const follows = await this.findWhere([
      ['followerId', '==', userId]
    ]);

    return follows.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * POST /follows
   * Follow a business
   */
  async post_index(data, params) {
    const { userId } = params;
    const { followingId, followingType = FOLLOWING_TYPES.BUSINESS } = data;

    if (!userId || !followingId) {
      throw new Error('userId and followingId are required');
    }

    // Check if already following
    const existing = await this.findOne([
      ['followerId', '==', userId],
      ['followingId', '==', followingId]
    ]);

    if (existing) {
      return existing; // Already following
    }

    const followData = {
      followerId: userId,
      followingId,
      followingType,
      notifyOnNewPost: data.notifyOnNewPost !== undefined ? data.notifyOnNewPost : true,
      notifyOnNewProduct: data.notifyOnNewProduct !== undefined ? data.notifyOnNewProduct : false,
      notifyOnStory: data.notifyOnStory !== undefined ? data.notifyOnStory : true
    };

    return await this.create(followData);
  }

  /**
   * DELETE /follows/{id}
   * Unfollow
   */
  async delete_id(data, params) {
    const { userId, id } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Verify ownership
    const follow = await this.findById(id);
    if (follow.followerId !== userId) {
      throw new Error('Follow relationship not found or access denied');
    }

    return await this.delete(id);
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /follows/following
   * Get list of businesses user is following
   */
  async get_following(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    return await this.findWhere([
      ['followerId', '==', userId]
    ]);
  }

  /**
   * GET /follows/followers/{businessId}
   * Get followers of a business
   */
  async get_followers_id(data, params) {
    const { id: businessId } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    const followers = await this.findWhere([
      ['followingId', '==', businessId]
    ]);

    return followers.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * GET /follows/check/{businessId}
   * Check if user is following a business
   */
  async get_check_id(data, params) {
    const { userId, id: businessId } = params;

    if (!userId || !businessId) {
      throw new Error('userId and businessId are required');
    }

    const follow = await this.findOne([
      ['followerId', '==', userId],
      ['followingId', '==', businessId]
    ]);

    return {
      isFollowing: !!follow,
      followId: follow?.id || null,
      notificationPreferences: follow ? {
        notifyOnNewPost: follow.notifyOnNewPost,
        notifyOnNewProduct: follow.notifyOnNewProduct,
        notifyOnStory: follow.notifyOnStory
      } : null
    };
  }

  /**
   * POST /follows/toggle
   * Toggle follow status (follow if not following, unfollow if following)
   */
  async post_toggle(data, params) {
    const { userId } = params;
    const { followingId, followingType = FOLLOWING_TYPES.BUSINESS } = data;

    if (!userId || !followingId) {
      throw new Error('userId and followingId are required');
    }

    // Check if already following
    const existing = await this.findOne([
      ['followerId', '==', userId],
      ['followingId', '==', followingId]
    ]);

    if (existing) {
      // Unfollow
      await this.delete(existing.id);

      return {
        action: 'unfollowed',
        isFollowing: false
      };
    } else {
      // Follow
      const follow = await this.create({
        followerId: userId,
        followingId,
        followingType,
        notifyOnNewPost: data.notifyOnNewPost !== undefined ? data.notifyOnNewPost : true,
        notifyOnNewProduct: data.notifyOnNewProduct !== undefined ? data.notifyOnNewProduct : false,
        notifyOnStory: data.notifyOnStory !== undefined ? data.notifyOnStory : true
      });

      return {
        action: 'followed',
        isFollowing: true,
        follow
      };
    }
  }

  /**
   * PATCH /follows/{id}/notifications
   * Update notification preferences
   */
  async patch_id_notifications(data, params) {
    const { userId, id } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Verify ownership
    const follow = await this.findById(id);
    if (follow.followerId !== userId) {
      throw new Error('Follow relationship not found or access denied');
    }

    const updates = {};
    if (data.notifyOnNewPost !== undefined) updates.notifyOnNewPost = data.notifyOnNewPost;
    if (data.notifyOnNewProduct !== undefined) updates.notifyOnNewProduct = data.notifyOnNewProduct;
    if (data.notifyOnStory !== undefined) updates.notifyOnStory = data.notifyOnStory;

    return await this.update(id, updates);
  }

  /**
   * DELETE /follows/business/{businessId}
   * Unfollow by business ID (instead of follow ID)
   */
  async delete_business_id(data, params) {
    const { userId, id: businessId } = params;

    if (!userId || !businessId) {
      throw new Error('userId and businessId are required');
    }

    const follow = await this.findOne([
      ['followerId', '==', userId],
      ['followingId', '==', businessId]
    ]);

    if (!follow) {
      throw new Error('Not following this business');
    }

    return await this.delete(follow.id);
  }

  /**
   * GET /follows/count/following
   * Get count of businesses user is following
   */
  async get_count_following(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    const follows = await this.findWhere([
      ['followerId', '==', userId]
    ]);

    return { count: follows.length };
  }

  /**
   * GET /follows/count/followers/{businessId}
   * Get follower count for a business
   */
  async get_count_followers_id(data, params) {
    const { id: businessId } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    const followers = await this.findWhere([
      ['followingId', '==', businessId]
    ]);

    return { count: followers.length };
  }
}
