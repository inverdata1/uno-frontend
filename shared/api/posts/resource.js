import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME, POST_TYPES } from './collection';
import { serverTimestamp } from 'firebase/firestore';
import { MediaProcessingService } from '../media/service';

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

  // === HELPER METHODS ===

  /**
   * Populate business information for posts
   * Adds businessName, logoUrl, etc. to each post
   */
  async populateBusinessInfo(posts) {
    if (!posts || posts.length === 0) return posts;

    // Get all unique business IDs
    const allBusinessIds = [...new Set(
      posts.map(post => post.businessId).filter(Boolean)
    )];

    if (allBusinessIds.length === 0) return posts;

    // Fetch all businesses at once
    const businessesResource = this.client.getResource('businesses');
    const allBusinesses = await businessesResource.findWhere([]);

    // Create a map for quick lookup
    const businessMap = new Map();
    allBusinesses.forEach(business => {
      businessMap.set(business.id, business);
    });

    // Add business info to each post
    return posts.map(post => {
      const business = businessMap.get(post.businessId);
      if (business) {
        return {
          ...post,
          businessName: business.businessName,
          businessType: business.businessType,
          logoUrl: business.logoUrl,
          coverImageUrl: business.coverImageUrl,
        };
      }
      return post;
    });
  }

  /**
   * Populate tagged products with full product data
   * Converts array of product IDs to array of product objects
   */
  async populateTaggedProducts(posts) {
    if (!posts || posts.length === 0) return posts;

    // Get all unique product IDs from all posts
    const allProductIds = [...new Set(
      posts.flatMap(post => post.taggedProducts || [])
    )];

    if (allProductIds.length === 0) return posts;

    // Fetch all products at once using the client's registered resource
    const productsResource = this.client.getResource('products');
    const allProducts = await productsResource.findWhere([]);

    // Create a map for quick lookup with FULL product data
    const productMap = new Map();
    allProducts.forEach(product => {
      productMap.set(product.id, product); // Store complete product object
    });

    // Replace product IDs with full product objects
    return posts.map(post => {
      if (post.taggedProducts && post.taggedProducts.length > 0) {
        const populatedProducts = post.taggedProducts
          .map(productId => productMap.get(productId))
          .filter(product => product !== undefined); // Remove products that don't exist

        return {
          ...post,
          taggedProducts: populatedProducts
        };
      }
      return post;
    });
  }

  // === POST CRUD ENDPOINTS ===

  /**
   * GET /posts
   * Get feed posts (paginated, sorted by recent)
   * Automatically populates tagged products with full product data
   */
  async get_index(data, params) {
    const {
      businessId,
      userId,
      type,
      limit = 20,
      offset = 0
    } = params;

    console.log('📝 GET /posts - Params:', { businessId, userId, type, limit, offset });

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
      console.log('🔍 Filtering by type:', type);
    }

    const posts = await this.findWhere(filters);
    console.log(`📊 Found ${posts.length} posts matching filters`);

    // Log first few posts for debugging
    if (posts.length > 0) {
      console.log('🎬 First post types:', posts.slice(0, 3).map(p => ({ id: p.id, type: p.type })));
    }

    // Sort by published date (newest first) and paginate
    const paginatedPosts = posts
      .sort((a, b) => b.publishedAt?.toMillis() - a.publishedAt?.toMillis())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Populate business info first, then tagged products
    const postsWithBusiness = await this.populateBusinessInfo(paginatedPosts);
    return await this.populateTaggedProducts(postsWithBusiness);
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
   * Create new post with media processing
   * Expects: { caption, type, mediaFiles, taggedProducts }
   */
  async post_index(data, params) {
    const { businessId, userId } = params;

    if (!businessId || !userId) {
      throw new Error('businessId and userId are required');
    }

    console.log('📤 [Posts API] Creating post with media processing');
    console.log('   Type:', data.type);
    console.log('   Media files:', data.mediaFiles?.length || 0);

    let processedMedia = [];
    let thumbnailUrl = '';

    // Step 1: Process media through Media Service (backend simulation)
    if (data.type === 'video' && data.mediaFiles && data.mediaFiles.length > 0) {
      console.log('🎬 [Posts API] Processing video');
      const { videoUrl, thumbnailUrl: vidThumbnail } = await MediaProcessingService.processVideo(
        data.mediaFiles[0],
        'posts'
      );

      processedMedia = [{
        type: 'video',
        url: videoUrl,
        thumbnailUrl: vidThumbnail
      }];
      thumbnailUrl = vidThumbnail;

    } else if ((data.type === 'image' || data.type === 'carousel') && data.mediaFiles && data.mediaFiles.length > 0) {
      console.log(`🖼️ [Posts API] Processing ${data.mediaFiles.length} image(s)`);
      const imageUrls = await MediaProcessingService.processImages(data.mediaFiles, 'posts');

      processedMedia = imageUrls.map(url => ({
        type: 'image',
        url: url,
        thumbnailUrl: url
      }));
      thumbnailUrl = imageUrls[0];
    }

    // Step 2: Create post document with processed media URLs
    const postData = {
      caption: data.caption || '',
      type: data.type,
      media: processedMedia,
      thumbnailUrl,
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

    console.log('💾 [Posts API] Saving post to database');
    const createdPost = await this.create(postData);
    console.log('✅ [Posts API] Post created successfully:', createdPost.id);

    return createdPost;
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
