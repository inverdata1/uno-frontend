import { BaseFirebaseService } from '../base-firebase-service';
import { COLLECTION_NAME } from './collection';
import { serverTimestamp } from 'firebase/firestore';

/**
 * Products Resource
 * Handles product catalog operations for businesses
 */
export class ProductsResource extends BaseFirebaseService {
  constructor(client) {
    super(client, COLLECTION_NAME);
  }

  /**
   * Handle incoming requests and route to appropriate method
   */
  async handle(method, action, data, params) {
    const handler = `${method.toLowerCase()}_${action.replace(/\//g, '_')}`;

    if (typeof this[handler] !== 'function') {
      throw new Error(`Handler ${handler} not found in ProductsResource`);
    }

    return await this[handler](data, params);
  }

  // === PRODUCT CRUD ENDPOINTS ===

  /**
   * GET /products
   * Get all active products (with optional filters)
   */
  async get_index(data, params) {
    const { businessId, categoryId, featured, limit = 50 } = params;

    const filters = [['isActive', '==', true]];

    if (businessId) {
      filters.push(['businessId', '==', businessId]);
    }

    if (categoryId) {
      filters.push(['categoryId', '==', categoryId]);
    }

    if (featured === 'true') {
      filters.push(['isFeatured', '==', true]);
    }

    const products = await this.findWhere(filters);

    // Sort by creation date (newest first) and limit
    return products
      .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, parseInt(limit));
  }

  /**
   * GET /products/{id}
   * Get specific product and increment view count
   */
  async get_id(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count asynchronously (don't wait)
    this.update(id, {
      viewCount: (product.viewCount || 0) + 1,
      updatedAt: serverTimestamp()
    }).catch(err => console.error('Failed to increment view count:', err));

    return product;
  }

  /**
   * POST /products
   * Create new product
   */
  async post_index(data, params) {
    const { businessId } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    const productData = {
      ...data,
      businessId,
      currency: data.currency || 'USD',
      stock: data.stock || 0,
      trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
      hasVariants: data.hasVariants || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      isFeatured: data.isFeatured || false,
      viewCount: 0,
      favoriteCount: 0,
      orderCount: 0,
      rating: 0,
      reviewCount: 0
    };

    const newProduct = await this.create(productData);

    // Increment category product count
    if (data.categoryId) {
      const categoriesResource = this.client.getResource('categories');
      await categoriesResource.handle('PATCH', `${data.categoryId}/increment-products`, {}, {});
    }

    return newProduct;
  }

  /**
   * PUT /products/{id}
   * Update product
   */
  async put_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    // Handle category change
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const categoriesResource = this.client.getResource('categories');

      // Decrement old category
      await categoriesResource.handle('PATCH', `${product.categoryId}/decrement-products`, {}, {});

      // Increment new category
      await categoriesResource.handle('PATCH', `${data.categoryId}/increment-products`, {}, {});
    }

    return await this.update(id, data);
  }

  /**
   * DELETE /products/{id}
   * Soft delete product (mark as inactive)
   */
  async delete_id(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    // Decrement category count
    if (product.categoryId) {
      const categoriesResource = this.client.getResource('categories');
      await categoriesResource.handle('PATCH', `${product.categoryId}/decrement-products`, {}, {});
    }

    return await this.update(id, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  }

  // === SPECIAL ENDPOINTS ===

  /**
   * GET /products/business/{businessId}
   * Get all products for a business
   */
  async get_business_id(data, params) {
    const { id: businessId } = params;

    return await this.findWhere([
      ['businessId', '==', businessId],
      ['isActive', '==', true]
    ]);
  }

  /**
   * GET /products/category/{categoryId}
   * Get all products in a category
   */
  async get_category_id(data, params) {
    const { id: categoryId } = params;

    return await this.findWhere([
      ['categoryId', '==', categoryId],
      ['isActive', '==', true]
    ]);
  }

  /**
   * GET /products/featured
   * Get featured products
   */
  async get_featured() {
    const products = await this.findWhere([
      ['isActive', '==', true],
      ['isFeatured', '==', true]
    ]);

    return products.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }

  /**
   * PATCH /products/{id}/stock
   * Update product stock
   */
  async patch_id_stock(data, params) {
    const { businessId, id } = params;
    const { quantity, operation = 'set' } = data;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    let newStock;
    if (operation === 'increment') {
      newStock = product.stock + quantity;
    } else if (operation === 'decrement') {
      newStock = Math.max(0, product.stock - quantity);
    } else {
      newStock = quantity;
    }

    return await this.update(id, {
      stock: newStock,
      isAvailable: newStock > 0,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /products/{id}/toggle-featured
   * Toggle featured status
   */
  async patch_id_toggle_featured(data, params) {
    const { businessId, id } = params;

    if (!businessId) {
      throw new Error('businessId is required');
    }

    // Verify ownership
    const product = await this.findById(id);
    if (product.businessId !== businessId) {
      throw new Error('Product not found or access denied');
    }

    return await this.update(id, {
      isFeatured: !product.isFeatured,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /products/{id}/increment-favorites
   * Increment favorite count
   */
  async patch_id_increment_favorites(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    return await this.update(id, {
      favoriteCount: (product.favoriteCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * PATCH /products/{id}/decrement-favorites
   * Decrement favorite count
   */
  async patch_id_decrement_favorites(data, params) {
    const { id } = params;
    const product = await this.findById(id);

    return await this.update(id, {
      favoriteCount: Math.max((product.favoriteCount || 0) - 1, 0),
      updatedAt: serverTimestamp()
    });
  }
}
