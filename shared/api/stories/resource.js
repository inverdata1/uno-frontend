import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME, STORY_TYPES, STORY_DURATION, STORY_EXPIRATION_HOURS } from './collection';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

/**
 * Stories Resource
 * Handles temporary stories (24h expiration)
 */
export class StoriesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in StoriesResource`);
    }

    return await this[handler](data, params);
  }

  // === STORY CRUD ENDPOINTS ===

  /**
   * GET /stories
   * Get active stories grouped by business
   */
  async get_index(data, params) {
    const { userId } = params;

    const now = Timestamp.now();

    // Get all active, non-expired stories
    const stories = await this.findWhere([
      ['isActive', '==', true],
      ['isExpired', '==', false]
    ]);

    // Filter out expired stories (client-side since we can't do > in query with multiple where)
    const activeStories = stories.filter(story =>
      story.expiresAt && story.expiresAt.toMillis() > now.toMillis()
    );

    // Group by business
    const groupedStories = this.groupStoriesByBusiness(activeStories);

    // TODO: Filter based on follows when follows resource is implemented
    // For now, return all active stories

    return groupedStories;
  }

  /**
   * GET /stories/{id}
   * Get specific story and increment view count
   */
  async get_id(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    if (!story || story.isExpired) {
      throw new Error('Story not found or expired');
    }

    // Check if expired
    if (story.expiresAt && story.expiresAt.toMillis() < Date.now()) {
      await this.update(id, { isExpired: true });
      throw new Error('Story has expired');
    }

    // Increment view count
    this.update(id, {
      viewCount: (story.viewCount || 0) + 1,
      updatedAt: serverTimestamp()
    }).catch(err => console.error('Failed to increment view count:', err));

    return story;
  }

  /**
   * POST /stories
   * Create new story
   */
  async post_index(data, params) {
    const { businessId, userId } = params;

    if (!businessId || !userId) {
      throw new Error('businessId and userId are required');
    }

    // Calculate expiration (24 hours from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (STORY_EXPIRATION_HOURS * 60 * 60 * 1000));

    const storyData = {
      ...data,
      businessId,
      userId,
      duration: data.duration || (data.type === STORY_TYPES.IMAGE ? STORY_DURATION.DEFAULT_IMAGE : data.videoDuration),
      taggedProducts: data.taggedProducts || [],
      stickers: data.stickers || [],
      isActive: true,
      isExpired: false,
      viewCount: 0,
      replyCount: 0,
      shareCount: 0,
      tapForwardCount: 0,
      tapBackCount: 0,
      exitCount: 0,
      expiresAt: Timestamp.fromDate(expiresAt)
    };

    return await this.create(storyData);
  }

  /**
   * DELETE /stories/{id}
   * Delete story
   */
  async delete_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const story = await this.findById(id);
    if (story.businessId !== businessId) {
      throw new Error('Story not found or access denied');
    }

    // Hard delete stories (they're temporary anyway)
    return await this.delete(id);
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /stories/business/{businessId}
   * Get all active stories from a specific business
   */
  async get_business_id(data, params) {
    const { id: businessId } = params;

    const now = Timestamp.now();

    const stories = await this.findWhere([
      ['businessId', '==', businessId],
      ['isActive', '==', true],
      ['isExpired', '==', false]
    ]);

    // Filter expired and sort by creation time
    return stories
      .filter(story => story.expiresAt && story.expiresAt.toMillis() > now.toMillis())
      .sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());
  }

  /**
   * PATCH /stories/{id}/view
   * Record a story view
   */
  async patch_id_view(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      viewCount: (story.viewCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /stories/{id}/tap-forward
   * Record forward tap
   */
  async patch_id_tap_forward(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      tapForwardCount: (story.tapForwardCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /stories/{id}/tap-back
   * Record back tap
   */
  async patch_id_tap_back(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      tapBackCount: (story.tapBackCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /stories/{id}/exit
   * Record exit
   */
  async patch_id_exit(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      exitCount: (story.exitCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /stories/{id}/reply
   * Increment reply count
   */
  async patch_id_reply(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      replyCount: (story.replyCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /stories/{id}/share
   * Increment share count
   */
  async patch_id_share(data, params) {
    const { id } = params;
    const story = await this.findById(id);

    return await this.update(id, {
      shareCount: (story.shareCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * POST /stories/cleanup-expired
   * Mark expired stories as expired (run via cron/scheduled function)
   */
  async post_cleanup_expired() {
    const now = Timestamp.now();

    const expiredStories = await this.findWhere([
      ['isActive', '==', true],
      ['isExpired', '==', false]
    ]);

    const updates = expiredStories
      .filter(story => story.expiresAt && story.expiresAt.toMillis() < now.toMillis())
      .map(story => this.update(story.id, {
        isExpired: true,
        isActive: false,
        updatedAt: serverTimestamp()
      }));

    await Promise.all(updates);

    return { expired: updates.length };
  }

  // === UTILITY METHODS ===

  /**
   * Group stories by business
   */
  groupStoriesByBusiness(stories) {
    const grouped = {};

    stories.forEach(story => {
      if (!grouped[story.businessId]) {
        grouped[story.businessId] = {
          businessId: story.businessId,
          stories: [],
          hasUnviewed: false, // TODO: Implement viewed tracking per user
          latestStoryTime: story.createdAt
        };
      }

      grouped[story.businessId].stories.push(story);

      // Update latest story time
      if (story.createdAt?.toMillis() > grouped[story.businessId].latestStoryTime?.toMillis()) {
        grouped[story.businessId].latestStoryTime = story.createdAt;
      }
    });

    // Convert to array and sort by latest story
    return Object.values(grouped).sort((a, b) =>
      b.latestStoryTime?.toMillis() - a.latestStoryTime?.toMillis()
    );
  }
}
