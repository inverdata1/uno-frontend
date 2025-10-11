import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME, POST_TYPES } from './collection';
import { serverTimestamp } from 'firebase/firestore';

/**
 * Posts Resource
 * Handles social feed posts with product tagging
 */
export class PostsResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in PostsResource`);
    }

    return await this[handler](data, params);
  }

  // === POST CRUD ENDPOINTS ===

  /**
   * GET /posts
   * Get feed posts (paginated, sorted by recent)
   */
  async get_index(data, params) {
    const {
      businessId,
      userId,
      type,
      limit = 20,
      offset = 0
    } = params;

    const filters = [
      ['isPublished', '==', true],
      ['isActive', '==', true]
    ];

    if (businessId) {
      filters.push(['businessId', '==', businessId]);
    }

    if (userId) {
      filters.push(['userId', '==', userId]);
    }

    if (type) {
      filters.push(['type', '==', type]);
    }

    const posts = await this.findWhere(filters);

    // Sort by published date (newest first) and paginate
    return posts
      .sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  }

  /**
   * GET /posts/{id}
   * Get specific post and increment view count
   */
  async get_id(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    if (!post || !post.isPublished) {
      throw new Error('Post not found');
    }

    // Increment view count for videos
    if (post.type === POST_TYPES.VIDEO) {
      this.update(id, {
        viewCount: (post.viewCount || 0) + 1,
        updatedAt: serverTimestamp()
      }).catch(err => console.error('Failed to increment view count:', err));
    }

    return post;
  }

  /**
   * POST /posts
   * Create new post
   */
  async post_index(data, params) {
    const { businessId, userId } = params;

    if (!businessId || !userId) {
      throw new Error('businessId and userId are required');
    }

    const postData = {
      ...data,
      businessId,
      userId,
      isActive: true,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      isPinned: false,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      viewCount: 0,
      saveCount: 0,
      publishedAt: data.isPublished !== false ? serverTimestamp() : null,
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
      taggedProducts: data.taggedProducts || []
    };

    return await this.create(postData);
  }

  /**
   * PUT /posts/{id}
   * Update post
   */
  async put_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const post = await this.findById(id);
    if (post.businessId !== businessId) {
      throw new Error('Post not found or access denied');
    }

    // If publishing a draft, set publishedAt
    if (!post.isPublished && data.isPublished === true) {
      data.publishedAt = serverTimestamp();
    }

    return await this.update(id, data);
  }

  /**
   * DELETE /posts/{id}
   * Soft delete post
   */
  async delete_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const post = await this.findById(id);
    if (post.businessId !== businessId) {
      throw new Error('Post not found or access denied');
    }

    return await this.update(id, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /posts/business/{businessId}
   * Get all posts from a business
   */
  async get_business_id(data, params) {
    const { id: businessId } = params;

    const posts = await this.findWhere([
      ['businessId', '==', businessId],
      ['isPublished', '==', true],
      ['isActive', '==', true]
    ]);

    return posts.sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis());
  }

  /**
   * GET /posts/feed
   * Get personalized feed (for now, just recent posts)
   * TODO: Add personalization based on follows, likes, etc.
   */
  async get_feed(data, params) {
    const { limit = 20, offset = 0 } = params;

    const posts = await this.findWhere([
      ['isPublished', '==', true],
      ['isActive', '==', true]
    ]);

    return posts
      .sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  }

  /**
   * GET /posts/videos
   * Get video posts only (TikTok-style feed)
   */
  async get_videos(data, params) {
    const { limit = 20, offset = 0 } = params;

    const posts = await this.findWhere([
      ['type', '==', POST_TYPES.VIDEO],
      ['isPublished', '==', true],
      ['isActive', '==', true]
    ]);

    return posts
      .sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  }

  /**
   * GET /posts/product/{productId}
   * Get posts featuring a specific product
   */
  async get_product_id(data, params) {
    const { id: productId } = params;

    const allPosts = await this.findWhere([
      ['isPublished', '==', true],
      ['isActive', '==', true]
    ]);

    // Filter posts that have this product tagged
    const postsWithProduct = allPosts.filter(post =>
      post.taggedProducts && post.taggedProducts.includes(productId)
    );

    return postsWithProduct.sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis());
  }

  /**
   * PATCH /posts/{id}/like
   * Increment like count
   */
  async patch_id_like(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    return await this.update(id, {
      likeCount: (post.likeCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /posts/{id}/unlike
   * Decrement like count
   */
  async patch_id_unlike(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    return await this.update(id, {
      likeCount: Math.max((post.likeCount || 0) - 1, 0),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /posts/{id}/save
   * Increment save count
   */
  async patch_id_save(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    return await this.update(id, {
      saveCount: (post.saveCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /posts/{id}/unsave
   * Decrement save count
   */
  async patch_id_unsave(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    return await this.update(id, {
      saveCount: Math.max((post.saveCount || 0) - 1, 0),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /posts/{id}/share
   * Increment share count
   */
  async patch_id_share(data, params) {
    const { id } = params;
    const post = await this.findById(id);

    return await this.update(id, {
      shareCount: (post.shareCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /posts/{id}/toggle-pin
   * Toggle pinned status
   */
  async patch_id_toggle_pin(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const post = await this.findById(id);
    if (post.businessId !== businessId) {
      throw new Error('Post not found or access denied');
    }

    return await this.update(id, {
      isPinned: !post.isPinned,
      updatedAt: serverTimestamp()
    });
  }
}
