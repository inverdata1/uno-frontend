import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME, FAVORITE_TYPES } from './collection';

/**
 * Favorites Resource
 * Handles user saved items (products and posts)
 */
export class FavoritesResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in FavoritesResource`);
    }

    return await this[handler](data, params);
  }

  // === FAVORITES CRUD ENDPOINTS ===

  /**
   * GET /favorites
   * Get all favorites for user (optionally filtered by type)
   */
  async get_index(data, params) {
    const { userId, itemType } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    const filters = [['userId', '==', userId]];

    if (itemType) {
      filters.push(['itemType', '==', itemType]);
    }

    const favorites = await this.findWhere(filters);

    // Sort by creation date (newest first)
    return favorites.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * POST /favorites
   * Add item to favorites
   */
  async post_index(data, params) {
    const { userId } = params;
    const { itemType, itemId, metadata } = data;

    if (!userId) {
      throw new Error('userId is required');
    }

    if (!itemType || !itemId) {
      throw new Error('itemType and itemId are required');
    }

    // Check if already favorited
    const existing = await this.findOne([
      ['userId', '==', userId],
      ['itemId', '==', itemId]
    ]);

    if (existing) {
      return existing; // Already favorited
    }

    const favoriteData = {
      userId,
      itemType,
      itemId,
      metadata: metadata || null
    };

    // Create favorite
    const favorite = await this.create(favoriteData);

    // Increment favorite count on the item
    await this.incrementItemFavoriteCount(itemType, itemId);

    return favorite;
  }

  /**
   * DELETE /favorites/{id}
   * Remove item from favorites
   */
  async delete_id(data, params) {
    const { userId, id } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Verify ownership
    const favorite = await this.findById(id);
    if (favorite.userId !== userId) {
      throw new Error('Favorite not found or access denied');
    }

    // Decrement favorite count on the item
    await this.decrementItemFavoriteCount(favorite.itemType, favorite.itemId);

    // Delete favorite
    return await this.delete(id);
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /favorites/products
   * Get only favorited products
   */
  async get_products(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    const favorites = await this.findWhere([
      ['userId', '==', userId],
      ['itemType', '==', FAVORITE_TYPES.PRODUCT]
    ]);

    return favorites.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * GET /favorites/posts
   * Get only favorited posts
   */
  async get_posts(data, params) {
    const { userId } = params;

    if (!userId) {
      throw new Error('userId is required');
    }

    const favorites = await this.findWhere([
      ['userId', '==', userId],
      ['itemType', '==', FAVORITE_TYPES.POST]
    ]);

    return favorites.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * GET /favorites/check/{itemId}
   * Check if item is favorited by user
   */
  async get_check_id(data, params) {
    const { userId, id: itemId } = params;

    if (!userId || !itemId) {
      throw new Error('userId and itemId are required');
    }

    const favorite = await this.findOne([
      ['userId', '==', userId],
      ['itemId', '==', itemId]
    ]);

    return {
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null
    };
  }

  /**
   * POST /favorites/toggle
   * Toggle favorite status (add if not favorited, remove if favorited)
   */
  async post_toggle(data, params) {
    const { userId } = params;
    const { itemType, itemId, metadata } = data;

    if (!userId || !itemType || !itemId) {
      throw new Error('userId, itemType, and itemId are required');
    }

    // Check if already favorited
    const existing = await this.findOne([
      ['userId', '==', userId],
      ['itemId', '==', itemId]
    ]);

    if (existing) {
      // Remove favorite
      await this.decrementItemFavoriteCount(existing.itemType, existing.itemId);
      await this.delete(existing.id);

      return {
        action: 'removed',
        isFavorited: false
      };
    } else {
      // Add favorite
      const favorite = await this.create({
        userId,
        itemType,
        itemId,
        metadata: metadata || null
      });

      await this.incrementItemFavoriteCount(itemType, itemId);

      return {
        action: 'added',
        isFavorited: true,
        favorite
      };
    }
  }

  /**
   * DELETE /favorites/item/{itemId}
   * Remove favorite by item ID (instead of favorite ID)
   */
  async delete_item_id(data, params) {
    const { userId, id: itemId } = params;

    if (!userId || !itemId) {
      throw new Error('userId and itemId are required');
    }

    const favorite = await this.findOne([
      ['userId', '==', userId],
      ['itemId', '==', itemId]
    ]);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    await this.decrementItemFavoriteCount(favorite.itemType, favorite.itemId);

    return await this.delete(favorite.id);
  }

  // === UTILITY METHODS ===

  /**
   * Increment favorite count on item
   */
  async incrementItemFavoriteCount(itemType, itemId) {
    try {
      if (itemType === FAVORITE_TYPES.PRODUCT) {
        const productsResource = this.client.getResource('products');
        await productsResource.handle('PATCH', `${itemId}/increment-favorites`, {}, {});
      } else if (itemType === FAVORITE_TYPES.POST) {
        const postsResource = this.client.getResource('posts');
        await postsResource.handle('PATCH', `${itemId}/save`, {}, { id: itemId });
      }
    } catch (error) {
      console.error('Failed to increment favorite count:', error);
    }
  }

  /**
   * Decrement favorite count on item
   */
  async decrementItemFavoriteCount(itemType, itemId) {
    try {
      if (itemType === FAVORITE_TYPES.PRODUCT) {
        const productsResource = this.client.getResource('products');
        await productsResource.handle('PATCH', `${itemId}/decrement-favorites`, {}, {});
      } else if (itemType === FAVORITE_TYPES.POST) {
        const postsResource = this.client.getResource('posts');
        await postsResource.handle('PATCH', `${itemId}/unsave`, {}, { id: itemId });
      }
    } catch (error) {
      console.error('Failed to decrement favorite count:', error);
    }
  }
}
