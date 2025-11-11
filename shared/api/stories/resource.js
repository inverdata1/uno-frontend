import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME, STORY_TYPES, STORY_DURATION, STORY_EXPIRATION_HOURS } from './collection';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { MediaProcessingService } from '../media/service';

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
   * Get active stories grouped by business OR filtered by businessId
   * If businessId param is provided, returns stories for that business only (ungrouped)
   * Otherwise returns all stories grouped by business
   */
  async get_index(data, params) {
    const { userId, businessId } = params;

    const now = Timestamp.now();

    // Build filters
    const filters = [
      ['isActive', '==', true],
      ['isExpired', '==', false]
    ];

    // If businessId provided, filter by business
    if (businessId) {
      filters.push(['businessId', '==', businessId]);
    }

    // Get all active, non-expired stories
    const stories = await this.findWhere(filters);

    // Filter out expired stories (client-side since we can't do > in query with multiple where)
    const activeStories = stories
      .filter(story => story.expiresAt && story.expiresAt.toMillis() > now.toMillis())
      .sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());

    // If businessId is provided, return stories directly (for business stories row)
    if (businessId) {
      return await this.populateBusinessInfo(activeStories);
    }

    // Otherwise, group by business (for feed)
    const groupedStories = await this.groupStoriesByBusiness(activeStories);

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
   * Create new story with media processing
   * Expects: { type, mediaFile, caption, duration }
   */
  async post_index(data, params) {
    const { businessId, userId } = params;

    if (!businessId || !userId) {
      throw new Error('businessId and userId are required');
    }

    console.log('📤 [Stories API] Creating story with media processing');
    console.log('   Type:', data.type);
    console.log('   Caption:', data.caption || '(none)');

    let mediaUrl;
    let thumbnailUrl;

    // Step 1: Process media through Media Service
    if (data.type === STORY_TYPES.VIDEO && data.mediaFile) {
      console.log('🎬 [Stories API] Processing video');
      const { videoUrl, thumbnailUrl: vidThumbnail } = await MediaProcessingService.processVideo(
        data.mediaFile,
        'stories'
      );
      mediaUrl = videoUrl;
      thumbnailUrl = vidThumbnail;

    } else if (data.type === STORY_TYPES.IMAGE && data.mediaFile) {
      console.log('🖼️ [Stories API] Processing image');
      mediaUrl = await MediaProcessingService.processImage(data.mediaFile, 'stories');
      thumbnailUrl = mediaUrl; // For images, thumbnail is the same
    }

    // Calculate expiration (24 hours from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (STORY_EXPIRATION_HOURS * 60 * 60 * 1000));

    // Calculate duration with fallback
    let duration = data.duration;
    if (!duration || duration === undefined) {
      if (data.type === STORY_TYPES.IMAGE) {
        duration = STORY_DURATION.DEFAULT_IMAGE;
      } else if (data.type === STORY_TYPES.VIDEO) {
        duration = 15; // Default to 15 seconds for videos
      } else {
        duration = 5; // Default fallback
      }
    }

    // Step 2: Create story document
    const storyData = {
      type: data.type,
      mediaUrl,
      thumbnailUrl,
      caption: data.caption?.trim() || '',
      duration,
      businessId,
      userId,
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

    console.log('💾 [Stories API] Saving story to database');
    const createdStory = await this.create(storyData);
    console.log('✅ [Stories API] Story created successfully:', createdStory.id);

    return createdStory;
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
    const filteredStories = stories
      .filter(story => story.expiresAt && story.expiresAt.toMillis() > now.toMillis())
      .sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());

    // Populate business info
    return await this.populateBusinessInfo(filteredStories);
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
   * Populate business info for stories
   */
  async populateBusinessInfo(stories) {
    if (!stories || stories.length === 0) return stories;

    // Get all unique business IDs
    const allBusinessIds = [...new Set(
      stories.map(story => story.businessId).filter(Boolean)
    )];

    if (allBusinessIds.length === 0) return stories;

    // Fetch all businesses at once
    const businessesResource = this.client.getResource('businesses');
    const allBusinesses = await businessesResource.findWhere([]);

    // Create a map for quick lookup
    const businessMap = new Map();
    allBusinesses.forEach(business => {
      businessMap.set(business.id, business);
    });

    // Add business info to each story
    return stories.map(story => {
      const business = businessMap.get(story.businessId);
      if (business) {
        return {
          ...story,
          businessName: business.businessName,
          businessType: business.businessType,
          logoUrl: business.logoUrl,
          coverImageUrl: business.coverImageUrl,
        };
      }
      return story;
    });
  }

  /**
   * Group stories by business
   */
  async groupStoriesByBusiness(stories) {
    // First populate business info
    const storiesWithBusinessInfo = await this.populateBusinessInfo(stories);

    const grouped = {};

    storiesWithBusinessInfo.forEach(story => {
      if (!grouped[story.businessId]) {
        grouped[story.businessId] = {
          businessId: story.businessId,
          businessName: story.businessName || 'Business',
          logoUrl: story.logoUrl,
          stories: [],
          hasUnviewed: true, // TODO: Implement viewed tracking per user - set to true for now
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
